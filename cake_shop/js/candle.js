// candle.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// --- use sessionStorage instead of localStorage ---
const shape = sessionStorage.getItem('selectedShape') || 'round';
const icing = sessionStorage.getItem('selectedIcing') || 'vanilla';
const selectedDesign = sessionStorage.getItem('selectedDesign');
const cameFrom = sessionStorage.getItem('cameFrom');
const uploadedImagePath = sessionStorage.getItem('uploadedImagePath');

// Candle positions by cake shape
const candlePositions = {
  round: { 1: new THREE.Vector3(-1.7, 0, 2), 2: new THREE.Vector3(2.5, 0, 0), 3: new THREE.Vector3(-1, 0, 2), 4: new THREE.Vector3(0, 0, -2), 5: new THREE.Vector3(0, 0, -2) },
  square: { 1: new THREE.Vector3(1.5, 0, 1.5), 2: new THREE.Vector3(2.4, 0, 0), 3: new THREE.Vector3(0, 0, -1), 4: new THREE.Vector3(-1.5, 0, -1.9), 5: new THREE.Vector3(0, 0, -2) },
  heart: { 1: new THREE.Vector3(-2, -0.2, -1), 2: new THREE.Vector3(2, -0.2, 0.7), 3: new THREE.Vector3(1.5, -0.2, 0.1), 4: new THREE.Vector3(-2, -0.2, -1), 5: new THREE.Vector3(0, -0.2, -0.45) }
};

// Scene setup
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

// Load 3D model
function loadModel(path, callback) {
  loader.load(path, (gltf) => {
    const model = gltf.scene;
    model.scale.set(2.5, 2, 2.5);
    model.position.set(0, -2, 0);

    model.traverse((child) => {
      if (child.isMesh) child.userData.originalMaterial = child.material.clone();
    });

    callback(model);
  });
}

// Candle categories
const candleCategories = {
  wax: ['./models/accessories/candles/wax1.glb','./models/accessories/candles/wax2.glb','./models/accessories/candles/wax3.glb','./models/accessories/candles/wax4.glb'],
  sparkler: ['./models/accessories/candles/sparkler1.glb','./models/accessories/candles/sparkler2.glb','./models/accessories/candles/sparkler3.glb','./models/accessories/candles/sparkler4.glb'],
  number: ['./models/accessories/candles/number1.glb','./models/accessories/candles/number2.glb','./models/accessories/candles/number3.glb','./models/accessories/candles/number4.glb','./models/accessories/candles/number5.glb','./models/accessories/candles/number6.glb','./models/accessories/candles/number7.glb','./models/accessories/candles/number8.glb','./models/accessories/candles/number9.glb','./models/accessories/candles/number0.glb']
};

let candleModels = [];
let currentCategory = sessionStorage.getItem('candleCategory');
let currentCandleIndex = parseInt(sessionStorage.getItem('candleIndex') || '0');

// --- Save cake state globally ---
function saveCakeState() {
  const candlePos = JSON.parse(sessionStorage.getItem("candlePosition") || "{}");
  const cakeState = {
    shape,
    icing,
    design: selectedDesign,
    cameFrom,
    uploadedImagePath,
    frostingColor: sessionStorage.getItem("frostingColor"),
    candleCategory: currentCategory,
    candleIndex: currentCandleIndex,
    candlePosition: candlePos,
    celebrantName: sessionStorage.getItem("celebrantName")
  };
  sessionStorage.setItem("finalCake", JSON.stringify(cakeState));
}

// --- Apply saved cake state ---
function applySavedCakeState() {
  if (!currentCake) return;

  // Frosting color
  const savedColor = sessionStorage.getItem('frostingColor');
  if (savedColor) {
    const color = new THREE.Color(savedColor);
    const frostingMeshNames = [
      "IcingRing","IcingRing001","WaveIcing",
      "design1","design2","design3","design4",
      "design5","design6","design7","design8",
      "design9","design10","design11","design12",
      "design13","design14","design15","design16",
      "Mesh1","CakeTopColor","CakecolorCircle"
    ];
    currentCake.traverse((child) => {
      if (child.isMesh && frostingMeshNames.includes(child.name) && child.userData.originalMaterial) {
        child.material = child.userData.originalMaterial.clone();
        child.material.color = color;
      }
    });
  }

  // Celebrant name
  const savedName = sessionStorage.getItem('celebrantName');
  if (savedName) {
    const design = sessionStorage.getItem("selectedDesign") || "0";
    const icing = sessionStorage.getItem("selectedIcing") || "vanilla";

    // 🎨 Text color based on icing flavor
    let textColor = "black";
    if (icing === "vanilla") textColor = "#000000ff";
    if (icing === "chocolate") textColor = "#FFD700";
    if (icing === "strawberry") textColor = "#C71585";

    // 📐 Position & size based on design
    let fontSize = 90;
    let lineHeight = 150;
    let offsetY = 0;
    let offsetX = 0;

    switch (design) {
      case "1": fontSize = 85; offsetY = 30; break;
      case "2": fontSize = 85; offsetY = 170; break;
      case "3": fontSize = 110; offsetY = 60; break;
      case "4": fontSize = 80; offsetY = 150; offsetX = -140; break;
      case "5": fontSize = 70; offsetY = 150; offsetX = 190;  break;
      default: fontSize = 90; offsetY = 0;
    }

    // 🖼️ Canvas setup
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);

    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const maxCharsPerLine = 14;
    let lines = [];
    if (savedName.length > maxCharsPerLine) {
      for (let start = 0; start < savedName.length; start += maxCharsPerLine) {
        lines.push(savedName.substring(start, start + maxCharsPerLine));
      }
    } else {
      lines.push(savedName);
    }

    const startY = offsetY - (lines.length - 1) * (lineHeight / 2);
    lines.forEach((line, i) => {
      ctx.fillText(line, offsetX, startY + i * lineHeight);
    });

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, -1);

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
}

// --- Load Cake ---
function loadCake() {
  if (cameFrom === 'upload' && uploadedImagePath) {
    loadModel(`./models/image/${shape}_${icing}_image.glb`, (model) => {
      currentCake = model;
      scene.add(currentCake);

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(uploadedImagePath, (texture) => {
        currentCake.traverse((child) => {
          if (child.isMesh && child.name === "CakeTopImage") {
            child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
          }
        });
        applySavedCakeState();
      });
    });
  } else if (selectedDesign) {
    loadModel(`./models/designs/${shape}_${icing}_style${selectedDesign}.glb`, (model) => {
      currentCake = model;
      scene.add(currentCake);
      applySavedCakeState();
    });
  } else {
    loadModel(`./models/icing/${shape}_${icing}.glb`, (model) => {
      currentCake = model;
      scene.add(currentCake);
      applySavedCakeState();
    });
  }
}
loadCake();

// --- Candle Functions ---
function loadCandleModels(category) {
  // Remove old candles
  candleModels.forEach(c => scene.remove(c));
  candleModels = [];

  const designNum = parseInt(sessionStorage.getItem('selectedDesign') || '1');
  const pos = (candlePositions[shape] && candlePositions[shape][designNum]) || new THREE.Vector3(0, 1.2, 0);

  // Keep models in order by index
  candleCategories[category].forEach((path, i) => {
    loadModel(path, (model) => {
      model.visible = false;
      model.position.copy(pos);

      candleModels[i] = model; // ✅ force correct index
      scene.add(model);

      // Show correct candle if this is the selected one
      if (i === currentCandleIndex) {
        showCandle(i);
      }
    });
  });

  document.getElementById('candle-controls').style.display = 'flex';
}

window.changeCandleCategory = function(category) {
  candleModels.forEach(c => scene.remove(c));
  currentCategory = category;
  currentCandleIndex = 0;
  sessionStorage.setItem('candleCategory', category);
  sessionStorage.setItem('candleIndex', 0);
  loadCandleModels(category);
};

function showCandle(index) {
  candleModels.forEach((candle, i) => {
    candle.visible = (i === index);
    if (i === index) {
      const pos = candle.position.clone();
      sessionStorage.setItem("candlePosition", JSON.stringify(pos));
    }
  });
  currentCandleIndex = index;
  sessionStorage.setItem('candleIndex', index);
  saveCakeState();
}

// Restore candles if previously selected
if (currentCategory) loadCandleModels(currentCategory);

// Navigation buttons
document.getElementById('prevCandle').addEventListener('click', () => {
  if (!candleModels.length) return;
  currentCandleIndex = (currentCandleIndex - 1 + candleModels.length) % candleModels.length;
  showCandle(currentCandleIndex);
});
document.getElementById('nextCandle').addEventListener('click', () => {
  if (!candleModels.length) return;
  currentCandleIndex = (currentCandleIndex + 1) % candleModels.length;
  showCandle(currentCandleIndex);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to clear the selected candles?")) {
    // --- Remove candles only ---
    candleModels.forEach(c => scene.remove(c));
    candleModels = [];
    currentCategory = null;
    currentCandleIndex = 0;
    sessionStorage.removeItem('candleCategory');
    sessionStorage.removeItem('candleIndex');
    sessionStorage.removeItem('candlePosition');
    document.getElementById('candle-controls').style.display = 'none';

    // Save updated state
    saveCakeState();
  }
});

// Page navigation
window.goNext = () => {
  saveCakeState();
  window.location.href = 'stick.html';
};
window.goBack = () => window.location.href = 'color.html';

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
