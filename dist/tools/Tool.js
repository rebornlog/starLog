"use strict";
/**
 * 工具接口定义
 * 所有自动化工具必须实现此接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistry = void 0;
/** 工具注册表 */
class ToolRegistry {
    static tools = new Map();
    /** 注册工具 */
    static register(tool, alias) {
        const name = alias || tool.name.toLowerCase().replace('tool', '');
        this.tools.set(name, tool);
        console.log(`✅ 工具已注册：${name}`);
    }
    /** 获取工具 */
    static get(name) {
        return this.tools.get(name);
    }
    /** 列出所有工具 */
    static list() {
        return Array.from(this.tools.values());
    }
}
exports.ToolRegistry = ToolRegistry;
//# sourceMappingURL=Tool.js.map