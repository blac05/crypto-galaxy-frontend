import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GalaxyBackground() {
const mountRef = useRef(null);

useEffect(() => {
const mount = mountRef.current;
if (!mount) return;

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
camera.position.set(0, 2.5, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
mount.appendChild(renderer.domElement);

// ── Galaxy geometry ──────────────────────────────────────────────
const parameters = {
count: 120000,
size: 0.012,
radius: 6,
branches: 5,
spin: 1.2,
randomness: 0.38,
randomnessPower: 2.8,
insideColor: '#ff9de2',
outsideColor: '#1e4fff',
coreColor: '#ffffff',
};

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(parameters.count * 3);
const colors = new Float32Array(parameters.count * 3);
const scales = new Float32Array(parameters.count);

const insideColor = new THREE.Color(parameters.insideColor);
const outsideColor = new THREE.Color(parameters.outsideColor);
const coreColor = new THREE.Color(parameters.coreColor);

for (let i = 0; i < parameters.count; i++) {
const i3 = i * 3;
const radius = Math.random() * parameters.radius;
const spinAngle = radius * parameters.spin;
const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius * 0.3;
const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

positions[i3]     = Math.cos(branchAngle + spinAngle) * radius + randomX;
positions[i3 + 1] = randomY;
positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

// Color: white core → pink inner → blue outer
const mixedColor = insideColor.clone();
if (radius < 0.5) {
mixedColor.lerp(coreColor, 1 - radius / 0.5);
} else {
mixedColor.lerp(outsideColor, (radius - 0.5) / (parameters.radius - 0.5));
}

colors[i3]     = mixedColor.r;
colors[i3 + 1] = mixedColor.g;
colors[i3 + 2] = mixedColor.b;

scales[i] = Math.random();
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

// Custom shader material for glowing stars
const material = new THREE.ShaderMaterial({
depthWrite: false,
blending: THREE.AdditiveBlending,
vertexColors: true,
transparent: true,
vertexShader: `attribute float aScale; varying vec3 vColor; void main() { vColor = color; vec4 modelPosition = modelMatrix * vec4(position, 1.0); vec4 viewPosition = viewMatrix * modelPosition; vec4 projectedPosition = projectionMatrix * viewPosition; gl_Position = projectedPosition; gl_PointSize = 80.0 * aScale * (1.0 / -viewPosition.z); }`,
fragmentShader: `varying vec3 vColor; void main() { float strength = distance(gl_PointCoord, vec2(0.5)); strength = 1.0 - strength; strength = pow(strength, 8.0); vec3 col = mix(vec3(0.0), vColor, strength); gl_FragColor = vec4(col, strength * 0.95); }`,
});

const galaxy = new THREE.Points(geometry, material);
scene.add(galaxy);

// ── Distant background stars ─────────────────────────────────────
const bgStarGeo = new THREE.BufferGeometry();
const bgCount = 8000;
const bgPositions = new Float32Array(bgCount * 3);
for (let i = 0; i < bgCount * 3; i++) {
bgPositions[i] = (Math.random() - 0.5) * 80;
}
bgStarGeo.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
const bgStarMat = new THREE.PointsMaterial({
size: 0.05,
color: '#ffffff',
transparent: true,
opacity: 0.6,
depthWrite: false,
});
const bgStars = new THREE.Points(bgStarGeo, bgStarMat);
scene.add(bgStars);

// ── Nebula glow planes ───────────────────────────────────────────
const addNebula = (color, x, y, z, size, opacity) => {
const geo = new THREE.PlaneGeometry(size, size);
const mat = new THREE.MeshBasicMaterial({
color,
transparent: true,
opacity,
depthWrite: false,
blending: THREE.AdditiveBlending,
side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(geo, mat);
mesh.position.set(x, y, z);
mesh.rotation.x = Math.PI / 2;
scene.add(mesh);
};

addNebula('#3a0ca3', 0, 0, 0, 4, 0.04);
addNebula('#7209b7', -1.5, 0.1, 1, 3, 0.03);
addNebula('#4361ee', 1.5, -0.1, -1, 3.5, 0.03);
addNebula('#ff6b6b', 0.5, 0.2, 0.5, 2, 0.02);

// ── Animation ────────────────────────────────────────────────────
let animId;
const clock = new THREE.Clock();

const animate = () => {
animId = requestAnimationFrame(animate);
const elapsed = clock.getElapsedTime();

// Slow galaxy rotation
galaxy.rotation.y = elapsed * 0.035;
bgStars.rotation.y = elapsed * 0.005;
bgStars.rotation.x = elapsed * 0.003;

// Gentle camera bob
camera.position.y = 2.5 + Math.sin(elapsed * 0.2) * 0.15;
camera.lookAt(0, 0, 0);

renderer.render(scene, camera);
};
animate();

// ── Resize handler ───────────────────────────────────────────────
const handleResize = () => {
camera.aspect = mount.clientWidth / mount.clientHeight;
camera.updateProjectionMatrix();
renderer.setSize(mount.clientWidth, mount.clientHeight);
};
window.addEventListener('resize', handleResize);

// ── Cleanup ──────────────────────────────────────────────────────
return () => {
cancelAnimationFrame(animId);
window.removeEventListener('resize', handleResize);
geometry.dispose();
material.dispose();
bgStarGeo.dispose();
bgStarMat.dispose();
renderer.dispose();
if (mount.contains(renderer.domElement)) {
mount.removeChild(renderer.domElement);
}
};

}, []);

return (

<div
ref={mountRef}
style={{
position: 'fixed',
top: 0,
left: 0,
width: '100vw',
height: '100vh',
zIndex: 0,
pointerEvents: 'none',
opacity: 0.85,
}}
/>
);
}