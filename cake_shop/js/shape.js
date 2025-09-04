import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Read shape from sessionStorage (default: round)
const shape = sessionStorage.getItem("selectedShape") || "round";
console.log("Loaded shape:", shape); // ✅ Debugging

const modelPath = {
  round: "./models/shape/round_shape.glb",
  square: "./models/shape/square_shape.glb",
  heart: "./models/shape/heart_shape.glb"
}[shape];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 7, 22);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.5;

scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 0.2);
light.position.set(0, 10, 10);
scene.add(light);

// Load cake model based on selected shape
const loader = new GLTFLoader();
loader.load(
  modelPath,
  (gltf) => {
    const cake = gltf.scene;
    cake.scale.set(2.5, 2, 2.5);
    cake.position.set(0, -2, 0);
    scene.add(cake);
  },
  undefined,
  (error) => console.error("Error loading cake model:", error)
);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

(function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
})();
