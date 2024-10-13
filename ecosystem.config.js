export default {
   apps: [
      {
         name: 'Vanusa-main',
         script: './dist/index.js',
         watch: false,
         autorestart: false,
         env: {
            VANUSA_ENV: 'production',
         },
         error_file: './logs/main-error.log',
         out_file: './logs/main-out.log',
         instances: 1,
      },
      {
         name: 'Vanusa-safe',
         script: './dist/safe-index.js',
         watch: false,
         autorestart: false,
         env: {
            NODE_ENV: 'production',
         },
         error_file: './logs/safe-error.log',
         out_file: './logs/safe-out.log',
         instances: 0,
      },
      {
         name: 'node-red-V',
         script: 'node-red',
         exec_mode: 'fork',
         args: '-u . -s ./dist/process-files/VoiceAssist.json',
         instances: 1,
         watch: false,
      },
      {
         name: 'Vanusa-monitor',
         script: './monitor.js',
         watch: false,
         autorestart: true,
         env: {
            NODE_ENV: 'production',
         },
         error_file: './logs/monitor-error.log',
         out_file: './logs/monitor-out.log',
         instances: 1,
      },
   ],
};
