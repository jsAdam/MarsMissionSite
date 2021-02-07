import * as THREE from "./build/three.module.js";
import { EffectComposer } from "./jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "./jsm/postprocessing/OutlinePass.js";
import { UnrealBloomPass } from "./jsm/postprocessing/UnrealBloomPass.js";
import { FBXLoader } from './jsm/loaders/FBXLoader.js'

let canvas = document.querySelector("#myCanvas");

let renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

let scene = new THREE.Scene();

let WIDTH = canvas.offsetWidth;
let HEIGHT = canvas.offsetHeight;
let OBJECTS = [];
let tetrahedrons = [];
const labelContainerElem = document.querySelector("#labels");

//let camera = new THREE.PerspectiveCamera(65, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);
let camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
camera.position.set(0.0, 0.0, 500);

var renderScene = new RenderPass( scene, camera );

var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 ); //1.0, 9, 0.5, 512);
bloomPass.renderToScreen = true;
bloomPass.threshold = 0.7;
bloomPass.strength = 1;
bloomPass.radius = 0.4;

let composer = new EffectComposer( renderer );
let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.setSize( window.innerWidth, window.innerHeight );
composer.addPass( renderScene );
composer.addPass( bloomPass );
composer.addPass( outlinePass );

let shaderMaterial = new THREE.ShaderMaterial({
		vertexShader:   document.querySelector('#vertexshader').textContent,
		fragmentShader: document.querySelector('#fragmentshader').textContent
	});
let sphere = new THREE.Mesh(
	   new THREE.SphereGeometry(1, 16, 16),
	   shaderMaterial);

	// add the sphere and camera to the scene
//scene.add(sphere);

class Planet {
    constructor(x, y, z, r, textureSrc) {
        let texture = new THREE.TextureLoader().load(textureSrc);
        this.material = new THREE.MeshBasicMaterial({map: texture, reflectivity: 1.0});
        //this.material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, reflectivity: 1.0, emissive: 0xFFFFFF});
        this.r = r;
        this.geometry = new THREE.SphereGeometry(r, 64, 64);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(x, y, z);
        scene.add(this.mesh);
        //outlinePass.selectedObjects = [this.mesh];
        OBJECTS.push(this.mesh);
        this.rotateSpeed = 0.03;
    }
    
    rotateForward() {
        this.mesh.rotation.y += this.rotateSpeed;
    }
        
    rotateBackward() {
        this.mesh.rotation.y -= this.rotateSpeed;
    }
}

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

class ISSCanvas {
    constructor(x, y, z) {
        this.ctx = document.createElement("canvas").getContext("2d");
        this.ctx.canvas.width = 896;
        this.ctx.canvas.height = 357;

        let self = this;
        let background = new Image();
        this.image = background;

        this.texture = new THREE.CanvasTexture(this.ctx.canvas);
        background.onload = function() {
    
            self.ctx.drawImage(background, 0, 0);
            self.texture.needsUpdate = true;
    
            //texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    
            let material = new THREE.MeshBasicMaterial({ map: self.texture });
            let geometry = new THREE.PlaneGeometry(150, 60, 0);
    
            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            scene.add(mesh);
            self.setMesh(mesh);
        }
        background.src = "./assets/issV2.jpg";

        this.lights = [
            new Light(450, 175, 12, this.ctx),
            new Light(250, 100, 8, this.ctx),
            new Light(800, 200, 9, this.ctx)
        ];
    }

    setMesh(mesh) {
        this.mesh = mesh;
    }

    setTexture(texture) {
        this.texture = texture;
    }

    showLights() {
        this.ctx.drawImage(this.image, 0, 0);
        for(let light of this.lights) {
            light.show();
        }
        this.texture.needsUpdate = true;
    }
}

class ISS {
    constructor(x, y, z) {
        let texture = new THREE.TextureLoader().load("./assets/iss.png");
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        //texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        let geometry = new THREE.PlaneGeometry(150, 60, 0);

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        scene.add(mesh);
    }
}

class Rocket {
    constructor(x, y, z) {
        let texture = new THREE.TextureLoader().load("./assets/rocket.png");
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        //texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, emissive: 0x000000, emissiveIntensity: 0 });
        let geometry = new THREE.PlaneGeometry(17, 100, 0);

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        this.mesh.rotation.z = -Math.PI/2;
        scene.add(this.mesh);

        let self = this;
        let loader = new FBXLoader();
        loader.load("./assets/exhaust.fbx", function(object) {
            let exhaustMesh = object;
            console.log(exhaustMesh);
            let flameMaterial = new THREE.MeshLambertMaterial ({ color: 0xC2261F, transparent: true, opacity: 1, reflectivity: 1.0, emissive: 0xC2261F, emissiveIntensity: 4 });
            exhaustMesh.scale.set(0.05, 0.05, 0.05);
            exhaustMesh.position.set(0, -50, 0);
            exhaustMesh.rotateZ(Math.PI/2);
            exhaustMesh.children[0].material = flameMaterial;
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
        //scene.add(flameMesh);

        this.minX = x;
        this.maxX = x + 600;
        this.movementSpeed = 0.02;
    }

    update() {
        if(this.exhaust) {
            this.animate();

            //let x = this.mesh.position.x + this.movementSpeed;

            //this.mesh.position.set(x, this.mesh.position.y, this.mesh.position.z);
            this.mesh.position.x += this.movementSpeed;
            if(this.mesh.position.x > this.maxX || this.mesh.position.x < this.minX) {
                this.movementSpeed = -this.movementSpeed;
                this.mesh.rotateZ(Math.PI);
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

class Moon2 {
    constructor(parent, rotationAxis) {
        let texture = new THREE.TextureLoader().load("./assets/moon.jpg");
        this.material = new THREE.MeshBasicMaterial({map: texture});
        this.geometry = new THREE.SphereGeometry(40, 64, 64);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        scene.add(this.mesh);
        OBJECTS.push(this.mesh);
        console.log(parent.position.x);

        this.parent = parent;

        this.rotationAxis = rotationAxis;

        let orbitDist = 275;
        let startX = parent.position.x + -rotationAxis.x * orbitDist;
        let startY = parent.position.y + rotationAxis.y * orbitDist;
        let startZ = parent.position.z + rotationAxis.z * orbitDist;

        this.mesh.position.set(startX, startY, startZ);

        //this.parent = parent;
        
        this.rotateSpeed = 0.03;
        this.orbitAngle = 0;
        this.orbitSpeed = 0.01;
        this.orbitDist = 400;

        this.orbitY = 200;
        this.lastOrbitPI = 0;
        this.orbitYDir = -1;
    }

    orbit2() {
        this.mesh.position.sub(this.parent.position); // remove the offset
        this.mesh.position.applyAxisAngle(this.rotationAxis, this.orbitSpeed); // rotate the POSITION
        this.mesh.position.add(this.parent.position); // re-add the offset
    
        this.mesh.rotateOnAxis(this.rotationAxis, this.orbitSpeed); // rotate the OBJECT
    }

    orbit() {
        this.orbitAngle += this.orbitSpeed;
        let p = new THREE.Vector3(this.orbitDist * Math.cos(this.orbitAngle), 0, this.orbitDist * Math.sin(this.orbitAngle));

        if(this.orbitAngle - this.lastOrbitPI > Math.PI) {
            this.orbitYDir = -this.orbitYDir;
            this.lastOrbitPI = this.orbitAngle;
        }
        let y = map(this.orbitAngle, this.lastOrbitPI, this.lastOrbitPI + Math.PI, -this.orbitYDir * this.orbitY, this.orbitYDir * this.orbitY);

        this.mesh.position.set(this.parent.mesh.position.x + p.x, this.parent.mesh.position.y + p.y + y, this.parent.mesh.position.z + p.z);
    }
}

class Moon {
    constructor(parent, rotationAxis) {
        let texture = new THREE.TextureLoader().load("./assets/moon.jpg");
        this.material = new THREE.MeshBasicMaterial({map: texture});
        this.geometry = new THREE.SphereGeometry(40, 64, 64);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        scene.add(this.mesh);
        OBJECTS.push(this.mesh);
        console.log(parent.position.x);

        this.parent = parent;

        this.rotationAxis = rotationAxis;
        this.r = 64;

        let orbitDist = 275;
        let startX = parent.position.x + -rotationAxis.x * orbitDist;
        let startY = parent.position.y + rotationAxis.y * orbitDist;
        let startZ = parent.position.z + rotationAxis.z * orbitDist;

        this.rotatePosition = new THREE.Vector3(startX, startY, startZ);
        this.mesh.position.set(startX, startY, startZ);

        //this.parent = parent;
        
        this.rotateSpeed = 0.03;
        this.orbitAngle = 0;
        this.orbitSpeed = 0.01;
        this.orbitDist = 400;

        this.orbitY = 200;
        this.lastOrbitPI = 0;
        this.orbitYDir = -1;
    }

    orbit2() {
        //this.rotatePosition.sub(this.parent.position);
        //this.rotatePosition.applyAxisAngle(this.rotationAxis, this.orbitSpeed);
        //this.rotatePosition.add(this.parent.position);
        //this.mesh.position.set(this.rotatePosition.x, this.rotatePosition.y, this.rotatePosition.z);
        let r = 350;
        let horz = Math.PI/4;
        let x = r * Math.sin(this.orbitAngle) * Math.cos(horz);
        let y = r * Math.sin(this.orbitAngle) * Math.sin(horz);
        let z = r * Math.cos(this.orbitAngle);

        this.orbitAngle += this.orbitSpeed;

        this.mesh.position.set(this.parent.position.x + x, this.parent.position.y + y, this.parent.position.z + z);
        //this.mesh.rotateOnAxis(this.rotationAxis, 0.01);
    }

    orbit() {
        this.orbitAngle += this.orbitSpeed;
        let p = new THREE.Vector3(this.orbitDist * Math.cos(this.orbitAngle), 0, this.orbitDist * Math.sin(this.orbitAngle));

        if(this.orbitAngle - this.lastOrbitPI > Math.PI) {
            this.orbitYDir = -this.orbitYDir;
            this.lastOrbitPI = this.orbitAngle;
        }
        let y = map(this.orbitAngle, this.lastOrbitPI, this.lastOrbitPI + Math.PI, -this.orbitYDir * this.orbitY, this.orbitYDir * this.orbitY);

        this.mesh.position.set(this.parent.mesh.position.x + p.x, this.parent.mesh.position.y + p.y + y, this.parent.mesh.position.z + p.z);
    }
}

const tempV = new THREE.Vector3();

class Popup {
    constructor(parent, text, latitude, longitude) {
        let geometry = new THREE.BoxGeometry(60, 60, 5);
        //let material = new THREE.MeshBasicMaterial({color: 0xFFFFFF, reflectivity: 1.0, emissive: 0xFFFFFF});
        let material = new THREE.MeshBasicMaterial({color: 0x0000FF});
        this.mesh = new THREE.Mesh(geometry, material);

        this.parent = parent.mesh;
        console.log(parent.mesh);
        let x = 0;
        let y = 0;
        let z = 0;

        if(latitude !== null && longitude !== null) {
            let rho = parent.r;
            let phi   = (90-latitude)*(Math.PI/180)
            let theta = (longitude+180)*(Math.PI/180)

            x = -((rho) * Math.sin(phi)*Math.cos(theta));
            z = ((rho) * Math.sin(phi)*Math.sin(theta));
            y = ((rho) * Math.cos(phi));
        }

        if(parent.mesh.geometry.type == "PlaneGeometry") {
            scene.add(this.mesh);
            this.mesh.position.set(parent.mesh.position.x, parent.mesh.position.y, parent.mesh.position.z);
            OBJECTS.push(this.mesh);
            this.planeGeometryPopup = true;
        } else {
            parent.mesh.add(this.mesh);
            this.mesh.position.set(x, y, z);
            OBJECTS.push(this.mesh);
            this.mesh.lookAt(parent.mesh.position);
        }
        this.mesh.visible = false;

        let elem = document.createElement("div");
        let p = document.createElement("p");
        p.innerHTML = text;
        let arrow = document.createElement("div");
        arrow.classList.add("arrow-down");
        
        elem.appendChild(p);
        elem.appendChild(arrow);
        
        labelContainerElem.appendChild(elem);
        this.label = elem;

        this.selected = false;
    }

    update() {
        this.mesh.position.set(this.parent.position.x, this.mesh.position.y, this.mesh.position.z);
    }
    
    showLabel() {
        if(this.label.style.display == "none") {
            this.label.style.display = "block";
        }
        
        this.mesh.updateWorldMatrix(true, false);
        this.mesh.getWorldPosition(tempV);
        
        tempV.project(camera);
        
        const x = (tempV.x * 0.5 + 0.5) * canvas.clientWidth;
        const y = (tempV.y * -0.5 + 0.5) * canvas.clientHeight;
        
        this.label.style.transform = `translate(-50%, -50%) translate(${x}px,${y - this.label.offsetHeight/2}px)`;
    }

    hideLabel() {
        if(this.label.style.display != "none") {
            this.label.style.display = "none";
        }
    }
}

function createBackgroundPlane() {
    let texture = new THREE.CanvasTexture(getCanvasTexture());
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    let geometry = new THREE.PlaneGeometry(21.4, 12, 0)
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -3);
    scene.add(mesh);
}

class StarBackground {
    constructor() {
        this.ctx = document.createElement("canvas").getContext("2d");
        this.ctx.canvas.width = 1920;
        this.ctx.canvas.height = 1080;

        let background = new Image();
        background.src = "./assets/stars - Copy.jpg";
        this.image = background;

        this.ctx.drawImage(background, 0, 0);

        this.texture = new THREE.CanvasTexture(this.ctx.canvas);
        //texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        let material = new THREE.MeshBasicMaterial({ map: this.texture });
        let geometry = new THREE.PlaneGeometry(1920, 1080, 0);

        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, -500);
        scene.add(mesh);

        this.starTime = millis();
        this.starTimer = Math.round(Math.random() * 1000);
        this.stars = [];
    }

    moveStars() {
        if(millis() > this.starTime + this.starTimer) {
            console.log("WORKING");
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

class Tetrahedron {
    constructor(x, y, z, a) {
        // Mesh Creation
        let texture = new THREE.TextureLoader().load("assets/diffusion.png");
        
        let envMap = new THREE.CubeTextureLoader().setPath("assets/cubemap/").load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
        
        this.material = new THREE.MeshPhysicalMaterial({map: texture, envMap, metalness: 1.0, roughness: 0.0});
        this.geometry = new THREE.TetrahedronBufferGeometry(2, 0);
        
        this.centerPos = new THREE.Vector3(x, y, z);
        
        this.activePieceDist = 1;
        this.deactivePieceDist = 0.75;
        
        this.topMesh = new THREE.Mesh(this.geometry, this.material);
        this.topMesh.position.set(this.centerPos.x, this.centerPos.y + this.deactivePieceDist, this.centerPos.z);
        this.topMesh.rotation.x = Math.PI;
        
        this.bottomMesh = new THREE.Mesh(this.geometry, this.material);
        this.bottomMesh.rotation.y = Math.PI/4;
        this.bottomMesh.rotation.x = Math.PI/3.3;
        this.bottomMesh.updateMatrix();
        this.bottomMesh.geometry.applyMatrix(this.bottomMesh.matrix);
        
        this.bottomMesh.position.set(this.centerPos.x, this.centerPos.y - this.deactivePieceDist, this.centerPos.z);
        this.bottomMesh.rotation.set( 0, 0, 0 );
        this.bottomMesh.scale.set( 1, 1, 1 );
        
        let material = new THREE.MeshPhongMaterial({color: 0xFF0000, visible: false});
        let geometry = new THREE.BoxGeometry(3, 5, 3);
        this.collisionMesh = new THREE.Mesh(geometry, material);
        this.collisionMesh.position.set(this.centerPos.x, this.centerPos.y, this.centerPos.z);
        
        addToScene(this.topMesh);
        addToScene(this.bottomMesh);
        addToScene(this.collisionMesh, true);
        
        //let o = new Orb(0, 0, 0);
        
        let pivot = new THREE.Group();
        scene.add(pivot);
        pivot.add(this.topMesh);
        pivot.add(this.bottomMesh);
        pivot.add(this.collisionMesh);
        
        this.orbs = [];
        this.orbs.push(new Orb(x, y, z, this.centerPos, 0.15));
        for(let i = 0; i < 50; i++) {
            let xValue = random(-1.2, 1.2);
            let zValue = random(-1.2, 1.2);
            let yValue = random(-0.1, 0.1);
            let r = random(0.01, 0.03);
            
            let orb = new Orb(x + xValue, y + yValue, z + zValue, this.centerPos, r);
            
            this.orbs.push(orb);
        }
        for(let orb of this.orbs) {
            pivot.add(orb.mesh);
            orb.mesh.visible = false;
        }
        
        console.log(a);
        pivot.rotation.z = a || 0;
        
        // Class variables
        this.active = false;
        
        this.animatingActivation= false;
        this.animatingDeactivation = false;
        this.animationDuration = 2000;
        this.animationStartTime = 1000;
        
        this.activeRotationSpeed = 0.08;
        this.deactiveRotationSpeed = 0.01;
        this.rotationSpeed = 0.01;
        
        this.mouseInside = false;
    }
    
    deactivate() {
        this.animationStartTime = millis();
        this.animatingDeactivation = true;
    }
    
    activate() {
        this.animationStartTime = millis();
        this.animatingActivation = true;
        for(let orb of this.orbs) {
            orb.mesh.visible = true;
        }
    }
    
    update() {
        if(this.animatingActivation) {
            let time = (this.animationStartTime + this.animationDuration) - millis();
            
            let pieceDist = map(time, this.animationDuration, 0, this.deactivePieceDist, this.activePieceDist);
            this.topMesh.position.set(this.centerPos.x, this.centerPos.y + pieceDist, this.centerPos.z);
            this.bottomMesh.position.set(this.centerPos.x, this.centerPos.y - pieceDist, this.centerPos.z);
            
            let scale = map(time, this.animationDuration, 0, 0, 1);
            for(let orb of this.orbs) {
                orb.mesh.scale.set(scale, scale, scale);
            }
            
            this.rotationSpeed = map(time, this.animationDuration, 0, this.deactiveRotationSpeed, this.activeRotationSpeed);
            
            if(millis() > this.animationStartTime + this.animationDuration) {
                this.animatingActivation = false;
                this.active = true;
            }   
        }
        if(this.animatingDeactivation) {
            let time = (this.animationStartTime + this.animationDuration) - millis();
            
            let pieceDist = map(time, this.animationDuration, 0, this.activePieceDist, this.deactivePieceDist);
            this.topMesh.position.set(this.centerPos.x, this.centerPos.y + pieceDist, this.centerPos.z);
            this.bottomMesh.position.set(this.centerPos.x, this.centerPos.y - pieceDist, this.centerPos.z);
            
            let scale = map(time, this.animationDuration, 0, 1, 0);
            for(let orb of this.orbs) {
                orb.mesh.scale.set(scale, scale, scale);
            }
            
            this.rotationSpeed = map(time, this.animationDuration, 0, this.activeRotationSpeed, this.deactiveRotationSpeed);
            
            if(millis() > this.animationStartTime + this.animationDuration) {
                for(let orb of this.orbs) {
                    orb.mesh.visible = false;
                }
                this.animatingDeactivation = false;
                this.active = false;
            }   
        }
        
        for(let orb of this.orbs) {
            orb.update();
        }
        
        this.topMesh.rotation.y += this.rotationSpeed;
        this.bottomMesh.rotation.y += this.rotationSpeed;
    }
}

class Orb {
    constructor(x, y, z, center, size) {
        this.size = size;
        let geometry = new THREE.SphereBufferGeometry(size, 16, 16);
        let material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, reflectivity: 1.0, emissive: 0xFFFFFF});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        scene.add(this.mesh);
        
        this.angle = 0;
        
        this.center = center;
        console.log(center);
        let d = center.distanceTo(this.mesh.position);
        this.distanceToCenter = d;
        this.radians = Math.random() * Math.PI * 2;
        this.radians2 = 0;
        
        this.cw = Math.random() > 0.5 ? true : false;
    }
    
    update() {
        
        //this.mesh.rotation.y += 0.01;
        
        if(this.cw) {
            this.radians+=.005; 
            //this.radians2+=.005;
        } else {
            this.radians-=.005; 
            //this.radians2-=.005;
        }
        
        this.mesh.position.x = this.center.x + (Math.cos(this.radians) * this.distanceToCenter);
        this.mesh.position.z = this.center.z + (Math.sin(this.radians) * this.distanceToCenter);
    }
}

let CLOCK = new THREE.Clock();
CLOCK.start();

let earth = new Planet(-600, 0, -3, 200, "assets/earth_clouds.png");
let mars = new Planet(600, 0, 0, 106, "assets/mars.jpg");
let moon = new Moon(earth.mesh, new THREE.Vector3(-1, 1, 0));
let iss = new ISSCanvas(-300, 0, 0);
let rocket = new Rocket(0, 0, 0);

let popups = [];
for(let data of POPUP_DATA) {
    popups.push(new Popup(earth, data.popupHTML, data.lat, data.long));
}
setTimeout(() => {
    popups.push(new Popup(iss, "Examining changes in cosmonaut motivation and links to coping and self-regulation during 6 month missions aboard the ISS"));
}, 1000);
popups.push(new Popup(rocket, "Using advances in artificial intelligence to power robotic psychological companions on a mission to Mars"));
popups.push(new Popup(mars, "Developing psychological research roadmaps to support and sustain human life during deep space exploration missions to Mars", 0, -90));
popups.push(new Popup(moon, "Applying agent based models to historic polar exploration material to support future Moon-based civilisations", 0, -90));
// let popupGR = new Popup(71.7, -42.6, earth, "Relations between linguistic markers of stress and health on expedition. Using a digital tool to monitor and optimise stress and health during a lunar analogue mission");
// let popupUK = new Popup(55.4, -3.4, earth, "Monitoring and supporting resilient performance in extreme and high risk populations");
// let popup1 = new Popup(-8.7, -55.5, earth, "This is South America");
// let popup2 = new Popup(-8.7, -55.5, earth, "This is South America");
// let popup3 = new Popup(-8.7, -55.5, earth, "This is South America");
// let popup4 = new Popup(-8.7, -55.5, earth, "This is South America");
// let popup5 = new Popup(-8.7, -55.5, earth, "This is South America");

// popups.push(popupGR);
// popups.push(popupUK);

let background = new StarBackground();
//createBackgroundPlane();
//createGround();

let light = new THREE.SpotLight(0xffffff, 1);
light.position.set(-250, 0, 600);
scene.add(light);

function millis() {
    return Math.floor(CLOCK.getElapsedTime() * 1000);
}

let draw = function() {
    resizeRendererToDisplaySize();

    rocket.update();
    iss.showLights();
    moon.orbit2();
    //rotateAboutPoint(moon.mesh, earth.mesh.position, new THREE.Vector3(-1, 1, 0), 0.01, true);
    //moon.orbit();
    background.moveStars();
    
    for(let t of tetrahedrons) {
        t.update();
    }
    for(let popup of popups) {
        if(popup.planeGeometryPopup) {
            popup.update();
        }
        if(popup.selected) {
            popup.showLabel();
        }
    }
    
    //renderer.render(scene, camera);
    composer.render();
    requestAnimationFrame(draw);
}
draw();

let mouseX = 0;

document.onmousemove = function(e) {
    onDocumentMouseMove(e);
}

document.addEventListener("mousedown", function(event){
    //mouseDownFunction(e); 
    // Only override onmousemove event if intersecting earth mesh on mouse down
    let canvasRect = canvas.getBoundingClientRect();
    let mouse3D = new THREE.Vector3(
        ((event.clientX - canvasRect.left) / WIDTH ) * 2 - 1,
        -((event.clientY - canvasRect.top) / HEIGHT ) * 2 + 1,
        0.5 
    );
    let raycaster = new THREE.Raycaster();
    
    raycaster.setFromCamera(mouse3D, camera);
    let intersects = raycaster.intersectObjects(OBJECTS);

    let intersectingEarthMesh = false;
    for(let intersect of intersects) {
        if(intersect.object == earth.mesh) {
            intersectingEarthMesh = true;
        }
    }

    if(intersectingEarthMesh) {
        document.onmousemove = function(e) {
            onDocumentMouseDown(e);
        }
    }
});

document.addEventListener("mouseup", function(e){
    document.onmousemove = function(e) {
        onDocumentMouseMove(e);
    }
});

//document.addEventListener("mousemove", onDocumentMouseDown);

function onDocumentMouseMove(event) {
    let canvasRect = canvas.getBoundingClientRect();
    let mouse3D = new THREE.Vector3(
        ((event.clientX - canvasRect.left) / WIDTH ) * 2 - 1,
        -((event.clientY - canvasRect.top) / HEIGHT ) * 2 + 1,
        0.5 
    );
    let raycaster = new THREE.Raycaster();
    
    raycaster.setFromCamera(mouse3D, camera);
    let intersects = raycaster.intersectObjects(OBJECTS);

    for(let popup of popups) {
        if(intersects.length > 0 && intersects[0].object == popup.mesh) {
            popup.selected = true;
        } else {
            popup.selected = false;
            popup.hideLabel();
        }
    }
    
    for(let t of tetrahedrons) {
        if(intersects.length > 0 && (intersects[0].object == t.collisionMesh)) {
            if(!t.active && !t.animatingActivation) {
                t.activate();
            }
        } else {
            if(t.active && !t.animatingDeactivation) {
                t.deactivate();
            }
        }
    }
}

function rotateAboutPoint(obj, point, axis, theta, pointIsWorld){
    pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld;

    if(pointIsWorld){
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }

    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset

    if(pointIsWorld){
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}

let pressed = false;
function onDocumentMouseDown(event) {
    event.preventDefault();

    if(event.clientX > mouseX) {
        earth.rotateForward();
    } else if(event.clientX < mouseX){
        earth.rotateBackward();
    }
    
    mouseX = event.clientX;
}

function resizeRendererToDisplaySize() {
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
    camera.updateProjectionMatrix();
    
    WIDTH = canvas.offsetWidth;
    HEIGHT = canvas.offsetHeight;
    
    composer.setSize(canvas.offsetWidth, canvas.offsetHeight );
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight );
}

function addToScene(mesh, collide = false) {
    if(collide) {
        OBJECTS.push(mesh);
    }
    scene.add(mesh);
}

function createGround() {
    let texture = new THREE.TextureLoader().load("./assets/ground.png");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 12);
    
    let material = new THREE.MeshPhysicalMaterial({map: texture, bumpMap: texture});
    
    let geometry = new THREE.PlaneBufferGeometry(100, 100);
    let ground = new THREE.Mesh(geometry, material);
    ground.rotation.z = -Math.PI/4;
    ground.rotation.x = -Math.PI/2;
    ground.position.y = -3.0;
    scene.add(ground);
}

function map(num, in_min, in_max, out_min, out_max){
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function random(min, max) { // min and max included 
  let rand = Math.random();
    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }

    return rand * (max - min) + min;
}