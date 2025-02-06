const socket = new WebSocket('ws://localhost:%%PORT%%');
const languagePT = document.getElementById('lang_pt');
const recordTime = document.getElementById('recordTime');
const selectedDevice = document.getElementById('selectedDevice');
const sensitivityww = document.getElementById('sensitivityww');
const sensitivitycmd = document.getElementById('sensitivitycmd');
const silenceLenght = document.getElementById('cobraLength');
const sttEngine = document.getElementById('sttEngine');
const ttsEngine = document.getElementById('ttsEngine');
const pvKey = document.getElementById('pvKey');
const autoStart = document.getElementById('autoStart');
const burstMode = document.getElementById('burstMode');
const oaiModel = document.getElementById('oaiModel');
const oaiUserDef = document.getElementById('oaiUserDef');
const oaiHistoryLength = document.getElementById('oaiHistoryLength');
const oaiTemperature = document.getElementById('oaiTemperature');
const oaiMaxTokens = document.getElementById('oaiMaxTokens');
const oaiKey = document.getElementById('oaiKey');
let mics;

const inputs = [
   recordTime,
   selectedDevice,
   sensitivityww,
   sensitivitycmd,
   silenceLenght,
   sttEngine,
   ttsEngine,
   pvKey,
   oaiModel,
   oaiUserDef,
   oaiHistoryLength,
   oaiTemperature,
   oaiMaxTokens,
   oaiKey,
];

function areAllInputsValid() {
   return inputs.every(input => input.checkValidity());
}

socket.addEventListener('open', () => {
   console.log('Connected to the server');
});

socket.addEventListener('message', event => {
   const confs = JSON.parse(event.data);
   if (confs.length > 2) {
      if (confs[0] == 'pt') {
         languagePT.checked = true;
      }
      autoStart.checked = confs[1];
      burstMode.checked = confs[2];
      recordTime.value = confs[3];
      sensitivityww.value = confs[5];
      sensitivitycmd.value = confs[6];
      silenceLenght.value = confs[7];
      sttEngine.value = confs[8];
      ttsEngine.value = confs[9];
      pvKey.value = confs[10];
      oaiModel.value = confs[11];
      oaiUserDef.value = confs[12];
      oaiHistoryLength.value = confs[13];
      oaiTemperature.value = confs[14];
      oaiMaxTokens.value = confs[15];
      oaiKey.value = confs[16];
   } else {
      mics = confs[0];
      selectedDevice.innerHTML = mics
         .map(
            (optionText, index) =>
               `<option value="${index}">${optionText}</option>`,
         )
         .join('');
   }
});

socket.addEventListener('close', () => {
   console.log('Disconnected from the server');
   window.close();
});

socket.addEventListener('error', error => {
   console.error('WebSocket error: ', error);
});

document.getElementById('save').addEventListener('click', () => {
   if (socket.readyState === WebSocket.OPEN && areAllInputsValid()) {
      if (languagePT.checked && ttsEngine.value === 'Picovoice') {
         alert(
            'Desculpe, o motor de conversão de texto em voz do Picovoice não suporta português até o momento do lançamento dessa versão.',
         );
         return;
      }
      const message = [
         languagePT.checked,
         autoStart.checked,
         burstMode.checked,
         recordTime.value,
         selectedDevice.value,
         sensitivityww.value,
         sensitivitycmd.value,
         silenceLenght.value,
         sttEngine.value,
         ttsEngine.value,
         pvKey.value,
         oaiModel.value,
         oaiUserDef.value,
         oaiHistoryLength.value,
         oaiTemperature.value,
         oaiMaxTokens.value,
         oaiKey.value,
      ];
      socket.send(JSON.stringify(message));
   } else {
      alert('Some inputs are invalid or Vanusa is not running.');
   }
});

document.getElementById('saveexit').addEventListener('click', () => {
   if (socket.readyState === WebSocket.OPEN && areAllInputsValid()) {
      const message = [
         languagePT.checked,
         autoStart.checked,
         burstMode.checked,
         recordTime.value,
         selectedDevice.value,
         sensitivityww.value,
         sensitivitycmd.value,
         silenceLenght.value,
         sttEngine.value,
         ttsEngine.value,
         pvKey.value,
         oaiModel.value,
         oaiUserDef.value,
         oaiHistoryLength.value,
         oaiTemperature.value,
         oaiMaxTokens.value,
         oaiKey.value,
         'exit', //must to be the last
      ];
      socket.send(JSON.stringify(message));
   } else {
      alert('Some inputs are invalid or Vanusa is not running.');
   }
});

document.getElementById('cancel').addEventListener('click', () => {
   if (socket.readyState === WebSocket.OPEN) {
      const message = 'cancel';
      socket.send(message);
   } else {
      console.log('WebSocket não está conectado.');
   }
});

document.getElementById('exit').addEventListener('click', () => {
   if (socket.readyState === WebSocket.OPEN) {
      const message = 'exit';
      socket.send(message);
   } else {
      console.log('WebSocket não está conectado.');
   }
});

window.addEventListener('beforeunload', () => {
   if (socket.readyState === WebSocket.OPEN) {
      const message = 'exit';
      socket.send(message);
   } else {
      console.log('WebSocket não está conectado.');
   }
});
