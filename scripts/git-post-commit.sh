#!/bin/bash

# Git post-commit hook - 自动记录代码提交到记忆
# 安装：cp scripts/git-post-commit.sh .git/hooks/post-commit && chmod +x .git/hooks/post-commit

MEMORY_DIR=~/.openclaw/workspace/memory
TODAY=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
TODAY_FILE="$MEMORY_DIR/${TODAY}.md"

# 获取提交信息
COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_HASH=$(git log -1 --pretty=%h)
FILES_CHANGED=$(git diff-tree --no-commit-id --name-only -r HEAD | wc -l)

# 如果今日记忆文件不存在，创建它
if [ ! -f "$TODAY_FILE" ]; then
    cat > "$TODAY_FILE" << EOF
# ${TODAY} 记忆日志

## 📅 今日重点
- 上午：
- 下午：

## 🔧 动作记录

## 💡 重要决策

## 📊 系统状态

## 🎯 下一步

EOF
fi

# 记录提交到记忆
cat >> "$TODAY_FILE" << EOF

### $TIME - Git 提交 ($COMMIT_HASH)
- **动作：** 代码提交
- **文件：** $FILES_CHANGED 个文件
- **信息：** $COMMIT_MSG
- **结果：** ✅

EOF

echo "✅ 已记录提交到记忆：$TODAY_FILE"
