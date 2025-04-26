const ctx = document.createElement("canvas").getContext("2d");
ctx.canvas.width = 1920;
ctx.canvas.height = 1080;
 
let canvasWidth = 1920;
let canvasHeight = 1080;

let background = new Image();
background.src = "./assets/stars.jpg";

function getCanvasTexture() {
    ctx.drawImage(background, 0, 0);
    return ctx.canvas;
}