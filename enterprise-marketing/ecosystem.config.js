module.exports = {
  apps: [
    {
      name: 'optibid-energy-platform',
      script: 'npm',
      args: 'start',
      cwd: '/workspace/enterprise-marketing',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ...process.env
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        SENTRY_ENVIRONMENT: 'production',
        DEBUG: 'optibid:*'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001,
        SENTRY_ENVIRONMENT: 'development',
        DEBUG: 'optibid:*'
      },
      env_test: {
        NODE_ENV: 'test',
        PORT: 3002,
        SENTRY_ENVIRONMENT: 'test',
        DEBUG: 'optibid:*'
      },
      // Process management
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      autorestart: true,
      
      // Logging
      log_file: '/var/log/optibid-energy/combined.log',
      out_file: '/var/log/optibid-energy/out.log',
      error_file: '/var/log/optibid-energy/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_timeout: 5000,
      
      // Monitoring and metrics
      monitoring: false, // Set to true if using PM2 monitoring
      
      // Watch and reload
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'coverage'],
      
      // Instance variables
      instance_var: 'INSTANCE_ID',
      
      // Cron jobs (if needed)
      cron_restart: '0 3 * * *', // Restart at 3 AM daily
      
      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: false,
      
      // Clustering specific
      exec_interpreter: 'node',
      exec_mode: 'cluster',
      
      // Namespace
      namespace: 'optibid-energy'
    },
    
    // Background workers
    {
      name: 'optibid-worker-email',
      script: 'node',
      args: 'scripts/workers/email-worker.js',
      cwd: '/workspace/enterprise-marketing',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'email',
        ...process.env
      },
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 4000,
      autorestart: true,
      log_file: '/var/log/optibid-energy/email-worker.log',
      error_file: '/var/log/optibid-energy/email-worker-error.log',
      watch: false
    },
    
    {
      name: 'optibid-worker-sms',
      script: 'node',
      args: 'scripts/workers/sms-worker.js',
      cwd: '/workspace/enterprise-marketing',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'sms',
        ...process.env
      },
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 4000,
      autorestart: true,
      log_file: '/var/log/optibid-energy/sms-worker.log',
      error_file: '/var/log/optibid-energy/sms-worker-error.log',
      watch: false
    },
    
    // Database maintenance worker
    {
      name: 'optibid-maintenance',
      script: 'node',
      args: 'scripts/workers/maintenance-worker.js',
      cwd: '/workspace/enterprise-marketing',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'maintenance',
        ...process.env
      },
      max_memory_restart: '256M',
      min_uptime: '10s',
      max_restarts: 3,
      restart_delay: 10000,
      autorestart: true,
      log_file: '/var/log/optibid-energy/maintenance.log',
      error_file: '/var/log/optibid-energy/maintenance-error.log',
      watch: false,
      cron_restart: '0 2 * * *' // Run daily maintenance at 2 AM
    },
    
    // Monitoring and health check worker
    {
      name: 'optibid-monitor',
      script: 'node',
      args: 'scripts/workers/monitoring-worker.js',
      cwd: '/workspace/enterprise-marketing',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'monitoring',
        ...process.env
      },
      max_memory_restart: '128M',
      min_uptime: '10s',
      max_restarts: 3,
      restart_delay: 5000,
      autorestart: true,
      log_file: '/var/log/optibid-energy/monitor.log',
      error_file: '/var/log/optibid-energy/monitor-error.log',
      watch: false
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['prod-server-1', 'prod-server-2'],
      ref: 'origin/main',
      repo: 'git@github.com:optibid/energy-platform.git',
      path: '/opt/optibid-energy',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    
    staging: {
      user: 'deploy',
      host: 'staging-server',
      ref: 'origin/develop',
      repo: 'git@github.com:optibid/energy-platform.git',
      path: '/opt/optibid-energy-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env development',
      env: {
        NODE_ENV: 'staging',
        SENTRY_ENVIRONMENT: 'staging'
      }
    }
  },

  // Global settings
  watch: false,
  ignore_watch: [
    'node_modules',
    'logs',
    'coverage',
    'uploads',
    '.git',
    '.svn',
    '.hg',
    '*.log',
    '*.pid',
    '.DS_Store',
    'Thumbs.db'
  ],
  
  // Log settings
  log_type: 'json',
  
  // Error handling
  kill_timeout: 5000,
  
  // Process listing
  list: {
    description: 'Show running processes',
    header: ' │ App name   │ id │ mode │ pid  │ status │ restart │ uptime │ memory │ cpu │ watching │',
    columns: [
      'App name',
      { name: 'id', width: 2 },
      { name: 'mode', width: 4 },
      { name: 'pid', width: 6 },
      { name: 'status', width: 10 },
      { name: 'restart', width: 8 },
      { name: 'uptime', width: 10 },
      { name: 'memory', width: 10 },
      { name: 'cpu', width: 8 },
      { name: 'watching', width: 10 }
    ]
  }
};