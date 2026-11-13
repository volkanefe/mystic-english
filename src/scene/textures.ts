import * as THREE from 'three';

export interface ProceduralTextureSet {
  stoneColor: THREE.CanvasTexture;
  stoneBump: THREE.CanvasTexture;
  barkColor: THREE.CanvasTexture;
  groundColor: THREE.CanvasTexture;
  runeEmissive: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  // 1. Ancient Mossy Stone Albedo & Bump
  const [stoneCanvas, sCtx] = makeCanvas(256);
  const [bumpCanvas, bCtx] = makeCanvas(256);

  sCtx.fillStyle = '#3c434d';
  sCtx.fillRect(0, 0, 256, 256);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 1 + Math.random() * 5;
    const shade = 45 + Math.floor(Math.random() * 42);
    const moss = Math.random() > 0.84;
    sCtx.fillStyle = moss
      ? `rgba(${34 + Math.floor(Math.random() * 20)}, ${64 + Math.floor(Math.random() * 28)}, ${42 + Math.floor(Math.random() * 18)}, 0.45)`
      : `rgba(${shade}, ${shade + 4}, ${shade + 9}, 0.35)`;
    sCtx.beginPath();
    sCtx.arc(x, y, r, 0, Math.PI * 2);
    sCtx.fill();

    const bVal = 90 + Math.floor(Math.random() * 80);
    bCtx.fillStyle = `rgba(${bVal}, ${bVal}, ${bVal}, 0.3)`;
    bCtx.beginPath();
    bCtx.arc(x, y, r, 0, Math.PI * 2);
    bCtx.fill();
  }

  // Stone block mortar seams
  sCtx.strokeStyle = 'rgba(20, 24, 30, 0.55)';
  sCtx.lineWidth = 2;
  bCtx.strokeStyle = 'rgba(30, 30, 30, 0.7)';
  bCtx.lineWidth = 2;
  for (let row = 0; row < 4; row++) {
    const y = row * 64;
    sCtx.beginPath();
    sCtx.moveTo(0, y);
    sCtx.lineTo(256, y);
    sCtx.stroke();
    bCtx.beginPath();
    bCtx.moveTo(0, y);
    bCtx.lineTo(256, y);
    bCtx.stroke();
    const offset = (row % 2) * 64;
    for (let col = 0; col < 2; col++) {
      const x = (col * 128 + offset) % 256;
      sCtx.beginPath();
      sCtx.moveTo(x, y);
      sCtx.lineTo(x, y + 64);
      sCtx.stroke();
      bCtx.beginPath();
      bCtx.moveTo(x, y);
      bCtx.lineTo(x, y + 64);
      bCtx.stroke();
    }
  }

  const stoneColor = new THREE.CanvasTexture(stoneCanvas);
  stoneColor.colorSpace = THREE.SRGBColorSpace;
  stoneColor.wrapS = stoneColor.wrapT = THREE.RepeatWrapping;
  stoneColor.repeat.set(2, 2);
  stoneColor.anisotropy = maxAnisotropy;

  const stoneBump = new THREE.CanvasTexture(bumpCanvas);
  stoneBump.colorSpace = THREE.NoColorSpace;
  stoneBump.wrapS = stoneBump.wrapT = THREE.RepeatWrapping;
  stoneBump.repeat.set(2, 2);
  stoneBump.anisotropy = maxAnisotropy;

  // 2. Ancient Bark Texture
  const [barkCanvas, barkCtx] = makeCanvas(128);
  barkCtx.fillStyle = '#2c221c';
  barkCtx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 240; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const w = 1 + Math.random() * 3;
    const h = 14 + Math.random() * 34;
    const dark = Math.random() > 0.5;
    barkCtx.fillStyle = dark ? 'rgba(18, 13, 10, 0.55)' : 'rgba(66, 52, 42, 0.35)';
    barkCtx.fillRect(x, y, w, h);
  }
  const barkColor = new THREE.CanvasTexture(barkCanvas);
  barkColor.colorSpace = THREE.SRGBColorSpace;
  barkColor.wrapS = barkColor.wrapT = THREE.RepeatWrapping;
  barkColor.repeat.set(2, 4);
  barkColor.anisotropy = maxAnisotropy;

  // 3. Forest Floor Texture
  const [groundCanvas, gCtx] = makeCanvas(512);
  gCtx.fillStyle = '#1b241d';
  gCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 1 + Math.random() * 7;
    const pick = Math.random();
    if (pick < 0.55) {
      gCtx.fillStyle = `rgba(${24 + Math.floor(Math.random() * 18)}, ${38 + Math.floor(Math.random() * 22)}, ${26 + Math.floor(Math.random() * 14)}, 0.32)`;
    } else if (pick < 0.85) {
      gCtx.fillStyle = `rgba(${34 + Math.floor(Math.random() * 16)}, ${28 + Math.floor(Math.random() * 12)}, ${22 + Math.floor(Math.random() * 10)}, 0.28)`;
    } else {
      gCtx.fillStyle = `rgba(${42 + Math.floor(Math.random() * 16)}, ${64 + Math.floor(Math.random() * 20)}, ${46 + Math.floor(Math.random() * 14)}, 0.26)`;
    }
    gCtx.beginPath();
    gCtx.arc(x, y, r, 0, Math.PI * 2);
    gCtx.fill();
  }
  const groundColor = new THREE.CanvasTexture(groundCanvas);
  groundColor.colorSpace = THREE.SRGBColorSpace;
  groundColor.wrapS = groundColor.wrapT = THREE.RepeatWrapping;
  groundColor.repeat.set(16, 16);
  groundColor.anisotropy = maxAnisotropy;

  // 4. Glowing Rune Ring Canvas Texture
  const [runeCanvas, rCtx] = makeCanvas(256);
  rCtx.clearRect(0, 0, 256, 256);
  rCtx.strokeStyle = '#7dd3fc';
  rCtx.lineWidth = 4;
  rCtx.beginPath();
  rCtx.arc(128, 128, 108, 0, Math.PI * 2);
  rCtx.stroke();
  rCtx.lineWidth = 2;
  rCtx.beginPath();
  rCtx.arc(128, 128, 86, 0, Math.PI * 2);
  rCtx.stroke();

  rCtx.save();
  rCtx.translate(128, 128);
  for (let i = 0; i < 12; i++) {
    rCtx.rotate((Math.PI * 2) / 12);
    rCtx.strokeStyle = '#bae6fd';
    rCtx.lineWidth = 2.5;
    rCtx.beginPath();
    rCtx.moveTo(0, -104);
    rCtx.lineTo(0, -88);
    rCtx.moveTo(-6, -98);
    rCtx.lineTo(6, -94);
    rCtx.stroke();
  }
  rCtx.restore();

  const runeEmissive = new THREE.CanvasTexture(runeCanvas);
  runeEmissive.colorSpace = THREE.SRGBColorSpace;
  runeEmissive.anisotropy = maxAnisotropy;

  // 5. Soft Radial Contact Shadow
  const [shadowCanvas, shCtx] = makeCanvas(128);
  const grad = shCtx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  shCtx.fillStyle = grad;
  shCtx.fillRect(0, 0, 128, 128);
  const contactShadow = new THREE.CanvasTexture(shadowCanvas);
  contactShadow.colorSpace = THREE.SRGBColorSpace;

  return {
    stoneColor,
    stoneBump,
    barkColor,
    groundColor,
    runeEmissive,
    contactShadow,
    dispose: () => {
      stoneColor.dispose();
      stoneBump.dispose();
      barkColor.dispose();
      groundColor.dispose();
      runeEmissive.dispose();
      contactShadow.dispose();
    },
  };
}
