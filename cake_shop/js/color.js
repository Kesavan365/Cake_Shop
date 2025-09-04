import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Load selections
const shape = sessionStorage.getItem('selectedShape') || 'round';
const icing = sessionStorage.getItem('selectedIcing') || 'vanilla';
const selectedDesign = sessionStorage.getItem('selectedDesign');
const uploadedImagePath = sessionStorage.getItem('uploadedImagePath');
const cameFrom = sessionStorage.getItem('cameFrom');

// 🔒 Disable personalization for image designs
if (cameFrom === "upload" && uploadedImagePath) {
  const personalizeBox = document.getElementById("personalizeBox");
  if (personalizeBox) {
    personalizeBox.style.display = "none";   // hides the whole box
  }

  // Alternative: allow box but block "Apply"
  window.applyName = function () {
    alert("❌ You can't add a name in this design (custom image).");
  };
}

// Setup scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 7, 22);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 0.3);
light.position.set(0, 10, 10);
scene.add(light);

const loader = new GLTFLoader();
let currentCake = null;

// Load GLTF model
function loadModel(path, callback) {
  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(2.5, 2, 2.5);
      model.position.set(0, -2, 0);

      model.traverse((child) => {
        if (child.isMesh && !child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material.clone();
        }
      });

      callback(model);
    },
    undefined,
    (error) => console.error(`Error loading: ${path}`, error)
  );
}

// Choose which cake to load
if (cameFrom === 'upload' && uploadedImagePath) {
  loadModel(`./models/image/${shape}_${icing}_image.glb`, (model) => {
    currentCake = model;
    scene.add(currentCake);

    new THREE.TextureLoader().load(uploadedImagePath, (texture) => {
      currentCake.traverse((child) => {
        if (child.isMesh && child.name === "CakeTopImage") {
          child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        }
      });
    });

    restoreCakeState(); // ✅ Restore color + name
  });
} else if (selectedDesign) {
  loadModel(`./models/designs/${shape}_${icing}_style${selectedDesign}.glb`, (model) => {
    currentCake = model;
    scene.add(currentCake);

    restoreCakeState(); // ✅ Restore color + name
  });
} else {
  loadModel(`./models/icing/${shape}_${icing}.glb`, (model) => {
    currentCake = model;
    scene.add(currentCake);

    restoreCakeState(); // ✅ Restore color + name
  });
}

function restoreCakeState() {
  // Restore frosting color
  const savedColor = sessionStorage.getItem("frostingColor");
  if (savedColor) {
    setFrostingColor(savedColor);
  }

  // Restore celebrant name only on cake (not input box)
  const savedName = sessionStorage.getItem("celebrantName");
  if (savedName) {
    applyName(savedName);   // ✅ pass name directly
    document.getElementById("celebrantName").value = "";
    document.getElementById("charCount").textContent = "30 characters left";
  }
}

// Set frosting color
window.setFrostingColor = function(hexColor) {
  const color = new THREE.Color(hexColor);
  sessionStorage.setItem('frostingColor', hexColor);

  const frostingMeshNames = [
    "IcingRing","IcingRing001","WaveIcing",
    "design1","design2","design3","design4",
    "design5","design6","design7","design8",
    "design9","design10","design11","design12",
    "design13","design14","design15","design16",
    "Mesh1","CakeTopColor","CakecolorCircle"
  ];

  if (currentCake) {
    currentCake.traverse((child) => {
      if (child.isMesh && frostingMeshNames.includes(child.name)) {
        child.material = child.userData.originalMaterial.clone();
        child.material.color = color;
      }
    });
  }
};

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to clear the selected frosting/name?")) {
    // remove both color and name
    sessionStorage.removeItem('frostingColor');
    sessionStorage.removeItem('celebrantName');

    if (currentCake) {
      currentCake.traverse((child) => {
        if (child.isMesh && child.userData.originalMaterial) {
          // ❌ Skip resetting CakeTopImage (keep uploaded image)
          if (child.name === "CakeTopImage") return;

          // ✅ Reset material
          child.material.dispose();
          child.material = child.userData.originalMaterial.clone();
        }
      });
    }
  }
});

// Apply celebrant name with dynamic position, size & color
window.applyName = function (customName) {
  const name = (customName !== undefined)
    ? customName.trim()
    : document.getElementById("celebrantName").value.trim();

  if (!name) return;

  sessionStorage.setItem("celebrantName", name);

  // Get design & icing info
  const design = sessionStorage.getItem("selectedDesign") || "0";
  const icing = sessionStorage.getItem("selectedIcing") || "vanilla";

  // 🎨 Text color based on icing flavor
  let textColor = "black";
  if (icing === "vanilla") textColor = "#000000ff";       // dark brown
  if (icing === "chocolate") textColor = "#FFD700";    // golden yellow
  if (icing === "strawberry") textColor = "#C71585";   // deep pink

  // 📐 Position & size based on design
  let fontSize = 90;
  let lineHeight = 150;
  let offsetY = 0;
  let offsetX = 0;

  switch (design) {
    case "1":
      fontSize = 85;
      offsetY = 30;
      break;
    case "2":
      fontSize = 85;
      offsetY = 170;
      break;
    case "3":
      fontSize = 110;
      offsetY = 60;
      break;
    case "4":
      fontSize = 80;
      offsetY = 150;
      offsetX = -140;
      break;
    case "5":
      fontSize = 70;
      offsetY = 150;
      offsetX = 190;
      break;
    default:
      fontSize = 90;
      offsetY = 0;
  }

  // 🖼️ Canvas setup
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Rotate canvas (keeps text upright on cake)
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);

  // 📝 Text settings
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Wrap text if long
  const maxCharsPerLine = 14;
  let lines = [];
  if (name.length > maxCharsPerLine) {
    let start = 0;
    while (start < name.length) {
      lines.push(name.substring(start, start + maxCharsPerLine));
      start += maxCharsPerLine;
    }
  } else {
    lines.push(name);
  }

  // Draw text
  const startY = offsetY - (lines.length - 1) * (lineHeight / 2);
  lines.forEach((line, i) => {
    ctx.fillText(line, offsetX, startY + i * lineHeight);
  });

  ctx.restore();

  // 🖌️ Create Three.js texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, -1);

// Apply texture
if (currentCake) {
  currentCake.traverse((child) => {
    if (child.isMesh && child.name === "CakeTopCircle" || child.name === "CakeTopColor") {
      child.material.dispose();
      child.material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });
    }
  });
}
};

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
