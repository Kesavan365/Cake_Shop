// preview.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/exporters/GLTFExporter.js";

// 🔹 Load saved cake state
const savedCake = JSON.parse(sessionStorage.getItem("finalCake") || "{}");

const shape = savedCake.shape || "round";
const icing = savedCake.icing || "vanilla";
const selectedDesign = savedCake.design;
const cameFrom = savedCake.cameFrom;
const uploadedImagePath = savedCake.uploadedImagePath;
const frostingColor = savedCake.frostingColor;
const candleCategory = savedCake.candleCategory;
const candleIndex = savedCake.candleIndex ?? 0;
const candlePos = savedCake.candlePosition;
const stickCategory = savedCake.stickCategory;
const stickIndex = savedCake.stickIndex ?? 0;
const sprinkleCategory = savedCake.sprinkleCategory || null;
const sprinkleIndex = savedCake.sprinkleIndex ?? 0;

// Set cost if available
if (savedCake.cost) {
  const costInput = document.getElementById("cost");
  if (costInput) costInput.value = savedCake.cost;
}

// ---------------- Scene setup ----------------
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
let currentCandle = null;
let currentStick = null;
let sprinkleModels = [];

// ---------------- Apply celebrant name ----------------
function applyCakeText() {
  if (!currentCake) return;

  const savedName = savedCake?.celebrantName;
  if (!savedName) return;

  // 🎨 Text color based on icing
  let textColor = "#000000";
  if (icing === "chocolate") textColor = "#FFD700";   // gold
  if (icing === "strawberry") textColor = "#C71585"; // deep pink

  // 📐 Layout adjustments based on design
  let fontSize = 90, lineHeight = 150, offsetY = 0, offsetX = 0;
  switch (selectedDesign) {
    case "1": fontSize = 85; offsetY = 30; break;
    case "2": fontSize = 85; offsetY = 170; break;
    case "3": fontSize = 110; offsetY = 60; break;
    case "4": fontSize = 80; offsetY = 150; offsetX = -140; break;
    case "5": fontSize = 70; offsetY = 150; offsetX = 190; break;
  }

  // 🖼️ Canvas for text
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

  // Wrap text
  const maxCharsPerLine = 14;
  const lines = [];
  for (let i = 0; i < savedName.length; i += maxCharsPerLine) {
    lines.push(savedName.substring(i, i + maxCharsPerLine));
  }

  const startY = offsetY - (lines.length - 1) * (lineHeight / 2);
  lines.forEach((line, i) => {
    ctx.fillText(line, offsetX, startY + i * lineHeight);
  });

  ctx.restore();

  // 🔄 Apply texture to cake
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, -1);

  currentCake.traverse((child) => {
    if (child.isMesh && (child.name === "CakeTopCircle" || child.name === "CakeTopColor")) {
      if (child.material) child.material.dispose();
      child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    }
  });
}

// ---------------- Load model helper ----------------
function loadModel(path, callback) {
  loader.load(path, (gltf) => {
    const model = gltf.scene;
    model.scale.set(2.5, 2, 2.5);
    model.position.set(0, -2, 0);
    callback(model);
  });
}

// ---------------- Load Cake ----------------
if (cameFrom === "upload" && uploadedImagePath) {
  loadModel(`./models/image/${shape}_${icing}_image.glb`, (model) => {
    currentCake = model;
    scene.add(currentCake);

    // Apply uploaded top image texture
    new THREE.TextureLoader().load(uploadedImagePath, (texture) => {
      currentCake.traverse((child) => {
        if (child.isMesh && child.name === "CakeTopImage") {
          child.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        }
      });
      applySavedColor();
      applyCakeText();
    });

    loadCandle();
    loadStick();
    loadSprinkle();
  });
} else if (selectedDesign) {
  loadModel(`./models/designs/${shape}_${icing}_style${selectedDesign}.glb`, (model) => {
    currentCake = model;
    scene.add(currentCake);

    applySavedColor();
    applyCakeText();

    loadCandle();
    loadStick();
    loadSprinkle();
  });
} else {
  loadModel(`./models/icing/${shape}_${icing}.glb`, (model) => {
    currentCake = model;
    scene.add(currentCake);

    applySavedColor();
    applyCakeText();

    loadCandle();
    loadStick();
    loadSprinkle();
  });
}

// ---------------- Apply frosting color ----------------
function applySavedColor() {
  if (!frostingColor || !currentCake) return;
  const color = new THREE.Color(frostingColor);

  const frostingMeshNames = [
    "IcingRing","IcingRing001","WaveIcing",
    "design1","design2","design3","design4",
    "design5","design6","design7","design8",
    "design9","design10","design11","design12",
    "design13","design14","design15","design16",
    "Mesh1","CakecolorCircle","CakeTopColor"
  ];

  currentCake.traverse((child) => {
    if (child.isMesh && frostingMeshNames.includes(child.name)) {
      child.material.color = color;
    }
  });
}

// ---------------- Candle ----------------
const candleCategories = {
  wax: ['./models/accessories/candles/wax1.glb','./models/accessories/candles/wax2.glb','./models/accessories/candles/wax3.glb','./models/accessories/candles/wax4.glb'],
  sparkler: ['./models/accessories/candles/sparkler1.glb','./models/accessories/candles/sparkler2.glb','./models/accessories/candles/sparkler3.glb','./models/accessories/candles/sparkler4.glb'],
  number: ['./models/accessories/candles/number1.glb','./models/accessories/candles/number2.glb','./models/accessories/candles/number3.glb','./models/accessories/candles/number4.glb','./models/accessories/candles/number5.glb','./models/accessories/candles/number6.glb','./models/accessories/candles/number7.glb','./models/accessories/candles/number8.glb','./models/accessories/candles/number9.glb','./models/accessories/candles/number0.glb']
};

function loadCandle() {
  if (!candleCategory || !candleCategories[candleCategory]) return;
  const path = candleCategories[candleCategory][candleIndex] || candleCategories[candleCategory][0];
  loadModel(path, (model) => {
    currentCandle = model;
    if (candlePos) currentCandle.position.set(candlePos.x, candlePos.y, candlePos.z);
    else currentCandle.position.set(0, 1.2, 0);
    scene.add(currentCandle);
  });
}

// ---------------- Stick ----------------
const stickCategories = {
  birthday: ["./models/accessories/sticks/birthday_stick1.glb","./models/accessories/sticks/birthday_stick2.glb","./models/accessories/sticks/birthday_stick3.glb"],
  anniversary: ["./models/accessories/sticks/anniversary_stick1.glb","./models/accessories/sticks/anniversary_stick2.glb","./models/accessories/sticks/anniversary_stick3.glb"],
  mother: ["./models/accessories/sticks/mother_stick1.glb","./models/accessories/sticks/mother_stick2.glb","./models/accessories/sticks/mother_stick3.glb"]
};

const stickPositions = {
  round: { 1: new THREE.Vector3(1.7, 0, -1.7), 2: new THREE.Vector3(-1, 0, -2), 3: new THREE.Vector3(-2, 0, -2), 4: new THREE.Vector3(3, 0, 0), 5: new THREE.Vector3(3, 0, 0) },
  square: { 1: new THREE.Vector3(-1.5, 0, 1.9), 2: new THREE.Vector3(-1, 0, -2), 3: new THREE.Vector3(2.5, 0, -2), 4: new THREE.Vector3(2, 0, 1.9), 5: new THREE.Vector3(2.5, 0, 0) },
  heart: { 1: new THREE.Vector3(2, 0, -1), 2: new THREE.Vector3(-2, 0, -1.5), 3: new THREE.Vector3(-1.2, 0, -1), 4: new THREE.Vector3(2.5, 0, 0), 5: new THREE.Vector3(2.5, 0, 0) }
};

function loadStick() {
  if (!stickCategory || !stickCategories[stickCategory]) return;
  const designNum = parseInt(selectedDesign || "1");
  const pos = (stickPositions[shape] && stickPositions[shape][designNum]) || new THREE.Vector3(0, 0, 0);
  const path = stickCategories[stickCategory][stickIndex] || stickCategories[stickCategory][0];
  loadModel(path, (model) => {
    currentStick = model;
    currentStick.position.copy(pos);
    scene.add(currentStick);
  });
}

// ---------------- Sprinkles ----------------
const sprinkleCategories = {
  rainbow: {
    round: ["./models/accessories/sprinkles/rainbow_round1.glb","./models/accessories/sprinkles/rainbow_round2.glb","./models/accessories/sprinkles/rainbow_round3.glb"],
    square: ["./models/accessories/sprinkles/rainbow_square1.glb","./models/accessories/sprinkles/rainbow_square2.glb","./models/accessories/sprinkles/rainbow_square3.glb"],
    heart: ["./models/accessories/sprinkles/rainbow_heart1.glb","./models/accessories/sprinkles/rainbow_heart2.glb","./models/accessories/sprinkles/rainbow_heart3.glb"]
  },
  choco: {
    round: ["./models/accessories/sprinkles/choco_round1.glb","./models/accessories/sprinkles/choco_round2.glb","./models/accessories/sprinkles/choco_round3.glb"],
    square: ["./models/accessories/sprinkles/choco_square1.glb","./models/accessories/sprinkles/choco_square2.glb","./models/accessories/sprinkles/choco_square3.glb"],
    heart: ["./models/accessories/sprinkles/choco_heart1.glb","./models/accessories/sprinkles/choco_heart2.glb","./models/accessories/sprinkles/choco_heart3.glb"]
  },
  sugar: {
    round: ["./models/accessories/sprinkles/sugar_round1.glb","./models/accessories/sprinkles/sugar_round2.glb","./models/accessories/sprinkles/sugar_round3.glb"],
    square: ["./models/accessories/sprinkles/sugar_square1.glb","./models/accessories/sprinkles/sugar_square2.glb","./models/accessories/sprinkles/sugar_square3.glb"],
    heart: ["./models/accessories/sprinkles/sugar_heart1.glb","./models/accessories/sprinkles/sugar_heart2.glb","./models/accessories/sprinkles/sugar_heart3.glb"]
  }
};

function loadSprinkle() {
  if (!sprinkleCategory || !sprinkleCategories[sprinkleCategory]) return;
  const paths = sprinkleCategories[sprinkleCategory][shape];
  if (!paths) return;

  const pos = new THREE.Vector3(0, -1.9, 0);
  paths.forEach((path, i) => {
    loadModel(path, (model) => {
      model.visible = i === sprinkleIndex;
      model.position.copy(pos);
      sprinkleModels[i] = model;
      scene.add(model);
    });
  });
}

// ---------------- Handle form submit ----------------
document.getElementById("cakeOrderForm").addEventListener("submit", async function(event) {
  event.preventDefault();
  const exporter = new GLTFExporter();
  exporter.parse(scene, async (result) => {
    let blob = result instanceof ArrayBuffer
      ? new Blob([result], { type: "model/gltf-binary" })
      : new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });

    const formData = new FormData(this);
    formData.append("cakeModel", blob, "cake_" + Date.now() + ".glb");

    let response = await fetch("saveorder.php", { method: "POST", body: formData });
    let resultText = await response.text();
    alert(resultText);
  }, { binary: true });
});

// ---------------- Navigation ----------------
window.goBack = () => window.history.back();

// ---------------- Animation ----------------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

