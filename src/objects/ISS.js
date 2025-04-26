import * as THREE from "three";
import { sceneScale } from '../scene';
import { earth } from "./planet";
import { renderer } from "../renderer";

class ISS {
    constructor(parent, rotationAxis) {
        let texture = new THREE.TextureLoader().load("./assets/issV2.png");
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
 
        let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        let geometry = new THREE.PlaneGeometry(130, 104, 0);
 
        this.mesh = new THREE.Mesh(geometry, material);
        sceneScale.add(this.mesh);
 
        this.minOrbitSpeed = 0.003;
        this.maxOrbitSpeed = 0.013;

        this.parent = parent;
        this.orbitAngle = 0;
        this.orbitSpeed = 0.013;
        this.orbitDist = 300;

        this.selected = false;
    }

    slowOrbit() {
        this.orbitSpeed = this.minOrbitSpeed;
        this.selected = true;
    }

    speedOrbit() {
        this.orbitSpeed = this.maxOrbitSpeed;
        this.selected = false;
    }
 
    orbit() {
        let r = this.orbitDist;
        let horz = 0;
        let x = r * Math.sin(this.orbitAngle) * Math.cos(horz);
        let y = r * Math.sin(this.orbitAngle) * Math.sin(horz);
        let z = r * Math.cos(this.orbitAngle);
 
        this.orbitAngle += this.orbitSpeed;
 
        this.mesh.position.set(this.parent.position.x + x, this.parent.position.y + y, this.parent.position.z + z);
    }
}

export let iss = new ISS(earth.mesh, new THREE.Vector3(1, 0, 0));