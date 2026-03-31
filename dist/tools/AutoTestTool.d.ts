/**
 * 自动测试工具
 * 执行网站全面自动化测试
 */
import { Tool, ToolResult } from './Tool';
export declare class AutoTestTool implements Tool {
    name: string;
    description: string;
    version: string;
    execute(): Promise<ToolResult>;
    /** 测试页面加载 */
    private testPageLoad;
    /** 测试 API 端点 */
    private testAPI;
    /** 测试性能 */
    private testPerformance;
}
//# sourceMappingURL=AutoTestTool.d.ts.map