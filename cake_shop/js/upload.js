import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

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

// 🧹 clear previous session image
sessionStorage.removeItem("uploadedImagePath");

const loader = new GLTFLoader();
let cake;

// 🥮 get previous selections
const shape = sessionStorage.getItem("selectedShape") || "round";
const fullIcing = sessionStorage.getItem("selectedIcing") || "vanilla";
const icing = fullIcing.match(/^([a-z]+)/i)?.[1] || "vanilla";
const modelPath = `./models/image/${shape}_${icing}_image.glb`;

loader.load(modelPath, (gltf) => {
  cake = gltf.scene;
  cake.scale.set(2.5, 2, 2.5);
  cake.position.set(0, -2, 0);
  scene.add(cake);

  // 📤 Apply button
  document.getElementById("applyImageBtn").addEventListener("click", () => {
    const file = document.getElementById("customImage").files[0];
    if (!file) {
      alert("Please select an image to apply.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;

        cake.traverse((child) => {
          if (child.isMesh && child.name === "CakeTopImage") {
            child.material = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
            });
          }
        });
      };
    };
    reader.readAsDataURL(file);
  });

  // ➡️ Next button
  document.getElementById("nextBtn").addEventListener("click", () => {
    const file = document.getElementById("customImage").files[0];
    if (!file) {
      alert("Please upload your image before proceeding.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    fetch("upload.php", { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          // 🔄 store in session
          sessionStorage.setItem("uploadedImagePath", data.filePath);
          sessionStorage.setItem("cameFrom", "upload");
          window.location.href = "color.html";
        } else {
          alert("Upload failed: " + data.message);
        }
      })
      .catch(() => alert("Failed to upload image."));
  });
});

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
