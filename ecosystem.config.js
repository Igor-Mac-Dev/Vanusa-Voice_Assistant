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
         name: 'V-node-red',
         script: 'node-red',
         exec_mode: 'fork',
         args: '-u . -s ./assets/RED-VoiceAssist.json',
         instances: 1,
         watch: false,
      },
      {
         name: 'Vanusa-monitor',
         script: './dist/utils/monitor.js',
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
