import * as THREE from "three";
import { scene } from '../scene';
import { millis } from "../utils/helpers";

class StarBackground {
    constructor() {
        // Create canvas
        this.ctx = document.createElement("canvas").getContext("2d");
        this.ctx.canvas.width = 1920;
        this.ctx.canvas.height = 1080;
 
        let background = new Image();
        background.src = "./assets/myCanvas.jpg";
        this.image = background;
 
        this.ctx.drawImage(background, 0, 0);
 
        // Create mesh
        this.texture = new THREE.CanvasTexture(this.ctx.canvas);
        let material = new THREE.MeshBasicMaterial({ map: this.texture });
        let geometry = new THREE.PlaneGeometry(1920, 1080, 0);
 
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, -500);
        scene.add(mesh);
 
        // Class variables
        this.starTime = millis();
        this.starTimer = Math.round(Math.random() * 1000);
        this.stars = [];
    }
 
    moveStars() {
        if(millis() > this.starTime + this.starTimer) {
            this.starTime = millis();
            this.starTimer = Math.round(Math.random() * 1000);
            
            let randX = Math.random() * this.ctx.canvas.width;
            let randY = Math.random() * this.ctx.canvas.height;
 
            this.stars.push(new Star(randX, randY, this.ctx));
        }
 
        this.ctx.drawImage(this.image, 0, 0);
 
        for(let i = this.stars.length - 1; i >= 0; i--) {
            this.stars[i].update();
            this.stars[i].show();
 
            if(this.stars[i].lifespan < 0) {
                this.stars.splice(i, 1);
            }
        }
 
        this.texture.needsUpdate = true;
    }
}
 
class Star {
    constructor(x, y, ctx) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 3;
        this.vy = Math.random() * 3;
        this.r = 0.5 + Math.random() * 2;
        this.lifespan = 255;
        this.ctx = ctx;
    }
 
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
 
    show() {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.lifespan/255})`;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        this.ctx.fill();
        this.lifespan -= 2;
    }
}
export let background = new StarBackground();