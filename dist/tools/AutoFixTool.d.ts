/**
 * 自动修复工具
 * 检测问题并自动修复
 */
import { Tool, ToolResult } from './Tool';
export declare class AutoFixTool implements Tool {
    name: string;
    description: string;
    version: string;
    execute(): Promise<ToolResult>;
    /** 检测问题 */
    private detectIssues;
    /** 修复问题 */
    private fixIssues;
    /** 验证修复 */
    private verifyFixes;
}
//# sourceMappingURL=AutoFixTool.d.ts.map