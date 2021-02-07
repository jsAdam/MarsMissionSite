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

// class StarBackground {
//     constructor() {
//         this.ctx = document.createElement("canvas").getContext("2d");
//         this.ctx.canvas.width = 1920;
//         this.ctx.canvas.height = 1080;

//         let background = new Image();
//         background.src = "./assets/stars.jpg";

//         this.ctx.drawImage(background, 0, 0);

//         let texture = new THREE.CanvasTexture(this.ctx.canvas);
//         texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

//         let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
//         let geometry = new THREE.PlaneGeometry(21.4, 12, 0);

//         let mesh = new THREE.Mesh(geometry, material);
//         mesh.position.set(0, 0, -3);
//         scene.add(mesh);

//         this.starTime = CLOCK.getElapsedTime();
//         this.starTimer = 3000 + Math.round(Math.random() * 10000);
//         this.stars = [];
//     }

//     moveStars() {
//         if(CLOCK.getElapsedTime() > this.starTime + this.starTimer) {
//             this.starTime = CLOCK.getElapsedTime();
//             this.starTimer = 3000 + Math.round(Math.random() * 10000);
            
//             let randX = Math.random() * this.ctx.canvas.width;
//             let randY = Math.random() * this.ctx.canvas.height;

//             this.stars.push(new Star(randX, randY));
//         }

//         for(let i = this.stars.length - 1; i >= 0; i--) {
//             this.stars[i].update();
//             this.stars[i].show();

//             if(this.stars[i].lifespan < 0) {
//                 this.stars.splice(i, 1);
//             }
//         }
//     }
// }

// class Star {
//     constructor(x, y) {
//         this.x = x;
//         this.y = y;
//         this.vx = Math.random() * 3;
//         this.vy = Math.random() * 3;
//         this.r = Math.ceil(Math.random() * 3);
//         this.lifespan = 255;
//     }

//     update() {
//         this.x += this.vx;
//         this.y += this.vy;
//     }

//     show() {
//         ctx.fillStyle = `rgba(255, 255, 255, ${this.lifespan/255})`;
//         ctx.beginPath();
//         ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
//         ctx.fill();
//         this.lifespan -= 2;
//     }
// }