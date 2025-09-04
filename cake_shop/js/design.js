import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

const shape = sessionStorage.getItem('selectedShape') || 'round';
const icingSelection = sessionStorage.getItem('selectedIcing') || 'vanilla';

let icing = 'vanilla';
let selectedDesign = null;

const match = icingSelection.match(/^([a-z]+)(\d?)$/i);
if (match) {
  icing = match[1];
  selectedDesign = match[2] ? parseInt(match[2]) : null;
}

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

let currentModel = null;
const loader = new GLTFLoader();

function loadModel(path) {
  loader.load(
    path,
    (gltf) => {
      if (currentModel) scene.remove(currentModel);
      currentModel = gltf.scene;
      currentModel.scale.set(2.5, 2, 2.5);
      currentModel.position.set(0, -2, 0);
      scene.add(currentModel);
    },
    undefined,
    (error) => console.error(`Error loading model: ${path}`, error)
  );
}

if (selectedDesign) {
  loadModel(`./models/designs/${shape}_${icing}_style${selectedDesign}.glb`);
} else {
  loadModel(`./models/icing/${shape}_${icing}.glb`);
}

window.loadModel = function (shape, icing, styleNum) {
  sessionStorage.setItem('selectedShapeDesign', `${shape}_${styleNum}`);
  loadModel(`./models/designs/${shape}_${icing}_style${styleNum}.glb`);
};

window.loadModelByPath = loadModel;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
