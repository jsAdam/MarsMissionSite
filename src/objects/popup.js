import * as THREE from "three";
import { OBJECTS, } from '../utils/constants';
import { sceneScale, canvas, camera } from '../scene';
import { POPUP_DATA } from "../data/popup_data";
import { earth, mars, Planet } from "./planet";
import { moon, Moon } from './moon';
import { iss } from './ISS';
import { rocket } from './rocket';

const tempV = new THREE.Vector3();
const labelContainerElem = document.querySelector("#labels");
 
class Popup {
    constructor(parent, text, followPopup, latitude, longitude, width, height, addToParent) {
        let boxWidth = width || 60;
        let boxheight = height || 60;
        let geometry = new THREE.BoxGeometry(boxWidth, boxheight, 5);
        let material = new THREE.MeshBasicMaterial({color: 0x0000FF});
        this.mesh = new THREE.Mesh(geometry, material);
 
        this.parent = parent.mesh;
 
        let x = 0;
        let y = 0;
        let z = 0;
 
        if(latitude !== null && longitude !== null && !followPopup) {
            let rho = parent.r;
            let phi   = (90-latitude)*(Math.PI/180)
            let theta = (longitude+180)*(Math.PI/180)
 
            x = -((rho) * Math.sin(phi)*Math.cos(theta));
            z = ((rho) * Math.sin(phi)*Math.sin(theta));
            y = ((rho) * Math.cos(phi));
        }
 
        this.addToParent = true || addToParent;
        if(addToParent != undefined) {
            this.addToParent = addToParent;
        }
 
        if(followPopup) {
            if(parent instanceof Planet || parent instanceof Moon) {
                this.mesh.position.z = parent.r;
            }
 
            if(this.addToParent) {
                parent.mesh.add(this.mesh);
            } else {
                sceneScale.add(this.mesh);
            }
            //this.mesh.position.set(parent.mesh.position.x, parent.mesh.position.y, parent.mesh.position.z);
            OBJECTS.push(this.mesh);
        } else {
            parent.mesh.add(this.mesh);
            this.mesh.position.set(x, y, z);
            OBJECTS.push(this.mesh);
            this.mesh.lookAt(parent.mesh.position);
            
            let iconTexture = new THREE.TextureLoader().load("./assets/heatmap2.png");
            let iconGeometry = new THREE.PlaneGeometry(40, 40, 40);
            let iconMaterial = new THREE.MeshBasicMaterial({ map: iconTexture, transparent: true });
            let iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);
            parent.mesh.add(iconMesh);
            iconMesh.position.set(x, y, z);
            var v = new THREE.Vector3();
            var target = new THREE.Vector3();
            iconMesh.getWorldPosition(target);
            v.subVectors(target, parent.mesh.position).add(target);
            iconMesh.lookAt(v);
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
        this.label.style.display = "none";
 
        this.selected = false;
    }
 
    update() {
        this.mesh.position.set(this.parent.position.x, this.parent.position.y, this.parent.position.z + 70);
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

export let popups = [];

for(let data of POPUP_DATA) {
    if(data.long && data.lat) {
        popups.push(new Popup(earth, data.popupHTML, false, data.lat, data.long));
    }
}
setTimeout(() => {
    popups.push(new Popup(iss, POPUP_DATA.find((popup) => popup.name == "iss").popupHTML, true, null, null, 120, 60));
}, 1000);
popups.push(new Popup(rocket, POPUP_DATA.find((popup) => popup.name == "rocket").popupHTML, true, null, null, 40, 110));
popups.push(new Popup(mars, POPUP_DATA.find((popup) => popup.name == "mars").popupHTML, true, null, null, 160, 160));
popups.push(new Popup(moon, POPUP_DATA.find((popup) => popup.name == "moon").popupHTML, true, null, null, 70, 70, false));
