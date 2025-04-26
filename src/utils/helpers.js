let lastMousePos = {
    x: null,
    y: null
};
 
export function millis() {
    //return Math.floor(CLOCK.getElapsedTime() * 1000);
    return Math.floor(performance.now());
}

export function addToScene(mesh, collide = false) {
    if(collide) {
        OBJECTS.push(mesh);
    }
    scene.add(mesh);
}
 
// Map number from one range to another
export function map(num, in_min, in_max, out_min, out_max){
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
 
export function random(min, max) { // min and max included 
  let rand = Math.random();
    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }
 
    return rand * (max - min) + min;
}