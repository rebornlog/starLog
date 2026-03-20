"""
基金 API 路由
提供实时基金数据接口
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import asyncio
import sys
sys.path.insert(0, '/home/admin/.openclaw/workspace/starLog/services')
from tiantian_fund import TianTianFundAPI, get_fund_netvalue_sync, get_funds_batch_sync
from data.funds import funds as static_funds

router = APIRouter(prefix="/api/funds", tags=["funds"])

@router.get("/")
async def get_funds(
    type: Optional[str] = None,
    risk: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "code",
    sort_order: str = "asc",
    limit: int = 100
) -> Dict[str, Any]:
    """
    获取基金列表（使用静态数据 + 实时净值）
    """
    result = static_funds.copy()
    
    # 类型筛选
    if type and type != "全部":
        result = [f for f in result if f.get('type') == type]
    
    # 风险等级筛选
    if risk and risk != "全部":
        result = [f for f in result if f.get('riskLevel') == risk]
    
    # 搜索
    if search:
        search_lower = search.lower()
        result = [f for f in result if search_lower in f.get('code', '') or search_lower in f.get('name', '').lower()]
    
    # 排序
    reverse = sort_order == "desc"
    if sort_by == "code":
        result.sort(key=lambda x: x.get('code', ''), reverse=reverse)
    elif sort_by == "netValue":
        result.sort(key=lambda x: x.get('netValue', 0), reverse=reverse)
    elif sort_by == "changePercent":
        result.sort(key=lambda x: x.get('changePercent', 0), reverse=reverse)
    
    # 限制数量
    result = result[:limit]
    
    return {
        "success": True,
        "count": len(result),
        "data": result
    }


@router.get("/{code}")
async def get_fund_detail(code: str) -> Dict[str, Any]:
    """
    获取基金详情（实时数据）
    """
    # 先从静态数据找基本信息
    static_fund = next((f for f in static_funds if f['code'] == code), None)
    
    # 获取实时净值
    try:
        realtime_data = await asyncio.get_event_loop().run_in_executor(
            None, get_fund_netvalue_sync, code
        )
    except Exception as e:
        realtime_data = None
    
    if not static_fund and not realtime_data:
        raise HTTPException(status_code=404, detail="基金不存在")
    
    # 合并数据（实时数据优先）
    if realtime_data:
        fund = {
            **(static_fund or {}),
            **realtime_data,
            "code": code
        }
    else:
        fund = static_fund
    
    return {
        "success": True,
        "data": fund,
        "source": "realtime" if realtime_data else "static"
    }


@router.get("/{code}/history")
async def get_fund_history(
    code: str,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100)
) -> Dict[str, Any]:
    """
    获取基金历史净值
    """
    api = TianTianFundAPI()
    
    try:
        history = await api.get_fund_history(code, page, size)
        
        if history is None:
            raise HTTPException(status_code=404, detail="无法获取历史数据")
        
        return {
            "success": True,
            "data": history,
            "page": page,
            "size": size
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取历史数据失败：{str(e)}")


@router.post("/batch")
async def get_funds_batch(codes: List[str]) -> Dict[str, Any]:
    """
    批量获取基金净值
    """
    if not codes or len(codes) > 50:
        raise HTTPException(status_code=400, detail="基金代码数量必须在 1-50 之间")
    
    try:
        results = await asyncio.get_event_loop().run_in_executor(
            None, get_funds_batch_sync, codes
        )
        
        return {
            "success": True,
            "count": len(results),
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"批量获取失败：{str(e)}")


@router.get("/{code}/refresh")
async def refresh_fund_netvalue(code: str) -> Dict[str, Any]:
    """
    强制刷新基金净值
    """
    try:
        realtime_data = await asyncio.get_event_loop().run_in_executor(
            None, get_fund_netvalue_sync, code
        )
        
        if not realtime_data:
            raise HTTPException(status_code=404, detail="无法获取实时数据")
        
        return {
            "success": True,
            "data": realtime_data,
            "message": "实时数据已更新"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"刷新失败：{str(e)}")
