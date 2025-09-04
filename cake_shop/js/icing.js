import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Read selections from sessionStorage
const shape = sessionStorage.getItem('selectedShape') || 'round';
let icing = sessionStorage.getItem('selectedIcing') || null;

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

const loader = new GLTFLoader();
let currentCake = null;

function loadModel(filename) {
  loader.load(
    filename,
    (gltf) => {
      if (currentCake) scene.remove(currentCake);
      currentCake = gltf.scene;
      currentCake.scale.set(2.5, 2, 2.5);
      currentCake.position.set(0, -2, 0);
      scene.add(currentCake);
    },
    undefined,
    (error) => console.error("Error loading model:", error)
  );
}

// Load base or icing model depending on selection
if (!icing) {
  loadModel(`./models/shape/${shape}_shape.glb`);
} else {
  loadModel(`./models/icing/${shape}_${icing}.glb`);
}

window.selectIcing = function (flavor) {
  icing = flavor;
  if (flavor) {
    sessionStorage.setItem('selectedIcing', flavor);
    loadModel(`./models/icing/${shape}_${flavor}.glb`);
  } else {
    loadModel(`./models/shape/${shape}_shape.glb`);
  }
};

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
