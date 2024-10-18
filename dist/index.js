import * as workers from './workers/workers-handler';
(async () => {
    try {
        await main();
    }
    catch (e) {
        workers.handlers.error(e);
    }
})();
async function main() {
    workers.handlers.start();
}
workers.controll.on('message', message => {
    console.log('controll parent Received: ', message);
});
function start() { }
//# sourceMappingURL=index.js.map