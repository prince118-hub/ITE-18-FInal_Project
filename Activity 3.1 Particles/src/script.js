import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

// Floor texture (served from Vite publicDir `static/` -> `/textures/...`)
let floorTexture = textureLoader.load("/textures/particles/1.png");
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(10, 10);

/**
 * Test cube
 */
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial()
);
scene.add(cube);

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ map: floorTexture, side: THREE.DoubleSide })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1;
scene.add(floor);

// GUI: allow switching floor texture and adjusting tiling
const textureNames = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "7.png",
  "8.png",
  "9.png",
  "10.png",
  "11.png",
  "12.png",
  "13.png",
];

const params = {
  texture: textureNames[0],
  repeat: 10,
  rotation: 0,
};

function setFloorTexture(name) {
  const path = `/textures/particles/${name}`;
  const tex = textureLoader.load(path, (t) => {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(params.repeat, params.repeat);
    t.rotation = params.rotation;
    t.center.set(0.5, 0.5);
    floor.material.map = t;
    floor.material.needsUpdate = true;
  });
  floorTexture = tex;
}

gui
  .add(params, "texture", textureNames)
  .name("Floor Texture")
  .onChange((v) => {
    setFloorTexture(v);
  });
gui
  .add(params, "repeat", 1, 50, 1)
  .name("Tile Repeat")
  .onChange((v) => {
    params.repeat = v;
    if (floor.material.map) floor.material.map.repeat.set(v, v);
  });
gui
  .add(params, "rotation", 0, Math.PI * 2, 0.01)
  .name("Rotation")
  .onChange((v) => {
    params.rotation = v;
    if (floor.material.map) {
      floor.material.map.rotation = v;
      floor.material.map.center.set(0.5, 0.5);
    }
  });

// Basic lighting so the floor's material is visible
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Walls — white walls surrounding the floor
 */
const wallHeight = 4;
const wallThickness = 0.2;
const wallLength = 20;
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});

// North wall (negative Z)
const wallNorth = new THREE.Mesh(
  new THREE.BoxGeometry(wallLength, wallHeight, wallThickness),
  wallMaterial
);
wallNorth.position.set(0, -1 + wallHeight / 2, -wallLength / 2);
scene.add(wallNorth);

// South wall (positive Z)
const wallSouth = wallNorth.clone();
wallSouth.position.set(0, -1 + wallHeight / 2, wallLength / 2);
scene.add(wallSouth);

// West wall (negative X)
const wallWest = new THREE.Mesh(
  new THREE.BoxGeometry(wallThickness, wallHeight, wallLength),
  wallMaterial
);
wallWest.position.set(-wallLength / 2, -1 + wallHeight / 2, 0);
scene.add(wallWest);

// East wall (positive X)
const wallEast = wallWest.clone();
wallEast.position.set(wallLength / 2, -1 + wallHeight / 2, 0);
scene.add(wallEast);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Simple on-screen instructions
const instructions = document.createElement("div");
instructions.style.position = "absolute";
instructions.style.top = "10px";
instructions.style.left = "10px";
instructions.style.padding = "8px 12px";
instructions.style.background = "rgba(0,0,0,0.5)";
instructions.style.color = "#fff";
instructions.style.fontFamily = "sans-serif";
instructions.style.fontSize = "13px";
instructions.style.zIndex = "999";
instructions.innerHTML = "Click and drag to look — WASD to move.";
document.body.appendChild(instructions);

// Movement state
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const onKeyDown = function (event) {
  switch (event.code) {
    case "KeyW":
      moveForward = true;
      break;
    case "KeyA":
      moveLeft = true;
      break;
    case "KeyS":
      moveBackward = true;
      break;
    case "KeyD":
      moveRight = true;
      break;
  }
};

const onKeyUp = function (event) {
  switch (event.code) {
    case "KeyW":
      moveForward = false;
      break;
    case "KeyA":
      moveLeft = false;
      break;
    case "KeyS":
      moveBackward = false;
      break;
    case "KeyD":
      moveRight = false;
      break;
  }
};

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// (VR support removed) regular renderer loop will be used

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const delta = clock.getDelta();

  // Update controls
  controls.update();

  // WASD movement relative to camera direction (no pointer lock)
  const speed = 5; // units per second
  const moveDistance = speed * delta;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0; // keep movement on XZ plane
  forward.normalize();
  const right = new THREE.Vector3();
  right.crossVectors(forward, camera.up).normalize();

  if (moveForward)
    camera.position.add(forward.clone().multiplyScalar(moveDistance));
  if (moveBackward)
    camera.position.add(forward.clone().multiplyScalar(-moveDistance));
  if (moveLeft)
    camera.position.add(right.clone().multiplyScalar(-moveDistance));
  if (moveRight)
    camera.position.add(right.clone().multiplyScalar(moveDistance));

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
