import * as THREE from 'three';
import { resizeRendererToDisplaySize, composer } from './renderer';
import { earth, mars } from "./objects/planet";
import { moon } from './objects/moon';
import { iss } from './objects/ISS';
import { rocket } from './objects/rocket';
import { background } from './objects/starbackground';
import { popups } from './objects/popup';
import { outlinePass } from './renderer';
import { OUTLINEPASSOBJECTS } from './utils/constants';
import { onDocumentMouseClick, onDocumentMouseMove, onMouseDown, onMouseUp, onHeaderMouseClick } from './input';

let CLOCK = new THREE.Clock();
CLOCK.start();

outlinePass.selectedObjects = OUTLINEPASSOBJECTS;
 
let draw = function() {
    resizeRendererToDisplaySize();
 
    earth.update();
    mars.update();
    rocket.update();
    iss.orbit();
    moon.orbit();
    background.moveStars();

    for(let popup of popups) {
        if(!popup.addToParent) {
            popup.update();
        }
        if(popup.selected) {
            popup.showLabel();
        }
    }

    composer.render();
    requestAnimationFrame(draw);
}
draw();


document.onmousemove = function(e) {
    onDocumentMouseMove(e);
}
 
document.onclick = function(e) {
    onDocumentMouseClick(e);
}
 
document.addEventListener("mousedown", function(e){
    //mouseDownFunction(e); 
    onMouseDown(e);
});
 
document.addEventListener("mouseup", function(e){
    onMouseUp(e);
});
 
document.getElementById("heading").addEventListener("click", function(e) {
    onHeaderMouseClick(e);
});