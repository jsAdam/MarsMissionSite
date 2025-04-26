import { millis } from "../utils/helpers";

class Light {
    constructor(x, y, r, ctx) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.ctx = ctx;
        this.on = false;
        this.flickerTime = 1000 + Math.round(Math.random() * 5000);
        this.flickerTimer = millis();
 
        this.onTimer = millis();
    }
 
    show() {
        if(millis() > this.flickerTimer + this.flickerTime) {
            this.flickerTimer = millis();
            this.flickerTime = 1000 + Math.round(Math.random() * 5000);
            this.on = true;
            this.onTimer = millis();
        }
 
        if(this.on) {
            this.ctx.fillStyle = "white";
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            this.ctx.fill();
 
            if(millis() > this.onTimer + 500) {
                this.on = false;
            }
        }
    }
}

export let light = new THREE.SpotLight(0xffffff, 1);
light.position.set(-250, 0, 600);
scene.add(light);