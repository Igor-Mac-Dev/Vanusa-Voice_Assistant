const language = document.getElementById('lang_en');
const autoStart = document.getElementById('autoStart');
const silenceLenght = document.getElementById('cobraLength');
const socket = new WebSocket('ws://localhost:%%PORT%%');

console.log('WS port: %%PORT%%');
socket.addEventListener('open', () => {
   console.log('Connected to the server');
});

socket.addEventListener('message', event => {
   console.log('Received from server:', event.data);
   const confs = JSON.parse(event.data);
   language.value = confs[0];
   autoStart.checked = confs[1];
   silenceLenght.value = confs[5];
});

socket.addEventListener('close', () => {
   console.log('Disconnected from the server');
   window.close();
});

socket.addEventListener('error', error => {
   console.error('WebSocket error:', error);
});

document.getElementById('cobraLength').addEventListener('change', () => {
   if (socket.readyState === WebSocket.OPEN) {
      const message = ['CAGO', 'Peido', 'fi, do'];
      socket.send(JSON.stringify(message));
      console.log('Mensagem enviada:', message);
   } else {
      console.log('WebSocket não está conectado.');
   }
});
