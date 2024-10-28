import { parentPort } from 'worker_threads';
import errorLog from '../utils/error.js';
import successLog from '../utils/sucess.js';
import completion from '../OpenAI/completion.js';
parentPort?.on('message', event => {
    console.log('child utils received:', event);
    if (Array.isArray(event)) {
        switch (event[0]) {
            case 'error':
                errorLog(event[1]);
                break;
            case 'success':
                successLog(event[1]);
                break;
            case 'completion':
                completion(event[1])
                    .then(result => {
                    parentPort?.postMessage(['completion', result]);
                })
                    .catch(err => {
                    parentPort?.postMessage(['error', err]);
                });
                break;
            case 'abort':
                //...
                break;
            default:
                console.log('Unknown utils event received:', event);
        }
    }
    else {
        console.log('Invalid utils event received:', event);
    }
});
//# sourceMappingURL=w-utils.js.map