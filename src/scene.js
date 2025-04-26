import * as THREE from 'three';

// Create loading manager
export const manager = new THREE.LoadingManager();
manager.onLoad = function() {
    document.getElementById("loadingScreen").style.display = "none";
};

// === Scene and Camera Setup ===
export let canvas = document.querySelector("#myCanvas");
export const scene = new THREE.Scene();
 
const WIDTH = canvas.offsetWidth;
const HEIGHT = canvas.offsetHeight;
 
export const camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 1000 );
camera.position.set(0.0, 0.0, 500);
 
export const sceneScale = new THREE.Object3D();
sceneScale.visible = true;
scene.add(sceneScale);