import * as THREE from "three";
import { OBJECTS } from '../utils/constants';
import { sceneScale } from '../scene';
import { earth } from "./planet";

export class Moon {
    constructor(parent, rotationAxis) {
        let texture = new THREE.TextureLoader().load("./assets/moon.jpg");
        this.material = new THREE.MeshBasicMaterial({map: texture});
        this.geometry = new THREE.SphereGeometry(40, 64, 64);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        sceneScale.add(this.mesh);
        OBJECTS.push(this.mesh);
 
        this.parent = parent;
 
        this.rotationAxis = rotationAxis;
        this.r = 40;
 
        let orbitDist = 350;
        let startX = parent.position.x + -rotationAxis.x * orbitDist;
        let startY = parent.position.y + rotationAxis.y * orbitDist;
        let startZ = parent.position.z + rotationAxis.z * orbitDist;
 
        this.rotatePosition = new THREE.Vector3(startX, startY, startZ);
        this.mesh.position.set(startX, startY, startZ);
        this.orbitDist = orbitDist;
        
        this.rotateSpeed = 0.01;
        this.orbitAngle = 0;
        this.orbitSpeed = 0.005;
        //this.orbitDist = 400;
 
        this.orbitY = 200;
        this.lastOrbitPI = 0;
        this.orbitYDir = -1;
 
        this.xDir = false;
        this.rotateAngle = 0;
    }
 
    orbit() {
        let r = this.orbitDist;
        let horz = Math.PI/4;
        let x = r * Math.sin(this.orbitAngle) * Math.cos(horz);
        let y = r * Math.sin(this.orbitAngle) * Math.sin(horz);
        let z = r * Math.cos(this.orbitAngle);
 
        this.orbitAngle += this.orbitSpeed;
 
        this.mesh.position.set(this.parent.position.x + x, this.parent.position.y + y, this.parent.position.z + z);
        this.mesh.rotateOnAxis(this.rotationAxis.normalize(), 0.005);
    }
}

export let moon = new Moon(earth.mesh, new THREE.Vector3(1, -1, 0));