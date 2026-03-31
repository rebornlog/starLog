#!/bin/bash
# Frontend startup wrapper - aggressive port cleanup

cd /home/admin/.openclaw/workspace/starLog

echo "🚀 Starting frontend..."
echo "🧹 Cleaning port 3000..."

# Kill any existing next-server processes FIRST
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "next.*start" 2>/dev/null || true

# Wait for processes to die
sleep 3

# Clean port 3000 using fuser
if command -v fuser &> /dev/null; then
    fuser -k -9 3000/tcp 2>/dev/null || true
fi

# Clean port 3000 using lsof
PIDS=$(lsof -t -i:3000 2>/dev/null || true)
if [ -n "$PIDS" ]; then
    echo "⚠️  Killing: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
fi

# Wait and verify port is free (up to 10 seconds)
echo "⏳ Verifying port is free..."
for i in {1..10}; do
    if ! lsof -i:3000 &>/dev/null; then
        echo "✅ Port 3000 free after ${i}s"
        break
    fi
    echo "  Waiting... (${i}/10)"
    sleep 1
done

# Final check
if lsof -i:3000 &>/dev/null; then
    echo "❌ Port 3000 still occupied!"
    lsof -i:3000
    exit 1
fi

echo "✅ Starting Next.js..."
exec npm start
