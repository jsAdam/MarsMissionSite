import * as THREE from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { scene, sceneScale, camera, canvas } from './scene';
import { map } from "./utils/helpers";

const WIDTH = canvas.offsetWidth;
const HEIGHT = canvas.offsetHeight;

// Create renderer and scene
export const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

// Post processing
const renderScene = new RenderPass( scene, camera );
const bloomPass = new UnrealBloomPass( new THREE.Vector2( WIDTH, HEIGHT ), 1.5, 0.4, 0.85 ); //1.0, 9, 0.5, 512);
bloomPass.renderToScreen = true;
bloomPass.threshold = 0.7;
bloomPass.strength = 1;
bloomPass.radius = 0.4;
 
export const composer = new EffectComposer( renderer );
const params = {
    edgeStrength: 2.3,
    edgeGlow: 1,
    edgeThickness: 5.0
};
 
export const outlinePass = new OutlinePass(new THREE.Vector2(WIDTH, HEIGHT), scene, camera);
outlinePass.edgeStrength = params.edgeStrength;
outlinePass.edgeGlow = params.edgeGlow;
outlinePass.edgeThickness = params.edgeThickness;
outlinePass.visibleEdgeColor.set(0xffffff);
outlinePass.hiddenEdgeColor.set(0x190A05);
 
composer.setSize( WIDTH, HEIGHT );
composer.addPass( renderScene );
composer.addPass( bloomPass );
composer.addPass( outlinePass );

// Function that handles sizing of the canvas
export function resizeRendererToDisplaySize() {
    canvas = renderer.domElement;
    camera.left = canvas.clientWidth / - 2;
    camera.right = canvas.clientWidth / 2;
    camera.top = canvas.clientHeight / 2;
    camera.bottom = canvas.clientHeight / - 2;
    camera.updateProjectionMatrix();

    let current = WIDTH * HEIGHT;
    let min = 702000;
    let max = 2073600;
    let minSize = 0.6;
    let maxSize = 1;
    let newScale = map(current, min, max, minSize, maxSize);
    sceneScale.scale.set(newScale, newScale, newScale);
    
    renderer.setSize(WIDTH, HEIGHT );
    composer.setSize(WIDTH, HEIGHT );
}