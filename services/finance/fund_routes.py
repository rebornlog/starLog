"""
基金 API 路由
提供实时基金数据接口
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import asyncio
import sys
import os
# 添加父目录到路径（/home/admin/.openclaw/workspace/starLog/services）
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
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


@router.post("/batch")
@router.get("/batch")
async def get_funds_batch(codes: str = Query(default="", description="基金代码，逗号分隔，如：000001,000002")) -> Dict[str, Any]:
    """
    批量获取基金净值（支持 GET 和 POST）
    GET: /api/funds/batch?codes=000001,000002,110022
    POST: /api/funds/batch {"codes": ["000001", "000002"]}
    """
    print(f"DEBUG batch: codes={codes}, type={type(codes)}")
    
    if not codes:
        raise HTTPException(status_code=400, detail="基金代码不能为空")
    
    # 拆分逗号分隔的字符串
    codes_list = [c.strip() for c in codes.split(',')]
    print(f"DEBUG batch: 拆分后 codes_list={codes_list}")
    
    if len(codes_list) > 50:
        raise HTTPException(status_code=400, detail="基金代码数量必须在 1-50 之间")
    
    try:
        print(f"DEBUG batch: 调用 get_funds_batch_sync, codes={codes_list}")
        results = await asyncio.get_event_loop().run_in_executor(
            None, get_funds_batch_sync, codes_list
        )
        print(f"DEBUG batch: 结果数量={len(results)}")
        
        return {
            "success": True,
            "count": len(results),
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"批量获取失败：{str(e)}")


@router.get("/{code}")
async def get_fund_detail(code: str) -> Dict[str, Any]:
    """
    获取基金详情（实时数据）
    """
    # 调试日志
    print(f"DEBUG: 请求基金 {code}, static_funds 数量：{len(static_funds)}")
    
    # 先从静态数据找基本信息
    static_fund = next((f for f in static_funds if f['code'] == code), None)
    print(f"DEBUG: static_fund 找到：{bool(static_fund)}")
    
    # 获取实时净值
    realtime_data = None
    try:
        realtime_data = await asyncio.get_event_loop().run_in_executor(
            None, get_fund_netvalue_sync, code
        )
        print(f"DEBUG: realtime_data: {realtime_data is not None}")
        # 检查实时数据是否有效
        if realtime_data and not realtime_data.get('code'):
            realtime_data = None
    except Exception as e:
        # 静默失败，使用静态数据
        print(f"DEBUG: 实时数据获取失败：{e}")
        pass
    
    # 如果静态数据存在，直接返回（实时数据可能失败）
    if static_fund:
        # 尝试合并实时数据
        if realtime_data:
            fund = {**static_fund, **realtime_data, "code": code}
        else:
            fund = static_fund
        
        print(f"DEBUG: 返回静态数据，名称：{fund.get('name')}")
        return {
            "success": True,
            "data": fund,
            "source": "realtime" if realtime_data else "static"
        }
    
    # 没有静态数据，尝试只用实时数据
    if realtime_data:
        return {
            "success": True,
            "data": realtime_data,
            "source": "realtime"
        }
    
    # 都没有，返回 404
    print(f"DEBUG: 基金 {code} 不存在")
    raise HTTPException(status_code=404, detail="基金不存在")


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
