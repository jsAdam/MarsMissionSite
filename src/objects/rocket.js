import * as THREE from "three";
import { sceneScale, manager } from '../scene';
import { earth } from "./planet";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { random, millis, map } from "../utils/helpers";

class Rocket {
    constructor(x, y, z) {
        this.mesh = new THREE.Object3D();
        this.mesh.position.set(x, y, z);
        this.mesh.rotation.z = -Math.PI/2;
        sceneScale.add(this.mesh);

        const rocketMaterial = new THREE.MeshBasicMaterial({
            color: 0xbbbbbb
        });

        let self = this;
        let rocketLoader = new FBXLoader(manager);
        rocketLoader.load("./assets/rocket.fbx", function(object) {
            // Main mesh is one child layer down
            let rocketMesh = object.children[0];

            rocketMesh.traverse((child) => {
                if (child.isMesh) {
                    child.material = rocketMaterial;
                }
            });
            // Rocket fin mesh = Cylinder016 (is rotated strange on load, fixing here)
            for(let mesh of rocketMesh.children) {
                if(mesh.name == "Cylinder016") {
                    mesh.rotation.set(0, 0, 0);
                }
            }

            rocketMesh.position.y = -52;
            rocketMesh.scale.set(4, 4, 24.184);

            self.mesh.add(rocketMesh);
            self.rocketMesh = rocketMesh;
        })
 
        let exhaustLoader = new FBXLoader();
        exhaustLoader.load("./assets/exhaust.fbx", function(object) {
            let exhaustMesh = object;
            let flameMaterial = new THREE.MeshLambertMaterial ({ color: 0xC2261F, transparent: true, opacity: 1, reflectivity: 1.0, emissive: 0xC2261F, emissiveIntensity: 4 });
            exhaustMesh.children[0].material = flameMaterial;
 
            exhaustMesh.scale.set(0.05, 0.04, 0.05);
            exhaustMesh.position.set(0, -70, 0);
            exhaustMesh.rotateZ(Math.PI/2);
 
            self.exhaust = exhaustMesh;
            self.mesh.add(exhaustMesh);
        })
 
        let flameGeometry = new THREE.BoxGeometry(60, 10, 5);
        let flameMaterial = new THREE.MeshPhongMaterial({ color: 0xC2261F, reflectivity: 1.0, emissive: 0xC2261F });
        let flameMesh = new THREE.Mesh(flameGeometry, flameMaterial);
        flameMesh.position.set(x - 50, y, z);
 
        this.accelerate = true;
        this.exhaustAccTime = random(900, 1500);
        this.exhaustAccTimer = millis();
 
        this.burn = false;
        this.exhaustBurnTime = random(2000, 4000);
        this.exhaustBurnTimer = millis();
        
        this.deccelerate = false;
        this.exhaustDeccTime = random(900, 1500);
        this.exhaustDeccTimer = millis();
 
        this.drift = false;
        this.exhaustDriftTime = random(2100, 4500);
        this.exhaustDriftTimer = millis();
 
        this.startPosition = x;
        this.endPosition = x + 600;
        this.movementSpeed = 0.2;

        this.rotate = false;
    }
 
    update() {
        if(this.movementSpeed < 0) {
            let dist = Math.abs(this.mesh.position.x - this.startPosition);
            if(dist < 100 && !this.rotate) {
                this.rotate = true;
            }
        }
        if(this.rotate) {
            this.mesh.rotation.y -= 0.006;
            if(this.mesh.rotation.y < -Math.PI) {
                this.mesh.rotation.y = Math.PI;
                this.rotate = false;
            }
        }
        
        // Only start updating once exhaust mesh has been loaded
        if(this.exhaust) {
            this.animate();
 
            this.mesh.position.x += this.movementSpeed;
            if(this.mesh.position.x > this.endPosition || this.mesh.position.x < this.startPosition) {
                this.movementSpeed = -this.movementSpeed;
                if(this.mesh.position.x > this.endPosition) {
                    this.mesh.rotateZ(Math.PI);
                }
            }
        }
    }
 
    animate() {
        if(this.accelerate) {
            let diff = (this.exhaustAccTimer + this.exhaustAccTime) - millis();
            let opacity = map(diff, 0, this.exhaustAccTime, 1, 0);
 
            this.exhaust.children[0].material.opacity = opacity;
 
            if(millis() > this.exhaustAccTimer + this.exhaustAccTime) {
                this.accelerate = false;
                this.burn = true;
 
                this.exhaustBurnTime = random(2000, 4000);
                this.exhaustBurnTimer = millis();
            }
        }
 
        if(this.burn) {
            this.exhaust.children[0].material.opacity = 1;
 
            if(millis() > this.exhaustBurnTimer + this.exhaustBurnTime) {
                this.burn = false;
                this.deccelerate = true;
 
                this.exhaustDeccTime = random(2100, 4500);
                this.exhaustDeccTimer = millis();
            }
        }
 
        if(this.deccelerate) {
            let diff = (this.exhaustDeccTimer + this.exhaustDeccTime) - millis();
            let opacity = map(diff, 0, this.exhaustDeccTime, 0, 1);
 
            this.exhaust.children[0].material.opacity = opacity;
 
            if(millis() > this.exhaustDeccTimer + this.exhaustDeccTime) {
                this.deccelerate = false;
                this.drift = true;
 
                this.exhaustDriftTime = random(700, 1500);
                this.exhaustDriftTimer = millis();
            }
        }
 
        if(this.drift) {
            this.exhaust.children[0].material.opacity = 0;
 
            if(millis() > this.exhaustDriftTimer + this.exhaustDriftTime) {
                this.drift = false;
                this.accelerate = true;
 
                this.exhaustAccTime = random(900, 1500);
                this.exhaustAccTimer = millis();
            }
        }
    }
}

export let rocket = new Rocket(earth.mesh.position.x + 600, 0, 0);