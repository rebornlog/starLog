module.exports = {
  apps: [
    {
      name: 'starlog-frontend',
      cwd: '/home/admin/.openclaw/workspace/starLog',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      interpreter: 'node',
      max_memory_restart: '500M',
      kill_timeout: 10000,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        DATABASE_URL: 'postgresql://starlog:starlog123@localhost:5432/starlog?connection_limit=10',
        REDIS_URL: 'redis://localhost:6379',
      },
      error_file: '/home/admin/.openclaw/workspace/starLog/logs/pm2-error.log',
      out_file: '/home/admin/.openclaw/workspace/starLog/logs/pm2-out.log',
      log_file: '/home/admin/.openclaw/workspace/starLog/logs/pm2-combined.log',
      time: true,
      merge_logs: true,
    },
    {
      name: 'finance-api',
      cwd: '/home/admin/.openclaw/workspace/starLog/services/finance',
      script: 'main.py',
      interpreter: 'python3',
      max_memory_restart: '300M',
      kill_timeout: 5000,
      restart_delay: 3000,
      env: {
        PYTHONPATH: '/home/admin/.openclaw/workspace/starLog/services',
      },
    },
    {
      name: 'fund-api',
      cwd: '/home/admin/.openclaw/workspace/starLog/services/finance',
      script: 'fund_api.py',
      interpreter: 'python3',
      max_memory_restart: '200M',
      kill_timeout: 5000,
      restart_delay: 3000,
      env: {
        PYTHONPATH: '/home/admin/.openclaw/workspace/starLog/services',
      },
    },
  ],
};
