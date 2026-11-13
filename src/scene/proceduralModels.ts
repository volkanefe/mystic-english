import * as THREE from 'three';
import { ProceduralTextureSet } from './textures';

export function groundHeightAt(x: number, z: number): number {
  const dist = Math.hypot(x, z);
  // Keep central temple clearing flat for the altar and pillars
  if (dist < 7.5) return 0;
  const blend = THREE.MathUtils.smoothstep(dist, 7.5, 22);
  const undulation =
    Math.sin(x * 0.14) * Math.cos(z * 0.14) * 1.1 +
    Math.sin(x * 0.06 + z * 0.08) * 1.4;
  return blend * (undulation + (dist - 7.5) * 0.045);
}

export interface CrystalRig {
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  innerCoreMesh: THREE.Mesh;
  crackLines: THREE.LineSegments;
  orbitShards: {
    mesh: THREE.Mesh;
    baseRadius: number;
    baseY: number;
    speed: number;
    phase: number;
    scatterDir: THREE.Vector3;
  }[];
  crystalLight: THREE.PointLight;
  runeRingMesh: THREE.Mesh;
}

export function createTerrainMesh(textures: ProceduralTextureSet): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(160, 160, 96, 96);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, groundHeightAt(x, z));
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    map: textures.groundColor,
    roughness: 0.92,
    metalness: 0.04,
    color: 0x8ea393,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  return mesh;
}

export function createAncientAltar(textures: ProceduralTextureSet): {
  group: THREE.Group;
  runeRingMesh: THREE.Mesh;
  brazierGlows: THREE.Mesh[];
} {
  const group = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    map: textures.stoneColor,
    bumpMap: textures.stoneBump,
    bumpScale: 0.04,
    roughness: 0.85,
    metalness: 0.08,
    color: 0x9ca7b4,
  });

  const darkSlateMat = new THREE.MeshStandardMaterial({
    color: 0x1f2630,
    roughness: 0.48,
    metalness: 0.35,
  });

  const bronzeTrimMat = new THREE.MeshStandardMaterial({
    color: 0x7c6848,
    roughness: 0.32,
    metalness: 0.82,
  });

  // Contact shadow disc
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(7.8, 7.8),
    new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    }),
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  group.add(shadowPlane);

  // Step 1: Wide octagonal foundation
  const step1 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.55, 0.28, 8), stoneMat);
  step1.position.y = 0.14;
  step1.receiveShadow = true;
  step1.castShadow = true;
  group.add(step1);

  // Step 2: Middle dais
  const step2 = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.6, 0.32, 8), stoneMat);
  step2.position.y = 0.44;
  step2.receiveShadow = true;
  step2.castShadow = true;
  group.add(step2);

  // Step 3: Dark carved basalt pedestal
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.45, 0.68, 8), darkSlateMat);
  pedestal.position.y = 0.94;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  group.add(pedestal);

  // Bronze collar ring
  const collar = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.06, 10, 24), bronzeTrimMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.26;
  group.add(collar);

  // Glowing Rune Circle decal on dais
  const runeMat = new THREE.MeshBasicMaterial({
    map: textures.runeEmissive,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const runeRingMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 4.3), runeMat);
  runeRingMesh.rotation.x = -Math.PI / 2;
  runeRingMesh.position.y = 0.62;
  group.add(runeRingMesh);

  // 4 Corner mini-obelisks with glowing rune caps
  const brazierGlows: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const r = 2.65;
    const bx = Math.cos(angle) * r;
    const bz = Math.sin(angle) * r;

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.85, 6), stoneMat);
    post.position.set(bx, 0.56, bz);
    post.castShadow = true;
    post.receiveShadow = true;
    group.add(post);

    const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), bronzeTrimMat);
    cap.position.set(bx, 1.06, bz);
    group.add(cap);

    const glowOrb = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.11, 0),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
    );
    glowOrb.position.set(bx, 1.26, bz);
    group.add(glowOrb);
    brazierGlows.push(glowOrb);
  }

  return { group, runeRingMesh, brazierGlows };
}

export function createMysticCrystal(
  isSoftwareGl: boolean,
  runeRingMesh: THREE.Mesh,
): CrystalRig {
  const group = new THREE.Group();
  group.position.set(0, 2.75, 0);

  // Sculpted elongated crystal geometry
  const crystalGeo = new THREE.OctahedronGeometry(0.88, 1);
  crystalGeo.scale(0.68, 1.55, 0.68);
  // Subtle organic facet variation
  const posAttr = crystalGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const twist = vy * 0.22;
    const nx = vx * Math.cos(twist) - vz * Math.sin(twist);
    const nz = vx * Math.sin(twist) + vz * Math.cos(twist);
    posAttr.setXYZ(i, nx, vy, nz);
  }
  crystalGeo.computeVertexNormals();

  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.42,
    roughness: 0.12,
    metalness: 0.08,
    ior: 1.78,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    transmission: isSoftwareGl ? 0 : 0.72,
    thickness: 1.4,
    transparent: true,
    opacity: isSoftwareGl ? 0.85 : 0.96,
    flatShading: true,
  });

  const coreMesh = new THREE.Mesh(crystalGeo, coreMat);
  coreMesh.castShadow = true;
  group.add(coreMesh);

  // Inner glowing energy heart
  const innerGeo = new THREE.OctahedronGeometry(0.36, 0);
  innerGeo.scale(0.65, 1.5, 0.65);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xa5f3fc,
    transparent: true,
    opacity: 0.85,
  });
  const innerCoreMesh = new THREE.Mesh(innerGeo, innerMat);
  group.add(innerCoreMesh);

  // Crack / fracture overlay wireframe (fades in as lives decrease)
  const edgesGeo = new THREE.EdgesGeometry(crystalGeo, 12);
  const crackMat = new THREE.LineBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0,
  });
  const crackLines = new THREE.LineSegments(edgesGeo, crackMat);
  crackLines.scale.setScalar(1.015);
  group.add(crackLines);

  // 6 Orbiting satellite crystal shards (corresponding to 6 lives!)
  const orbitShards: CrystalRig['orbitShards'] = [];
  const shardGeo = new THREE.OctahedronGeometry(0.17, 0);
  shardGeo.scale(0.55, 1.65, 0.55);

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const shardMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.18,
      metalness: 0.15,
      clearcoat: 0.9,
      flatShading: true,
      transparent: true,
      opacity: 0.95,
    });
    const shard = new THREE.Mesh(shardGeo, shardMat);
    const baseRadius = 1.45 + (i % 2) * 0.25;
    const baseY = ((i % 3) - 1) * 0.34;
    shard.position.set(Math.cos(angle) * baseRadius, baseY, Math.sin(angle) * baseRadius);
    shard.rotation.set(0.3 * i, angle, 0.2);
    group.add(shard);

    orbitShards.push({
      mesh: shard,
      baseRadius,
      baseY,
      speed: 0.55 + (i % 3) * 0.16,
      phase: angle,
      scatterDir: new THREE.Vector3(Math.cos(angle), 0.35 + (i % 2) * 0.4, Math.sin(angle)).normalize(),
    });
  }

  const crystalLight = new THREE.PointLight(0x38bdf8, 5.5, 20, 1.6);
  crystalLight.position.set(0, 0.2, 0);
  group.add(crystalLight);

  return {
    group,
    coreMesh,
    innerCoreMesh,
    crackLines,
    orbitShards,
    crystalLight,
    runeRingMesh,
  };
}

export function createTemplePillar(
  textures: ProceduralTextureSet,
  height: number,
  broken = false,
): THREE.Group {
  const pillar = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    map: textures.stoneColor,
    bumpMap: textures.stoneBump,
    bumpScale: 0.05,
    roughness: 0.88,
    metalness: 0.06,
    color: 0x7e8a97,
  });

  const mossMat = new THREE.MeshStandardMaterial({
    color: 0x2c4230,
    roughness: 0.95,
    metalness: 0.0,
  });

  const runeBandMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
  });

  // Base plinth
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 1.4), stoneMat);
  base.position.y = 0.275;
  base.castShadow = true;
  base.receiveShadow = true;
  pillar.add(base);

  // Mid base collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.66, 0.3, 8), stoneMat);
  collar.position.y = 0.7;
  collar.castShadow = true;
  pillar.add(collar);

  // Main shaft
  const shaftH = height - 1.1;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, shaftH, 10), stoneMat);
  shaft.position.y = 0.85 + shaftH / 2;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  pillar.add(shaft);

  // Glowing rune ring band
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.445, 0.445, 0.12, 10), runeBandMat);
  band.position.y = 0.85 + shaftH * 0.62;
  pillar.add(band);

  // Top capital or broken slant
  if (!broken) {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.42, 1.3), stoneMat);
    cap.position.y = 0.85 + shaftH + 0.21;
    cap.castShadow = true;
    cap.receiveShadow = true;
    pillar.add(cap);

    const moss = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 1.15), mossMat);
    moss.position.y = 0.85 + shaftH + 0.44;
    pillar.add(moss);
  } else {
    const brokenCap = new THREE.Mesh(new THREE.DodecahedronGeometry(0.46, 0), stoneMat);
    brokenCap.scale.set(1.0, 0.65, 1.0);
    brokenCap.rotation.set(0.35, 0.4, 0.22);
    brokenCap.position.y = 0.85 + shaftH + 0.05;
    brokenCap.castShadow = true;
    pillar.add(brokenCap);
  }

  return pillar;
}

export function createRockCluster(textures: ProceduralTextureSet, scale = 1): THREE.Group {
  const cluster = new THREE.Group();
  const rockMat = new THREE.MeshStandardMaterial({
    map: textures.stoneColor,
    bumpMap: textures.stoneBump,
    bumpScale: 0.06,
    roughness: 0.9,
    metalness: 0.04,
    color: 0x5c6670,
    flatShading: true,
  });

  const mainRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95 * scale, 1), rockMat);
  mainRock.scale.set(1.2, 0.78, 1.0);
  mainRock.position.y = 0.42 * scale;
  mainRock.rotation.set(0.2, 0.7, 0.1);
  mainRock.castShadow = true;
  mainRock.receiveShadow = true;
  cluster.add(mainRock);

  const sideRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 * scale, 0), rockMat);
  sideRock.position.set(0.75 * scale, 0.25 * scale, 0.35 * scale);
  sideRock.rotation.set(0.5, 0.2, 0.4);
  sideRock.castShadow = true;
  sideRock.receiveShadow = true;
  cluster.add(sideRock);

  const smallRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 * scale, 0), rockMat);
  smallRock.position.set(-0.62 * scale, 0.16 * scale, 0.48 * scale);
  smallRock.castShadow = true;
  cluster.add(smallRock);

  return cluster;
}

export interface WindShaderUniforms {
  uTime: { value: number };
  uWindStrength: { value: number };
}

function attachWindSwayShader(
  material: THREE.MeshStandardMaterial,
  windUniforms: WindShaderUniforms,
  swayScale = 1.0,
): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windUniforms.uTime;
    shader.uniforms.uWindStrength = windUniforms.uWindStrength;

    shader.vertexShader =
      `uniform float uTime;\nuniform float uWindStrength;\n` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      float hFactor = clamp(position.y * 0.28, 0.0, 1.5);
      #ifdef USE_INSTANCING
        vec3 instOrigin = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      #else
        vec3 instOrigin = vec3(0.0);
      #endif
      float phase = instOrigin.x * 0.45 + instOrigin.z * 0.38;
      float swayX = sin(uTime * (1.8 + uWindStrength * 2.4) + phase) * 0.18 * (0.25 + uWindStrength) * hFactor * ${swayScale.toFixed(2)};
      float swayZ = cos(uTime * (1.4 + uWindStrength * 1.9) + phase * 1.3) * 0.12 * (0.25 + uWindStrength) * hFactor * ${swayScale.toFixed(2)};
      transformed.x += swayX;
      transformed.z += swayZ;
      `,
    );
  };
}

export function createInstancedForest(
  textures: ProceduralTextureSet,
  windUniforms: WindShaderUniforms,
): THREE.Group {
  const forestGroup = new THREE.Group();

  // Tree placement ring outside the central temple clearing (radius 9.5 -> 58)
  const treeCount = 86;
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.34, 3.4, 7);
  trunkGeo.translate(0, 1.7, 0);
  const trunkMat = new THREE.MeshStandardMaterial({
    map: textures.barkColor,
    roughness: 0.94,
    metalness: 0.02,
    color: 0x5c493e,
  });

  const foliageLowGeo = new THREE.ConeGeometry(1.75, 3.2, 7);
  foliageLowGeo.translate(0, 3.6, 0);
  const foliageMidGeo = new THREE.ConeGeometry(1.35, 2.8, 7);
  foliageMidGeo.translate(0, 5.2, 0);
  const foliageTopGeo = new THREE.ConeGeometry(0.92, 2.3, 7);
  foliageTopGeo.translate(0, 6.7, 0);

  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x264435,
    roughness: 0.85,
    metalness: 0.02,
    flatShading: true,
  });
  attachWindSwayShader(foliageMat, windUniforms, 0.85);

  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const lows = new THREE.InstancedMesh(foliageLowGeo, foliageMat, treeCount);
  const mids = new THREE.InstancedMesh(foliageMidGeo, foliageMat, treeCount);
  const tops = new THREE.InstancedMesh(foliageTopGeo, foliageMat, treeCount);

  trunks.castShadow = true;
  trunks.receiveShadow = true;
  lows.castShadow = true;
  lows.receiveShadow = true;
  mids.castShadow = true;
  tops.castShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  let placed = 0;
  let attempts = 0;
  while (placed < treeCount && attempts < 500) {
    attempts++;
    const angle = (placed / treeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.28;
    const radius = 10.5 + Math.pow(Math.random(), 0.78) * 42;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Keep camera sightline corridor open (positive Z corridor around x=0)
    if (z > 6 && Math.abs(x) < 6.5) continue;

    const y = groundHeightAt(x, z) - 0.15;
    const scale = 0.82 + Math.random() * 0.78;
    const rotY = Math.random() * Math.PI * 2;

    dummy.position.set(x, y, z);
    dummy.rotation.set((Math.random() - 0.5) * 0.06, rotY, (Math.random() - 0.5) * 0.06);
    dummy.scale.set(scale, scale * (0.9 + Math.random() * 0.35), scale);
    dummy.updateMatrix();

    trunks.setMatrixAt(placed, dummy.matrix);
    lows.setMatrixAt(placed, dummy.matrix);
    mids.setMatrixAt(placed, dummy.matrix);
    tops.setMatrixAt(placed, dummy.matrix);

    const tint = 0.82 + Math.random() * 0.36;
    color.setRGB(0.16 * tint, 0.31 * tint, 0.24 * tint);
    lows.setColorAt(placed, color);
    mids.setColorAt(placed, color);
    tops.setColorAt(placed, color);

    placed++;
  }

  trunks.count = placed;
  lows.count = placed;
  mids.count = placed;
  tops.count = placed;

  trunks.instanceMatrix.needsUpdate = true;
  lows.instanceMatrix.needsUpdate = true;
  mids.instanceMatrix.needsUpdate = true;
  tops.instanceMatrix.needsUpdate = true;
  if (lows.instanceColor) lows.instanceColor.needsUpdate = true;
  if (mids.instanceColor) mids.instanceColor.needsUpdate = true;
  if (tops.instanceColor) tops.instanceColor.needsUpdate = true;

  trunks.computeBoundingSphere();
  lows.computeBoundingSphere();
  mids.computeBoundingSphere();
  tops.computeBoundingSphere();

  forestGroup.add(trunks, lows, mids, tops);

  // Undergrowth ferns (InstancedMesh with wind sway)
  const fernCount = 140;
  const fernGeo = new THREE.ConeGeometry(0.48, 0.85, 5, 2);
  fernGeo.scale(1.1, 0.85, 1.1);
  fernGeo.translate(0, 0.38, 0);
  const fernMat = new THREE.MeshStandardMaterial({
    color: 0x355c3c,
    roughness: 0.8,
    metalness: 0.0,
    flatShading: true,
  });
  attachWindSwayShader(fernMat, windUniforms, 1.4);

  const ferns = new THREE.InstancedMesh(fernGeo, fernMat, fernCount);
  ferns.receiveShadow = true;
  let fPlaced = 0;
  for (let i = 0; i < fernCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 5.2 + Math.random() * 26;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (z > 4 && Math.abs(x) < 4.5) continue;

    const y = groundHeightAt(x, z) - 0.05;
    const s = 0.65 + Math.random() * 0.75;
    dummy.position.set(x, y, z);
    dummy.rotation.set(0.18, Math.random() * Math.PI * 2, 0.12);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    ferns.setMatrixAt(fPlaced, dummy.matrix);

    const gTint = 0.75 + Math.random() * 0.45;
    color.setRGB(0.2 * gTint, 0.4 * gTint, 0.23 * gTint);
    ferns.setColorAt(fPlaced, color);
    fPlaced++;
  }
  ferns.count = fPlaced;
  ferns.instanceMatrix.needsUpdate = true;
  if (ferns.instanceColor) ferns.instanceColor.needsUpdate = true;
  ferns.computeBoundingSphere();
  forestGroup.add(ferns);

  return forestGroup;
}

export function createDistantMountains(textures: ProceduralTextureSet): THREE.Group {
  const ring = new THREE.Group();
  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0x1a2230,
    roughness: 0.96,
    metalness: 0.04,
    flatShading: true,
  });

  const peakCount = 24;
  for (let i = 0; i < peakCount; i++) {
    const angle = (i / peakCount) * Math.PI * 2;
    const dist = 62 + (i % 3) * 10;
    const height = 18 + (i % 5) * 6.5;
    const radius = 12 + (i % 4) * 4;
    const geo = new THREE.ConeGeometry(radius, height, 6);
    const peak = new THREE.Mesh(geo, mountainMat);
    peak.position.set(Math.cos(angle) * dist, height * 0.4 - 2, Math.sin(angle) * dist);
    peak.rotation.y = angle + i * 0.5;
    ring.add(peak);
  }

  // Distant ancient monolith spires in the mist
  const spireMat = new THREE.MeshStandardMaterial({
    map: textures.stoneColor,
    color: 0x2c3645,
    roughness: 0.85,
    metalness: 0.1,
  });
  const spireAngles = [-0.65, 0.65, Math.PI - 0.55, Math.PI + 0.55];
  spireAngles.forEach((ang, idx) => {
    const dist = 34 + idx * 3;
    const spire = new THREE.Mesh(new THREE.BoxGeometry(2.2, 14, 2.2), spireMat);
    const x = Math.sin(ang) * dist;
    const z = -Math.cos(ang) * dist;
    spire.position.set(x, groundHeightAt(x, z) + 6, z);
    spire.rotation.y = ang;
    ring.add(spire);
  });

  return ring;
}
