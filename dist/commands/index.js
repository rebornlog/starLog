"use strict";
/**
 * 命令入口
 * 统一命令注册和执行
 */
Object.defineProperty(exports, "__esModule", { value: true });
const AutoTestTool_1 = require("../tools/AutoTestTool");
const AutoFixTool_1 = require("../tools/AutoFixTool");
const AutoOptimizeTool_1 = require("../tools/AutoOptimizeTool");
const Tool_1 = require("../tools/Tool");
/** 注册所有工具 */
function registerTools() {
    Tool_1.ToolRegistry.register(new AutoTestTool_1.AutoTestTool(), 'auto-test');
    Tool_1.ToolRegistry.register(new AutoFixTool_1.AutoFixTool(), 'auto-fix');
    Tool_1.ToolRegistry.register(new AutoOptimizeTool_1.AutoOptimizeTool(), 'auto-optimize');
}
/** 执行命令 */
async function executeCommand(command, _args) {
    const tool = Tool_1.ToolRegistry.get(command);
    if (!tool) {
        console.error(`❌ 未知命令：${command}`);
        console.log('可用命令：', Tool_1.ToolRegistry.list().map(t => t.name).join(', '));
        process.exit(1);
    }
    console.log(`🚀 执行命令：${command}`);
    const result = await tool.execute();
    if (result.success) {
        console.log('✅ 执行成功:', result.message);
        if (result.data) {
            console.log('📊 数据:', JSON.stringify(result.data, null, 2));
        }
    }
    else {
        console.error('❌ 执行失败:', result.message);
        if (result.error) {
            console.error('🔴 错误:', result.error);
        }
        process.exit(1);
    }
}
/** 显示帮助 */
function showHelp() {
    console.log(`
🧬 自我进化系统 - 命令行工具

用法：evolution <command> [options]

可用命令:
  auto-test       自动测试网站功能
  auto-fix        自动检测并修复问题
  auto-optimize   自动优化性能、SEO、可访问性
  help            显示帮助信息

示例:
  evolution auto-test
  evolution auto-fix
  evolution auto-optimize
`);
}
/** 主函数 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (!command || command === 'help' || command === '--help' || command === '-h') {
        showHelp();
        return;
    }
    registerTools();
    await executeCommand(command, args.slice(1));
}
// 执行主函数
main().catch(error => {
    console.error('💥 未捕获的错误:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map