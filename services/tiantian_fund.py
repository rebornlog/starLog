"""
天天基金 API 服务
提供实时基金净值查询
"""
import httpx
import asyncio
from typing import Optional, Dict, Any, List

# 天天基金 API 基础 URL
TTJJ_API_BASE = "http://fundgz.1234567.com.cn/js"
TTJJ_DETAIL_API = "http://api.fund.eastmoney.com/f10/lsjz"

class TianTianFundAPI:
    """天天基金 API 客户端"""
    
    def __init__(self, timeout: int = 10):
        self.timeout = timeout
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "http://fund.eastmoney.com/"
        }
    
    async def get_fund_netvalue(self, code: str) -> Optional[Dict[str, Any]]:
        """
        获取基金实时净值
        
        Args:
            code: 基金代码（6 位数字）
            
        Returns:
            包含净值信息的字典，失败返回 None
        """
        url = f"{TTJJ_API_BASE}/{code}.js"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
                response = await client.get(url)
                
                if response.status_code == 200:
                    # 返回格式：jsonpgz({"fundcode":"005827","name":"易方达蓝筹精选混合",...})
                    content = response.text
                    if content.startswith("jsonpgz(") and content.endswith(");"):
                        import json
                        json_str = content[8:-2]
                        data = json.loads(json_str)
                        
                        return {
                            "code": data.get("fundcode", ""),
                            "name": data.get("name", ""),
                            "netValue": float(data.get("gsz", 0)),  # 估算净值
                            "unitNetValue": float(data.get("dwjz", 0)),  # 单位净值
                            "change": float(data.get("gszzl", 0)),  # 增长率
                            "changePercent": float(data.get("gszzl", 0)),  # 涨跌幅
                            "updateTime": data.get("gztime", ""),  # 更新时间
                            "lastUpdateTime": data.get("jzrq", "")  # 最新净值日期
                        }
        except Exception as e:
            print(f"获取基金 {code} 净值失败：{e}")
        
        return None
    
    async def get_fund_history(self, code: str, page: int = 1, size: int = 20) -> Optional[List[Dict[str, Any]]]:
        """
        获取基金历史净值
        
        Args:
            code: 基金代码
            page: 页码
            size: 每页数量
            
        Returns:
            历史净值列表
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
                params = {
                    "fundCode": code,
                    "pageIndex": page,
                    "pageSize": size,
                    "startDate": "",
                    "endDate": ""
                }
                response = await client.get(TTJJ_DETAIL_API, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("errcode") == 0:
                        history = []
                        for item in data.get("Data", {}).get("LSJZList", []):
                            history.append({
                                "date": item.get("FSRQ", ""),  # 日期
                                "unitNetValue": float(item.get("DWJZ", 0)),  # 单位净值
                                "accumulatedNetValue": float(item.get("LJJZ", 0)),  # 累计净值
                                "changePercent": float(item.get("JZZZL", 0))  # 日增长率
                            })
                        return history
        except Exception as e:
            print(f"获取基金 {code} 历史净值失败：{e}")
        
        return None
    
    async def get_funds_batch(self, codes: List[str]) -> List[Dict[str, Any]]:
        """
        批量获取基金净值
        
        Args:
            codes: 基金代码列表
            
        Returns:
            基金净值列表
        """
        tasks = [self.get_fund_netvalue(code) for code in codes]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        funds = []
        for result in results:
            if isinstance(result, dict) and result:
                funds.append(result)
        
        return funds


# 同步包装器（用于非异步环境）
def get_fund_netvalue_sync(code: str) -> Optional[Dict[str, Any]]:
    """同步获取基金净值"""
    api = TianTianFundAPI()
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(api.get_fund_netvalue(code))
    finally:
        loop.close()


def get_funds_batch_sync(codes: List[str]) -> List[Dict[str, Any]]:
    """同步批量获取基金净值"""
    api = TianTianFundAPI()
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(api.get_funds_batch(codes))
    finally:
        loop.close()


if __name__ == "__main__":
    # 测试
    import json
    
    async def test():
        api = TianTianFundAPI()
        
        # 测试单个基金
        result = await api.get_fund_netvalue("005827")
        if result:
            print("✅ 005827 净值:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        
        # 测试批量获取
        codes = ["005827", "003096", "161725", "510300"]
        results = await api.get_funds_batch(codes)
        print(f"\n✅ 批量获取 {len(results)} 只基金:")
        for fund in results:
            print(f"  {fund['code']} - {fund['name']}: ¥{fund['netValue']} ({fund['changePercent']}%)")
    
    asyncio.run(test())
