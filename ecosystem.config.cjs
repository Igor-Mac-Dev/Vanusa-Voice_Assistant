module.exports = {
   apps: [
      {
         name: 'V-node-red',
         script: './node_modules/node-red/red.js',
         exec_mode: 'cluster',
         args: './assets/VoiceAssist.json -p 21105',
         env: {
            PORT: 21105,
         },
         instances: 1,
         watch: false,
         max_restarts: 3,
         vizion: false,
         windowsHide: true,
      },
      {
         name: 'Vanusa-main',
         script: './dist/index.js',
         interpreter: 'node',
         exec_mode: 'cluster',
         watch: false,
         autorestart: false,
         env: {
            VANUSA_ENV: 'production',
         },
         instances: 1,
         max_memory_restart: '400M',
         max_restarts: 2,
         vizion: false,
         windowsHide: true,
      },
      {
         name: 'Vanusa-monitor',
         script: './dist/utils/PM2-monitor.js',
         interpreter: 'node',
         exec_mode: 'cluster',
         watch: false,
         autorestart: true,
         env: {
            NODE_ENV: 'production',
         },
         instances: 1,
         max_restarts: 3,
         vizion: false,
         windowsHide: true,
      },
   ],
};
