const canvas = document.getElementById('Vanusa');
const ctx = canvas.getContext('2d');
let fontSize = 100;
const text = 'VANUSA';
const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();
let x = 30;
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);

function drawMask() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.globalCompositeOperation = 'source-over';
   ctx.fillStyle = 'rgb(12, 6, 6)';
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   // Definir a área que será transparente (texto)
   ctx.globalCompositeOperation = 'destination-out';
   ctx.font = `${fontSize}px 'Zen Tokyo Zoo'`;
   ctx.textAlign = 'start';
   ctx.textBaseline = 'top';
   ctx.fillText(text, x, 20);
}

function animate() {
   if (fontSize >= 80) {
      fontSize -= 0.3;
      x -= 0.3;
   } else {
      return;
   }

   drawMask();

   requestAnimationFrame(animate);
}

setTimeout(() => {
   drawMask();
}, 200);

setTimeout(() => {
   animate();
}, 1000);
