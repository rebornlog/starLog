module.exports = {
  apps: [
    {
      name: 'starlog-frontend',
      cwd: '/home/admin/.openclaw/workspace/starLog',
      script: 'npm',
      args: 'run dev',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: '3000',
        DATABASE_URL: 'postgresql://starlog:starlog123@localhost:5432/starlog?connection_limit=10',
        REDIS_URL: 'redis://localhost:6379',
        NEXT_PUBLIC_FUND_API: 'http://47.79.20.10:8082'
      },
      error_file: '/tmp/starlog-frontend-error.log',
      out_file: '/tmp/starlog-frontend-out.log',
      log_file: '/tmp/starlog-frontend-combined.log',
      time: true,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'finance-api',
      cwd: '/home/admin/.openclaw/workspace/starLog',
      script: 'services/finance/venv/bin/python',
      args: '-m uvicorn services.finance.main:app --host 0.0.0.0 --port 8081',
      interpreter: 'none',
      error_file: '/tmp/finance-api-error.log',
      out_file: '/tmp/finance-api-out.log',
      log_file: '/tmp/finance-api-combined.log',
      time: true,
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'fund-api',
      cwd: '/home/admin/.openclaw/workspace/starLog/services/finance',
      script: 'venv/bin/python',
      args: '-m uvicorn fund_api:app --host 0.0.0.0 --port 8082',
      interpreter: 'none',
      error_file: '/tmp/fund-api-error.log',
      out_file: '/tmp/fund-api-out.log',
      log_file: '/tmp/fund-api-combined.log',
      time: true,
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'api-proxy',
      cwd: '/home/admin/.openclaw/workspace/starLog',
      script: 'scripts/api-proxy-simple.js',
      interpreter: 'node',
      env: {
        PORT: '3001'
      },
      error_file: '/tmp/api-proxy-error.log',
      out_file: '/tmp/api-proxy-out.log',
      log_file: '/tmp/api-proxy-combined.log',
      time: true,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
