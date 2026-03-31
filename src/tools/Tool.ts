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
export class ToolRegistry {
  private static tools: Map<string, Tool> = new Map();
  
  /** 注册工具 */
  static register(tool: Tool, alias?: string): void {
    const name = alias || tool.name.toLowerCase().replace('tool', '');
    this.tools.set(name, tool);
    console.log(`✅ 工具已注册：${name}`);
  }
  
  /** 获取工具 */
  static get(name: string): Tool | undefined {
    return this.tools.get(name);
  }
  
  /** 列出所有工具 */
  static list(): Tool[] {
    return Array.from(this.tools.values());
  }
}
