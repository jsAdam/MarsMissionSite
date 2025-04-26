import * as THREE from "three";
import { canvas, camera } from "./scene";
import { OBJECTS } from "./utils/constants";
import { earth } from "./objects/planet";
import { popups } from "./objects/popup";
import { iss } from "./objects/ISS";

let mouseX = 0;
let mouseY = 0;
const WIDTH = canvas.offsetWidth;
const HEIGHT = canvas.offsetHeight;
 
let lastMousePos = {
    x: null,
    y: null
};

export function onMouseUp(e) {
    lastMousePos = {
        x: null,
        y: null
    };
    
    document.body.style.cursor = "default";
 
    document.onmousemove = function(e) {
        onDocumentMouseMove(e);
    }
}

export function onMouseDown(e) {
    // Only override onmousemove event if intersecting earth mesh on mouse down
    let canvasRect = canvas.getBoundingClientRect();
    const WIDTH = canvas.offsetWidth;
    const HEIGHT = canvas.offsetHeight;

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
            rotateEarth(e);
        }
    }
}

export function onDocumentMouseClick(event) {
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
            if(popup.mesh.parent == iss.mesh) {
                iss.slowOrbit();
            }
        } else {
            popup.selected = false;
            popup.hideLabel();
            if(popup.mesh.parent == iss.mesh) {
                iss.speedOrbit();
            }
        }
    }
}
 
export function onDocumentMouseMove(event) {
    let canvasRect = canvas.getBoundingClientRect();
    let mouse3D = new THREE.Vector3(
        ((event.clientX - canvasRect.left) / WIDTH ) * 2 - 1,
        -((event.clientY - canvasRect.top) / HEIGHT ) * 2 + 1,
        0.5 
    );

    mouseX = event.clientX;
    mouseY = event.clientX;

    let raycaster = new THREE.Raycaster();
    
    raycaster.setFromCamera(mouse3D, camera);
    let intersects = raycaster.intersectObjects(OBJECTS);
 
    let intersectedPopup = false;
    for(let popup of popups) {
        if(intersects.length > 0 && intersects[0].object == popup.mesh) {
            intersectedPopup = true;
        }
    }
 
    if(intersectedPopup) {
        document.body.style.cursor = "pointer";
    } else {
        document.body.style.cursor = "default";
    }
}

export function onHeaderMouseClick(e) {
    var popup = document.querySelector("#heading .popup");
    let popupDisplay = getStyle("#heading .popup", "display");
    
    if(popupDisplay == "block") {
        popup.style.display = "none";
    } else {
        popup.style.display = "block";
    }
}

function getStyle(query, name)
{
    var element = document.querySelector(query);
    return element.currentStyle ? element.currentStyle[name] : window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(name) : null;
}
 
function rotateEarth(event) {
    event.preventDefault();
    document.body.style.cursor = "move";
 
    let xDist = 0;
    let yDist = 0;
 
    if(lastMousePos.x != null) {
        xDist = event.clientX - lastMousePos.x;
        yDist = event.clientY - lastMousePos.y;
        xDist /= 200;
        yDist /= 200;
    }
 
    earth.rotateForward(xDist, yDist);
 
    lastMousePos.x = event.clientX;
    lastMousePos.y = event.clientY;
}