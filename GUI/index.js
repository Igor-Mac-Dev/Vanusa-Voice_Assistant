// const canvas = document.getElementById('maskCanvas');
// const ctx = canvas.getContext('2d');

// let fontSize = 30; // Tamanho inicial do texto
// let increasing = true; // Controle de aumento/diminuição do texto
// const maxFontSize = 100;
// const minFontSize = 30;
// const text = 'Aurora';

// function drawMask() {
//    // Limpa o canvas
//    ctx.clearRect(0, 0, canvas.width, canvas.height);

//    // Preencher o canvas com uma cor opaca
//    ctx.globalCompositeOperation = 'source-over';
//    ctx.fillStyle = 'rgba(150, 10, 100, 0.8)';
//    ctx.fillRect(0, 0, canvas.width, canvas.height);

//    // Definir a área que será transparente (texto)
//    ctx.globalCompositeOperation = 'destination-out';
//    ctx.font = `${fontSize}px Arial`;
//    ctx.textAlign = 'center';
//    ctx.textBaseline = 'middle';
//    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
//    console.log(ctx);
// }

// function animate() {
//    if (increasing) {
//       fontSize += 2;
//       if (fontSize >= maxFontSize) increasing = false;
//    } else {
//       fontSize -= 2;
//       if (fontSize <= minFontSize) increasing = true;
//    }

//    drawMask();

//    requestAnimationFrame(animate);
// }

// animate();
