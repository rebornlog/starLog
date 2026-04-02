#!/bin/bash
# Frontend startup wrapper - fixed version (no lsof dependency)

cd /home/admin/.openclaw/workspace/starLog

echo "🚀 Starting frontend..."
echo "🧹 Cleaning port 3000..."

# Kill any existing next-server processes FIRST
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "next.*start" 2>/dev/null || true

# Wait for processes to die
sleep 3

# Clean port 3000 using fuser (if available)
if command -v fuser &> /dev/null; then
    fuser -k -9 3000/tcp 2>/dev/null || true
    sleep 2
fi

# Wait and verify port is free using netstat (up to 10 seconds)
echo "⏳ Verifying port is free..."
for i in {1..10}; do
    # Check if port 3000 is in LISTEN state
    if ! netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
        echo "✅ Port 3000 free after ${i}s"
        break
    fi
    echo "  Waiting... (${i}/10)"
    sleep 1
done

# Final check using netstat
if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "❌ Port 3000 still occupied!"
    netstat -tlnp 2>/dev/null | grep 3000
    exit 1
fi

echo "✅ Starting Next.js..."
# Use npm start without exec so PM2 can manage the process
npm start
