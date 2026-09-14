const canvas = document.getElementById("scene");
const THREE_SRC = "https://unpkg.com/three@0.160.1/build/three.min.js";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function startScene() {
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    await loadScript(THREE_SRC);
  } catch {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.2, 6.4);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const lights = [
    new THREE.AmbientLight(0xfff4e6, 0.55),
    new THREE.DirectionalLight(0xffd8b0, 1.1),
    new THREE.PointLight(0xc45c26, 8, 18)
  ];
  lights[1].position.set(3, 4, 6);
  lights[2].position.set(-3, -1, 4);
  lights.forEach((l) => scene.add(l));

  const colors = [0xc45c26, 0xd4a574, 0x6d7a5f, 0xf6f1e8, 0x9a3f14, 0x8aa0b5];
  const blobs = [];
  for (let i = 0; i < 11; i += 1) {
    const geo = new THREE.IcosahedronGeometry(0.14 + Math.random() * 0.28, 1);
    const mat = new THREE.MeshPhysicalMaterial({
      color: colors[i % colors.length],
      roughness: 0.22,
      metalness: 0.08,
      transmission: 0.18,
      thickness: 0.6,
      clearcoat: 0.7
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(1.4 + Math.random() * 4.2, (Math.random() - 0.45) * 3.8, (Math.random() - 0.5) * 3);
    mesh.userData = {
      speed: 0.002 + Math.random() * 0.006,
      amp: 0.25 + Math.random() * 0.55,
      seed: Math.random() * Math.PI * 2
    };
    scene.add(mesh);
    blobs.push(mesh);
  }

  const mouse = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  });

  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  function tick(t) {
    blobs.forEach((b, i) => {
      const { speed, amp, seed } = b.userData;
      b.rotation.x += speed;
      b.rotation.y += speed * 1.3;
      b.position.y += Math.sin(t * 0.001 + seed) * 0.0025;
      b.position.x += Math.cos(t * 0.0008 + i) * 0.0012;
      b.scale.setScalar(1 + Math.sin(t * 0.0015 + seed) * amp * 0.08);
    });
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const TOTAL = 67;
// Breite Kacheln so wählen, dass 67 Bilder + Breiten-Slots die 4er-Reihen exakt füllen.
const WIDE_SLOTS = [1, 11, 24, 41, 57];

function pad(n) {
  return String(n).padStart(2, "0");
}

for (let i = 1; i <= TOTAL; i += 1) {
  const btn = document.createElement("button");
  btn.type = "button";
  if (WIDE_SLOTS.includes(i)) btn.classList.add("wide");
  const img = document.createElement("img");
  img.src = `./images/arbeiten/${pad(i)}.jpg`;
  img.alt = `Malerarbeit ${i} von Marti Maler`;
  img.loading = "lazy";
  btn.appendChild(img);
  btn.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightbox.classList.add("open");
  });
  gallery.appendChild(btn);
}

const moreBtn = document.getElementById("gallery-more");
moreBtn.addEventListener("click", () => {
  const collapsed = gallery.classList.toggle("is-collapsed");
  moreBtn.textContent = collapsed ? `Alle ${TOTAL} Bilder zeigen` : "Weniger zeigen";
  if (collapsed) gallery.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("close-lightbox").addEventListener("click", () => {
  lightbox.classList.remove("open");
});
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.classList.remove("open");
});

document.getElementById("nav-toggle").addEventListener("click", () => {
  document.getElementById("nav").classList.toggle("open");
});

document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const text = encodeURIComponent(
    `Hallo Andrea, ich bin ${name} (${email}).\n\n${message}`
  );
  window.open(`https://wa.me/41763885082?text=${text}`, "_blank");
});

startScene();
