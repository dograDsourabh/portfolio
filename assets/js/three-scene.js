/* =====================================================
   THREE.JS BACKGROUND — Galaxy + Wireframes
   ===================================================== */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  camera.position.set(0, 0, 12);

  /* --------------------------------------------------
     GALAXY PARTICLES
  -------------------------------------------------- */
  const COUNT    = 5000;
  const BRANCHES = 3;
  const geo      = new THREE.BufferGeometry();
  const pos      = new Float32Array(COUNT * 3);
  const col      = new Float32Array(COUNT * 3);

  const cInner = new THREE.Color('#00f5ff');
  const cOuter = new THREE.Color('#7c3aed');

  for (let i = 0; i < COUNT; i++) {
    const i3     = i * 3;
    const radius = Math.random() * 18;
    const branch = (i % BRANCHES) / BRANCHES * Math.PI * 2;
    const spin   = radius * 0.45;
    const randX  = (Math.random() ** 3) * (Math.random() < 0.5 ? 1 : -1) * radius * 0.08;
    const randY  = (Math.random() ** 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
    const randZ  = (Math.random() ** 3) * (Math.random() < 0.5 ? 1 : -1) * radius * 0.08;

    pos[i3]     = Math.cos(branch + spin) * radius + randX;
    pos[i3 + 1] = randY;
    pos[i3 + 2] = Math.sin(branch + spin) * radius + randZ;

    const mixed = new THREE.Color().lerpColors(cInner, cOuter, radius / 18);
    col[i3]     = mixed.r;
    col[i3 + 1] = mixed.g;
    col[i3 + 2] = mixed.b;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size:         0.035,
    vertexColors: true,
    blending:     THREE.AdditiveBlending,
    depthWrite:   false,
    transparent:  true,
    opacity:      0.75,
  });

  const galaxy = new THREE.Points(geo, mat);
  scene.add(galaxy);

  /* --------------------------------------------------
     WIREFRAME SHAPES
  -------------------------------------------------- */
  const shapes = [];
  const shapeDefs = [
    { geo: new THREE.IcosahedronGeometry(0.6, 0), color: 0x00f5ff, x:  4,  y:  2, z: -3 },
    { geo: new THREE.OctahedronGeometry(0.5, 0),  color: 0x7c3aed, x: -5,  y: -1, z: -4 },
    { geo: new THREE.TetrahedronGeometry(0.7, 0),  color: 0x00f5ff, x:  6,  y: -3, z: -5 },
    { geo: new THREE.IcosahedronGeometry(0.4, 0), color: 0xa855f7, x: -4,  y:  3, z: -2 },
  ];

  shapeDefs.forEach(d => {
    const m = new THREE.MeshBasicMaterial({ color: d.color, wireframe: true, transparent: true, opacity: 0.12 });
    const mesh = new THREE.Mesh(d.geo, m);
    mesh.position.set(d.x, d.y, d.z);
    mesh._rotSpeed = { x: Math.random() * 0.004, y: Math.random() * 0.005 };
    scene.add(mesh);
    shapes.push(mesh);
  });

  /* --------------------------------------------------
     MOUSE INTERACTION
  -------------------------------------------------- */
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  window.addEventListener('mousemove', e => {
    targetX = (e.clientX / innerWidth  - 0.5) * 0.8;
    targetY = (e.clientY / innerHeight - 0.5) * 0.5;
  });

  /* --------------------------------------------------
     SCROLL INTERACTION
  -------------------------------------------------- */
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  /* --------------------------------------------------
     RESIZE
  -------------------------------------------------- */
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  });

  /* --------------------------------------------------
     ANIMATION LOOP
  -------------------------------------------------- */
  function animate() {
    requestAnimationFrame(animate);

    // Smooth mouse follow
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    galaxy.rotation.y += 0.0004;
    galaxy.rotation.x  = currentY * 0.3;
    galaxy.position.x  = currentX * 1.5;
    galaxy.position.y  = -scrollY * 0.002;

    shapes.forEach(m => {
      m.rotation.x += m._rotSpeed.x;
      m.rotation.y += m._rotSpeed.y;
    });

    renderer.render(scene, camera);
  }

  animate();
})();
