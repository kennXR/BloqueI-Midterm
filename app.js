// ========================================
// === CONFIGURACIÓN INICIAL ===
// ========================================

// === Importar librerías ===
console.log(THREE);
console.log(gsap);

// === Configurar canvas ===
const canvas = document.getElementById("lienzo");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// === Escena ===
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.width, canvas.height);
renderer.setClearColor("#000000");
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);

// ========================================
// === GEOMETRÍAS Y MATERIALES ===
// ========================================

// === Geometrías ===
const geo1 = new THREE.TorusGeometry(2.4, 0.2, 32, 100);  // torus1: más grande y delgado
const geo2 = new THREE.TorusGeometry(1.8, 0.3, 32, 100);  // torus2: mediano
const geo3 = new THREE.TorusGeometry(1.2, 0.25, 32, 100); // torus3: más pequeño

// Necesario para que funcione el aoMap (ambient occlusion)
geo1.setAttribute("uv2", new THREE.BufferAttribute(geo1.attributes.uv.array, 2));
geo2.setAttribute("uv2", new THREE.BufferAttribute(geo2.attributes.uv.array, 2));
geo3.setAttribute("uv2", new THREE.BufferAttribute(geo3.attributes.uv.array, 2));

// === Materiales temporales (se reemplazarán con texturas) ===
const mat1 = new THREE.MeshStandardMaterial({ color: "#ffffff" });
const mat2 = new THREE.MeshStandardMaterial({ color: "#ff5555" });
const mat3 = new THREE.MeshStandardMaterial({ color: "#55ff55" });

// === Crear meshes ===
const torus1 = new THREE.Mesh(geo1, mat1);
const torus2 = new THREE.Mesh(geo2, mat2);
const torus3 = new THREE.Mesh(geo3, mat3);

// ========================================
// === CONFIGURACIÓN DE TORUS ===
// ========================================

// === Grupos de torus ===
const torus2Group = new THREE.Group();
torus2Group.add(torus2);

const torus3Group = new THREE.Group();
torus3Group.add(torus3);

// === Posicionamiento y escalas ===
// Los tres torus en el mismo eje central para crear efecto de molinetas entrelazadas
torus1.position.set(0, 0, 0);              // Centro del eje
torus1.rotation.x = 0;                     // Rotación base para molineta vertical
torus1.rotation.y = 0;                     // Rotación base para molineta vertical
torus1.scale.set(1.25, 1.25, 1.25);       // Escala más grande

torus2Group.position.set(0, 0, 0);         // Mismo centro que torus1
torus2Group.rotation.x = Math.PI / 2;      // Rotación base para molineta horizontal
torus2Group.rotation.y = 0;                // Rotación base para molineta horizontal
torus2Group.scale.set(0.8, 0.8, 0.8);     // Escala mediana

torus3Group.position.set(0, 0, 0);         // Mismo centro que los otros
torus3Group.rotation.x = 0;                // Rotación base para molineta diagonal
torus3Group.rotation.z = Math.PI / 4;      // Rotación 45° en Z para orientación diagonal
torus3Group.scale.set(0.5, 0.5, 0.5);     // Escala más pequeña

// === Agregar a la escena ===
scene.add(torus1);
scene.add(torus2Group);
scene.add(torus3Group);

// === Array para gestión de todos los torus ===
const torusGroup = [torus1, torus2Group, torus3Group];

// ========================================
// === ILUMINACIÓN ===
// ========================================

// === Luz frontal principal ===
const frontLight = new THREE.PointLight("#ffffff", 400, 120);
frontLight.position.set(7, 3, 3);
scene.add(frontLight);

// === Luz de borde (rim light) ===
const rimLight = new THREE.PointLight("#0066ff", 100, 120);
rimLight.position.set(-7, -3, -7);
scene.add(rimLight);

// === Luz ambiental para rellenar sombras ===
const ambientLight = new THREE.AmbientLight("#ffffff", 0.35);
scene.add(ambientLight);

// ========================================
// === SISTEMA DE ESTRELLAS ===
// ========================================

// === Crear geometría de partículas para estrellas ===
const starCount = 2000;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

// === Generar posiciones y colores aleatorios para las estrellas ===
for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  
  // Posiciones aleatorias en una esfera grande
  const radius = 200 + Math.random() * 300;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  
  starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  starPositions[i3 + 2] = radius * Math.cos(phi);
  
  // Colores aleatorios entre blanco y azul claro
  const brightness = 0.7 + Math.random() * 0.3;
  starColors[i3] = brightness; // R
  starColors[i3 + 1] = brightness * 0.9; // G (ligeramente menos verde)
  starColors[i3 + 2] = brightness; // B
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

// === Crear material de partículas ===
const starMaterial = new THREE.PointsMaterial({
  size: 2.0, // Estrellas más grandes
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true
});

// === Crear sistema de partículas ===
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// ========================================
// === CARGA DE TEXTURAS ===
// ========================================

// === Configuración del loader ===
const manager = new THREE.LoadingManager();
manager.onLoad = () => { console.log("✅ Texturas cargadas"); createMaterial(); };
const loader = new THREE.TextureLoader(manager);

// === Texturas ICE (por defecto) ===
const tex = {
  albedo: loader.load("./assets/texturas/ice/iced-over-ground7-albedo.png"),
  ao: loader.load("./assets/texturas/ice/iced-over-ground7-ao.png"),
  normal: loader.load("./assets/texturas/ice/iced-over-ground7-Normal-ogl.png"),
  displacement: loader.load("./assets/texturas/ice/iced-over-ground7-Height.png"),
};

// === Texturas MARBLE ===
const texMarble = {
  albedo: loader.load("./assets/texturas/marble/white-marble_albedo.png"),
  ao: loader.load("./assets/texturas/marble/white-marble_ao.png"),
  metalness: loader.load("./assets/texturas/marble/white-marble_metallic.png"),
  normal: loader.load("./assets/texturas/marble/white-marble_normal-ogl.png"),
  roughness: loader.load("./assets/texturas/marble/white-marble_roughness.png"),
  displacement: loader.load("./assets/texturas/marble/white-marble_height.png"),
};

// === Texturas LAVA ===
const texLava = {
  albedo: loader.load("./assets/texturas/lava/columned-lava-rock_albedo.png"),
  ao: loader.load("./assets/texturas/lava/columned-lava-rock_ao.png"),
  metalness: loader.load("./assets/texturas/lava/columned-lava-rock_metallic.png"),
  normal: loader.load("./assets/texturas/lava/columned-lava-rock_normal-ogl.png"),
  roughness: loader.load("./assets/texturas/lava/columned-lava-rock_roughness.png"),
  displacement: loader.load("./assets/texturas/lava/columned-lava-rock_height.png"),
};

// === Texturas ALIEN ===
const texAlien = {
  albedo: loader.load("./assets/texturas/alien/alien-panels_albedo.png"),
  ao: loader.load("./assets/texturas/alien/alien-panels_ao.png"),
  metalness: loader.load("./assets/texturas/alien/alien-panels_metallic.png"),
  normal: loader.load("./assets/texturas/alien/alien-panels_normal-ogl.png"),
  roughness: loader.load("./assets/texturas/alien/alien-panels_roughness.png"),
  displacement: loader.load("./assets/texturas/alien/alien-panels_height.png"),
};

// === Texturas BOG ===
const texBog = {
  albedo: loader.load("./assets/texturas/bog/bog_albedo.png"),
  ao: loader.load("./assets/texturas/bog/bog_ao.png"),
  normal: loader.load("./assets/texturas/bog/bog_normal-ogl.png"),
  displacement: loader.load("./assets/texturas/bog/bog_height.png"),
};

// === Texturas COARSE ===
const texCoarse = {
  albedo: loader.load("./assets/texturas/coarse/coarse-loose-fabric_albedo.png"),
  ao: loader.load("./assets/texturas/coarse/coarse-loose-fabric_ao.png"),
  metalness: loader.load("./assets/texturas/coarse/coarse-loose-fabric_metallic.png"),
  normal: loader.load("./assets/texturas/coarse/coarse-loose-fabric_normal-ogl.png"),
  roughness: loader.load("./assets/texturas/coarse/coarse-loose-fabric_roughness.png"),
  displacement: loader.load("./assets/texturas/coarse/coarse-loose-fabric_height.png"),
};

// === Texturas FOREST ===
const texForest = {
  albedo: loader.load("./assets/texturas/forest/forest_floor_albedo.png"),
  ao: loader.load("./assets/texturas/forest/forest_floor-ao.png"),
  metalness: loader.load("./assets/texturas/forest/forest_floor_Metallic.png"),
  normal: loader.load("./assets/texturas/forest/forest_floor_Normal-dx.png"),
  roughness: loader.load("./assets/texturas/forest/forest_floor_Roughness.png"),
  displacement: loader.load("./assets/texturas/forest/forest_floor_Height.png"),
};

// === Texturas RUSTED ===
const texRusted = {
  albedo: loader.load("./assets/texturas/rusted/albedo.png"),
  metalness: loader.load("./assets/texturas/rusted/metallic.png"),
  normal: loader.load("./assets/texturas/rusted/normal.png"),
  roughness: loader.load("./assets/texturas/rusted/roughness.png"),
};

// === Texturas ANTIQUE ===
const texAntique = {
  albedo: loader.load("./assets/texturas/antique/antique-grate1-albedo.png"),
  ao: loader.load("./assets/texturas/antique/antique-grate1-ao.png"),
  normal: loader.load("./assets/texturas/antique/antique-grate1-normal-ogl.png"),
  displacement: loader.load("./assets/texturas/antique/antique-grate1-height.png"),
};

// === Texturas WOOD ===
const texWood = {
  albedo: loader.load("./assets/texturas/wood/cheap_plywood1r_albedo.png"),
  ao: loader.load("./assets/texturas/wood/cheap_plywood1r_ao.png"),
  normal: loader.load("./assets/texturas/wood/cheap_plywood1r_Normal-ogl.png"),
  displacement: loader.load("./assets/texturas/wood/cheap_plywood1r_Height.png"),
};

// ========================================
// === CREACIÓN DE MATERIALES ===
// ========================================

let materials = {};

function createMaterial() {
  // Crear materiales PBR para todas las texturas disponibles
  materials.ice = new THREE.MeshStandardMaterial({
    map: tex.albedo, aoMap: tex.ao, metalness: 0.3, normalMap: tex.normal,
    roughness: 0.2, displacementMap: tex.displacement, displacementScale: 0.6, side: THREE.FrontSide,
  });
  
  materials.marble = new THREE.MeshStandardMaterial({
    map: texMarble.albedo, aoMap: texMarble.ao, metalness: 0.4, 
    normalMap: texMarble.normal, roughness: 0.3,
    displacementMap: texMarble.displacement, displacementScale: 0.3, side: THREE.FrontSide,
  });
  
  // Lava en blanco: usamos los mapas físicos (normal, roughness, displacement)
  // pero sin el albedo rojo, para que el resultado sea blanco con relieve
  materials.lava = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'),
    normalMap: texLava.normal,
    roughnessMap: texLava.roughness,
    displacementMap: texLava.displacement,
    displacementScale: 0.9,
    metalness: 0.3,
    roughness: 0.4,
    side: THREE.FrontSide,
  });
  
  materials.alien = new THREE.MeshStandardMaterial({
    map: texAlien.albedo, aoMap: texAlien.ao, metalness: 0.5,
    normalMap: texAlien.normal, roughness: 0.3,
    displacementMap: texAlien.displacement, displacementScale: 0.6, side: THREE.FrontSide,
  });
  
  // Bog en blanco con azul: usamos un gradiente de color y los mapas físicos
  materials.bog = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#e6f3ff'), // Azul muy claro
    normalMap: texBog.normal,
    displacementMap: texBog.displacement,
    displacementScale: 0.4,
    metalness: 0.3,
    roughness: 0.6,
    side: THREE.FrontSide,
  });
  
  materials.coarse = new THREE.MeshStandardMaterial({
    map: texCoarse.albedo, aoMap: texCoarse.ao, metalness: 0.4,
    normalMap: texCoarse.normal, roughness: 0.4,
    displacementMap: texCoarse.displacement, displacementScale: 0.4, side: THREE.FrontSide,
  });
  
  materials.forest = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'), // Base blanca
    aoMap: texForest.ao, // Ambient occlusion para sombras azules
    normalMap: texForest.normal,
    displacementMap: texForest.displacement,
    displacementScale: 0.8,
    metalness: 0.3,
    roughness: 0.5,
    side: THREE.FrontSide,
  });
  
  materials.rusted = new THREE.MeshStandardMaterial({
    map: texRusted.albedo, metalness: 0.5,
    normalMap: texRusted.normal, roughness: 0.4,
    side: THREE.FrontSide,
  });
  
  // Antique en blanco con luces azules: usamos color base blanco y metalness para reflejos azules
  materials.antique = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'), // Base blanca
    aoMap: texAntique.ao, // Ambient occlusion para sombras azules
    normalMap: texAntique.normal,
    displacementMap: texAntique.displacement,
    displacementScale: 0.5,
    metalness: 0.4,
    roughness: 0.3,
    side: THREE.FrontSide,
  });
  
  materials.wood = new THREE.MeshStandardMaterial({
    map: texWood.albedo, aoMap: texWood.ao,
    normalMap: texWood.normal,
    metalness: 0.3, roughness: 0.5,
    displacementMap: texWood.displacement, displacementScale: 0.4,
    side: THREE.FrontSide,
  });

  
  // === Asignar materiales iniciales ===
  torus1.material = materials.ice;
  torus2.material = materials.marble;
  torus3.material = materials.wood;
}

// ========================================
// === SISTEMA DE ROTACIÓN ===
// ========================================

// === Variables de scroll ===
const scroll = { x: 0, y: 0, lerpedX: 0, lerpedY: 0, speed: 0.005, cof: 0.1 };

// === Event listener para scroll ===
window.addEventListener("wheel", e => {
  scroll.x += e.deltaX * scroll.speed;
  scroll.y += e.deltaY * scroll.speed;
});

// === Función principal de rotación ===
function updateMeshRotation() {
  // Rotación independiente como molinetas
  // torus1: molineta vertical (rota en Y)
  torus1.rotation.y += 0.01;  // Rotación continua en Y
  
  // torus2Group: molineta horizontal (rota en X)
  torus2Group.rotation.x += 0.008;  // Rotación continua en X (más lenta)
  
  // torus3Group: molineta diagonal (rota en Z)
  torus3Group.rotation.z += 0.012;  // Rotación continua en Z (velocidad intermedia)
  
  // Aplicar scroll como offset adicional
  torus1.rotation.x = scroll.lerpedX * 0.5;  // Scroll horizontal afecta rotación X
  torus2Group.rotation.y = scroll.lerpedY * 0.5;  // Scroll vertical afecta rotación Y
  torus3Group.rotation.x = scroll.lerpedX * 0.3;  // Scroll horizontal afecta rotación X
  torus3Group.rotation.y = scroll.lerpedY * 0.3;  // Scroll vertical afecta rotación Y
}

// === Funciones de interpolación suave ===
function lerpScrollY() { scroll.lerpedY += (scroll.y - scroll.lerpedY) * scroll.cof; }
function lerpScrollX() { scroll.lerpedX += (scroll.x - scroll.lerpedX) * scroll.cof; }

// ========================================
// === SISTEMA DE CÁMARA ===
// ========================================

// === Variables de mouse ===
const mouse = { 
  x: 0, y: 0, 
  normalOffset: {x:0,y:0}, 
  lerpNormalOffset:{x:0,y:0}, 
  cof:0.07, 
  gazeRange:{x:70,y:30}
};

// === Event listener para movimiento del mouse ===
window.addEventListener("mousemove", e => {
  mouse.x = e.clientX; 
  mouse.y = e.clientY;
  let cx = canvas.width/2, cy = canvas.height/2;
  mouse.normalOffset.x = ((mouse.x - cx) / canvas.width) * 2;
  mouse.normalOffset.y = ((mouse.y - cy) / canvas.height) * 2;
});

// === Función para actualizar posición de la cámara ===
function updateCameraPosition() {
  camera.position.x = mouse.lerpNormalOffset.x * mouse.gazeRange.x;
  camera.position.y = -mouse.lerpNormalOffset.y * mouse.gazeRange.y;
}
// === Función de interpolación suave para distancia al centro ===
function lerpDistanceToCenter() {
  mouse.lerpNormalOffset.x += (mouse.normalOffset.x - mouse.lerpNormalOffset.x) * mouse.cof;
  mouse.lerpNormalOffset.y += (mouse.normalOffset.y - mouse.lerpNormalOffset.y) * mouse.cof;
}

// ========================================
// === INTERACCIONES ===
// ========================================

// === Click para escalar torus ===
const minScale = 0.5, maxScale = 3;
canvas.addEventListener("click", () => {
  torusGroup.forEach(obj => {
    if (obj.scale.x >= maxScale) {
      gsap.to(obj.scale, {x:minScale,y:minScale,z:minScale,duration:1,ease:"bounce.out"});
    } else {
      gsap.to(obj.scale, {x:maxScale,y:maxScale,z:maxScale,duration:1,ease:"bounce.out"});
    }
  });
});

// ========================================
// === SISTEMA DE ANIMACIÓN ===
// ========================================

// === Función principal de animación ===
function animate() {
    requestAnimationFrame(animate);

    // Actualizar rotaciones de los torus
    updateMeshRotation();
    
    // Aplicar interpolaciones suaves
    lerpScrollY();
    lerpScrollX();
    lerpDistanceToCenter(); 
    updateCameraPosition();

    // === Animación de estrellas (parpadeo sutil) ===
    const time = Date.now() * 0.0005;
    stars.rotation.y = time * 0.1; // Rotación muy lenta
    starMaterial.opacity = 0.6 + Math.sin(time) * 0.2; // Parpadeo sutil

    // Los torus ahora rotan como molinetas independientes en el mismo eje

    // Renderizar la escena
    camera.lookAt(torus1.position);
    renderer.render(scene, camera);
}

// ========================================
// === SISTEMA DE BOTONES ===
// ========================================

// === Tipos de texturas disponibles ===
const textureTypes = ['ice', 'marble', 'lava', 'alien', 'bog', 'coarse', 'forest', 'rusted', 'antique', 'wood'];

// === Configurar event listeners para todos los botones ===
textureTypes.forEach(texture => {
  // Botones lado izquierdo (torus1)
  const button = document.getElementById(`${texture}Button`);
  if (button) {
    button.addEventListener("mousedown", () => {
      torus1.material = materials[texture];
    });
  }
  
  // Botones lado derecho (torus2)
  const button2 = document.getElementById(`${texture}Button2`);
  if (button2) {
    button2.addEventListener("mousedown", () => {
      torus2.material = materials[texture];
    });
  }
  
  // Botones parte superior (torus3)
  const button3 = document.getElementById(`${texture}Button3`);
  if (button3) {
    button3.addEventListener("mousedown", () => {
      torus3.material = materials[texture];
    });
  }
});

// ========================================
// === INICIALIZACIÓN ===
// ========================================

// Iniciar el bucle de animación
animate();
updateMeshRotation();