import * as THREE from "three";
import { OBJECTS, OUTLINEPASSOBJECTS } from '../utils/constants';
import { sceneScale } from '../scene';
import { millis, map } from "../utils/helpers";

export class Planet {
    constructor(x, y, z, r, textureSrc) {
        let texture = new THREE.TextureLoader().load(textureSrc);
        this.material = new THREE.MeshBasicMaterial({map: texture, reflectivity: 1.0});
        this.geometry = new THREE.SphereGeometry(r, 64, 64);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(x, y, z);
        sceneScale.add(this.mesh);
        OUTLINEPASSOBJECTS.push(this.mesh);
        OBJECTS.push(this.mesh);
 
        let material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, map: new THREE.TextureLoader().load("./assets/particle.png"), blending: THREE.AdditiveBlending, transparent: true});
        let geometry = new THREE.SphereGeometry(r + 4, 64, 64);
        let mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI/1.5;
        mesh.rotation.z = -Math.PI/4;
        mesh.position.set(x, y, z);
 
        this.rotateSpeed = 0.03;
        this.r = r;
 
        this.animating = false;
        this.animationStartTime = 0;
        this.animationDuration = 1000;
 
        this.animationXrotation = 0;
        this.animationYrotation = 0;
    }
 
    resetRotation() {
        this.animating = true;
        this.animationStartTime = millis();
        this.animationXrotation = this.mesh.rotation.x;
        this.animationYrotation = this.mesh.rotation.y;
    }
    
    rotateForward(xDist, yDist) {
        this.mesh.rotation.y += xDist;
        this.mesh.rotation.x += yDist;
    }
        
    rotateBackward(dist) {
        this.mesh.rotation.y -= dist;
    }
 
    update() {
        if(this.animating) {
            let timePassed = millis() - this.animationStartTime;
            let xRotation = map(timePassed, 0, this.animationDuration, this.animationXrotation, 0);
            let yRotation = map(timePassed, 0, this.animationDuration, this.animationYrotation, 0);
            this.mesh.rotation.x = xRotation;
            this.mesh.rotation.y = yRotation;
 
            if(millis() > this.animationStartTime + this.animationDuration) {
                this.animating = false;
            }
        }
    }
}

export let earth = new Planet(-600, 0, -3, 200, "assets/earth_clouds.png");
export let mars = new Planet(600, 0, 0, 106, "assets/mars.jpg");