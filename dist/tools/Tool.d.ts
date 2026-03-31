/**
 * 工具接口定义
 * 所有自动化工具必须实现此接口
 */
export interface ToolResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}
export interface Tool {
    /** 工具名称 */
    name: string;
    /** 工具描述 */
    description: string;
    /** 执行工具 */
    execute: () => Promise<ToolResult>;
    /** 工具版本 */
    version?: string;
}
/** 工具注册表 */
export declare class ToolRegistry {
    private static tools;
    /** 注册工具 */
    static register(tool: Tool, alias?: string): void;
    /** 获取工具 */
    static get(name: string): Tool | undefined;
    /** 列出所有工具 */
    static list(): Tool[];
}
//# sourceMappingURL=Tool.d.ts.map