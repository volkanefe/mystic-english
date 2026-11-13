import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WeatherType } from '../types/game';
import { createProceduralTextures, ProceduralTextureSet } from './textures';
import {
  createAncientAltar,
  createDistantMountains,
  createInstancedForest,
  createMysticCrystal,
  createRockCluster,
  createTemplePillar,
  createTerrainMesh,
  CrystalRig,
  groundHeightAt,
  WindShaderUniforms,
} from './proceduralModels';
import { WeatherSystem } from './WeatherSystem';

export interface EngineCallbacks {
  onWeatherChange?: (weather: WeatherType) => void;
  onThunderStrike?: (intensity: number) => void;
  onAtmosphereUpdate?: (windStrength: number, rainIntensity: number) => void;
  onContextLost?: (lost: boolean) => void;
}

const _targetCrystalColor = new THREE.Color();
const _targetEmissive = new THREE.Color();
const _cyanColor = new THREE.Color(0x38bdf8);
const _tealColor = new THREE.Color(0x2dd4bf);
const _amberColor = new THREE.Color(0xf59e0b);
const _crimsonColor = new THREE.Color(0xf43f5e);
const _goldColor = new THREE.Color(0xfde047);
const _deadColor = new THREE.Color(0x1e293b);

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export class MysticWorldEngine {
  private container: HTMLElement;
  private isSoftwareGl: boolean;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private textures: ProceduralTextureSet;
  private weatherSystem: WeatherSystem;

  private keyLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rimLight: THREE.DirectionalLight;

  private crystalRig: CrystalRig;
  private brazierGlows: THREE.Mesh[];
  private windUniforms: WindShaderUniforms = {
    uTime: { value: 0 },
    uWindStrength: { value: 0.32 },
  };

  private clock = new THREE.Clock();
  private frameId = 0;
  private disposed = false;

  // Dynamic game-driven visual state
  private lives = 6;
  private maxLives = 6;
  private successPulse = 0;
  private errorShake = 0;

  // Subtle interactive camera orbit
  private targetYaw = 0;
  private currentYaw = 0;
  private targetPitch = 0.08;
  private currentPitch = 0.08;
  private isDragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;

  private callbacks: EngineCallbacks;
  private lastAtmoSync = 0;

  constructor(container: HTMLElement, callbacks: EngineCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareGl();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
    );
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = this.renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    container.appendChild(canvas);

    // 2. Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1220);
    this.scene.fog = new THREE.FogExp2(0x0d1524, 0.021);

    // Studio environment reflection for crystal and bronze
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Camera framed so crystal sits cleanly in upper-center above bottom HUD
    this.camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 180);
    this.camera.position.set(0, 4.1, 10.8);
    this.camera.lookAt(0, 2.05, 0);

    // 4. Three-point lighting rig
    this.hemiLight = new THREE.HemisphereLight(0x3a5480, 0x16211c, 0.72);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0x9ec5ff, 1.55);
    this.keyLight.position.set(12, 20, 10);
    this.keyLight.castShadow = !this.isSoftwareGl;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 2;
    this.keyLight.shadow.camera.far = 55;
    const d = 16;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    this.rimLight.position.set(-10, 8, -14);
    this.scene.add(this.rimLight);

    // 5. Procedural Textures & World Assembly
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = createProceduralTextures(maxAniso);

    const terrain = createTerrainMesh(this.textures);
    this.scene.add(terrain);

    const altar = createAncientAltar(this.textures);
    this.scene.add(altar.group);
    this.brazierGlows = altar.brazierGlows;

    this.crystalRig = createMysticCrystal(this.isSoftwareGl, altar.runeRingMesh);
    this.scene.add(this.crystalRig.group);

    // Temple ring pillars (mix of intact and weathered ruined columns)
    const pillarConfigs = [
      { angle: -2.4, dist: 6.2, h: 4.8, broken: false },
      { angle: -1.65, dist: 6.5, h: 3.4, broken: true },
      { angle: -0.95, dist: 6.2, h: 5.0, broken: false },
      { angle: 0.95, dist: 6.2, h: 4.9, broken: false },
      { angle: 1.65, dist: 6.5, h: 3.1, broken: true },
      { angle: 2.4, dist: 6.2, h: 4.7, broken: false },
      { angle: Math.PI, dist: 7.4, h: 5.4, broken: false },
    ];
    pillarConfigs.forEach((cfg) => {
      const p = createTemplePillar(this.textures, cfg.h, cfg.broken);
      const px = Math.sin(cfg.angle) * cfg.dist;
      const pz = Math.cos(cfg.angle) * cfg.dist;
      p.position.set(px, groundHeightAt(px, pz), pz);
      p.rotation.y = cfg.angle + Math.PI;
      this.scene.add(p);
    });

    // Craggy rock formations around clearing
    const rockCoords = [
      { x: -5.4, z: 3.6, s: 1.1 },
      { x: 5.8, z: 3.2, s: 0.95 },
      { x: -8.2, z: -4.2, s: 1.4 },
      { x: 8.5, z: -5.0, s: 1.5 },
      { x: -4.2, z: -8.8, s: 1.25 },
      { x: 4.6, z: -9.1, s: 1.15 },
    ];
    rockCoords.forEach((rc, i) => {
      const cluster = createRockCluster(this.textures, rc.s);
      cluster.position.set(rc.x, groundHeightAt(rc.x, rc.z) - 0.05, rc.z);
      cluster.rotation.y = i * 1.1;
      this.scene.add(cluster);
    });

    // Instanced ancient forest & ferns
    const forest = createInstancedForest(this.textures, this.windUniforms);
    this.scene.add(forest);

    // Distant jagged mountains & monoliths
    const mountains = createDistantMountains(this.textures);
    this.scene.add(mountains);

    // 6. Weather System
    this.weatherSystem = new WeatherSystem(
      this.scene,
      this.windUniforms,
      (intensity) => this.callbacks.onThunderStrike?.(intensity),
      (w) => this.callbacks.onWeatherChange?.(w),
    );

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // 7. Event listeners
    window.addEventListener('resize', this.handleResize);
    canvas.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('webglcontextlost', this.handleContextLost);
    canvas.addEventListener('webglcontextrestored', this.handleContextRestored);

    this.clock.start();
    this.tick();
  }

  public setLives(lives: number, maxLives = 6): void {
    this.lives = Math.max(0, Math.min(maxLives, lives));
    this.maxLives = maxLives;
  }

  public setWeather(weather: WeatherType): void {
    this.weatherSystem.setWeather(weather, true);
  }

  public triggerSuccessPulse(): void {
    this.successPulse = 1.0;
  }

  public triggerErrorShake(): void {
    this.errorShake = 1.0;
  }

  private handleResize = (): void => {
    if (this.disposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private handlePointerDown = (e: PointerEvent): void => {
    this.isDragging = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    this.targetYaw = THREE.MathUtils.clamp(this.targetYaw - dx * 0.0045, -0.9, 0.9);
    this.targetPitch = THREE.MathUtils.clamp(this.targetPitch + dy * 0.003, -0.1, 0.35);
  };

  private handlePointerUp = (): void => {
    this.isDragging = false;
  };

  private handleContextLost = (e: Event): void => {
    e.preventDefault();
    this.callbacks.onContextLost?.(true);
  };

  private handleContextRestored = (): void => {
    this.callbacks.onContextLost?.(false);
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
    gl.flush();
    if (!sync) {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const poll = () => {
      if (this.disposed) return;
      const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateCrystal(delta: number, elapsed: number): void {
    const livesRatio = this.maxLives > 0 ? this.lives / this.maxLives : 0;

    if (this.successPulse > 0.001) {
      this.successPulse = Math.max(0, this.successPulse - delta * 1.15);
    }
    if (this.errorShake > 0.001) {
      this.errorShake = Math.max(0, this.errorShake - delta * 2.2);
    }

    // Target color based on health & pulse
    if (this.lives === 0) {
      _targetCrystalColor.copy(_deadColor);
      _targetEmissive.copy(_deadColor);
    } else if (this.lives === 1) {
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 7.5);
      _targetCrystalColor.copy(_crimsonColor);
      _targetEmissive.copy(_crimsonColor).multiplyScalar(0.65 + pulse * 0.6);
    } else if (this.lives <= 3) {
      _targetCrystalColor.copy(_amberColor).lerp(_tealColor, (this.lives - 1) / 3);
      _targetEmissive.copy(_targetCrystalColor).multiplyScalar(0.75);
    } else {
      _targetCrystalColor.copy(_cyanColor).lerp(_tealColor, 0.25);
      _targetEmissive.copy(_cyanColor).multiplyScalar(0.7);
    }

    if (this.successPulse > 0.01) {
      _targetCrystalColor.lerp(_goldColor, this.successPulse * 0.65);
      _targetEmissive.lerp(_goldColor, this.successPulse * 0.85);
    }

    const coreMat = this.crystalRig.coreMesh.material as THREE.MeshPhysicalMaterial;
    coreMat.color.lerp(_targetCrystalColor, 1 - Math.exp(-4 * delta));
    coreMat.emissive.lerp(_targetEmissive, 1 - Math.exp(-4 * delta));
    coreMat.emissiveIntensity =
      this.lives === 0
        ? 0.05
        : 0.42 + this.successPulse * 1.65 + (this.lives === 1 ? 0.35 : 0);

    // Floating bob + last-life shudder
    const jitter =
      this.lives === 1
        ? Math.sin(elapsed * 38) * 0.035
        : this.errorShake * Math.sin(elapsed * 45) * 0.14;
    const baseY = this.lives === 0 ? 1.65 : 2.75 + Math.sin(elapsed * 1.4) * 0.14 + this.successPulse * 0.45;
    this.crystalRig.group.position.set(jitter, baseY, 0);
    this.crystalRig.coreMesh.rotation.y += delta * (0.45 + this.successPulse * 3.2);
    this.crystalRig.innerCoreMesh.rotation.y -= delta * 0.8;

    // Crack visibility scales as lives decrease
    const crackMat = this.crystalRig.crackLines.material as THREE.LineBasicMaterial;
    const targetCrackOpacity =
      this.lives === 0 ? 0.9 : Math.max(0, (1 - livesRatio) * 0.95) + this.errorShake * 0.6;
    crackMat.opacity = THREE.MathUtils.damp(crackMat.opacity, Math.min(1, targetCrackOpacity), 5, delta);
    this.crystalRig.crackLines.rotation.copy(this.crystalRig.coreMesh.rotation);

    // Light intensity & color
    this.crystalRig.crystalLight.color.copy(coreMat.color);
    this.crystalRig.crystalLight.intensity = THREE.MathUtils.damp(
      this.crystalRig.crystalLight.intensity,
      this.lives === 0 ? 0.4 : 4.8 * (0.45 + livesRatio * 0.55) + this.successPulse * 8.0,
      4,
      delta,
    );

    // Altar rune ring & braziers reflect crystal state
    const runeMat = this.crystalRig.runeRingMesh.material as THREE.MeshBasicMaterial;
    runeMat.color.copy(coreMat.color);
    runeMat.opacity = this.lives === 0 ? 0.15 : 0.6 + this.successPulse * 0.35;
    this.crystalRig.runeRingMesh.rotation.z += delta * 0.18;

    this.brazierGlows.forEach((orb, idx) => {
      const m = orb.material as THREE.MeshBasicMaterial;
      m.color.copy(coreMat.color);
      orb.position.y = 1.26 + Math.sin(elapsed * 2.2 + idx * 1.4) * 0.05;
    });

    // 6 Orbiting Shards (each corresponds to 1 life)
    this.crystalRig.orbitShards.forEach((shard, idx) => {
      const isAlive = idx < this.lives;
      const mat = shard.mesh.material as THREE.MeshPhysicalMaterial;

      if (isAlive) {
        const ang = shard.phase + elapsed * shard.speed;
        const r = shard.baseRadius + this.successPulse * 0.38;
        const tx = Math.cos(ang) * r;
        const tz = Math.sin(ang) * r;
        const ty = shard.baseY + Math.sin(elapsed * 1.8 + idx) * 0.12;

        shard.mesh.position.x = THREE.MathUtils.damp(shard.mesh.position.x, tx, 6, delta);
        shard.mesh.position.y = THREE.MathUtils.damp(shard.mesh.position.y, ty, 6, delta);
        shard.mesh.position.z = THREE.MathUtils.damp(shard.mesh.position.z, tz, 6, delta);
        shard.mesh.rotation.y += delta * 1.1;
        mat.opacity = THREE.MathUtils.damp(mat.opacity, 0.95, 5, delta);
        mat.color.copy(coreMat.color);
        mat.emissive.copy(coreMat.emissive);
      } else {
        // Shattered shard drifts outward & falls softly
        const sx = shard.scatterDir.x * 2.8;
        const sy = -1.6;
        const sz = shard.scatterDir.z * 2.8;
        shard.mesh.position.x = THREE.MathUtils.damp(shard.mesh.position.x, sx, 2.4, delta);
        shard.mesh.position.y = THREE.MathUtils.damp(shard.mesh.position.y, sy, 2.4, delta);
        shard.mesh.position.z = THREE.MathUtils.damp(shard.mesh.position.z, sz, 2.4, delta);
        mat.opacity = THREE.MathUtils.damp(mat.opacity, 0.0, 3.5, delta);
      }
      shard.mesh.visible = mat.opacity > 0.02;
    });
  }

  private updateCamera(delta: number, elapsed: number): void {
    // Gentle return toward center when not dragging
    if (!this.isDragging) {
      this.targetYaw = THREE.MathUtils.damp(this.targetYaw, Math.sin(elapsed * 0.16) * 0.14, 0.6, delta);
      this.targetPitch = THREE.MathUtils.damp(this.targetPitch, 0.08, 0.8, delta);
    }

    this.currentYaw = THREE.MathUtils.damp(this.currentYaw, this.targetYaw, 4.5, delta);
    this.currentPitch = THREE.MathUtils.damp(this.currentPitch, this.targetPitch, 4.5, delta);

    const dist = 10.6;
    const shakeX = this.errorShake * Math.sin(elapsed * 52) * 0.18;
    const shakeY = this.errorShake * Math.cos(elapsed * 44) * 0.12;

    const camX = Math.sin(this.currentYaw) * dist + shakeX;
    const camZ = Math.cos(this.currentYaw) * dist;
    const camY = 3.55 + Math.sin(this.currentPitch) * 4.5 + Math.sin(elapsed * 0.35) * 0.12 + shakeY;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(0, 1.85, 0);
  }

  private tick = (): void => {
    if (this.disposed) return;

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.1);
    const elapsed = this.clock.getElapsedTime();
    const livesRatio = this.maxLives > 0 ? this.lives / this.maxLives : 0;

    this.weatherSystem.update(
      delta,
      elapsed,
      livesRatio,
      this.scene,
      this.renderer,
      this.keyLight,
      this.hemiLight,
    );
    this.updateCrystal(delta, elapsed);
    this.updateCamera(delta, elapsed);

    if (elapsed - this.lastAtmoSync > 0.35) {
      this.lastAtmoSync = elapsed;
      this.callbacks.onAtmosphereUpdate?.(
        this.weatherSystem.windStrength,
        this.weatherSystem.rainOpacity,
      );
    }

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    window.clearTimeout(this.frameId);

    window.removeEventListener('resize', this.handleResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.weatherSystem.dispose();
    this.textures.dispose();

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    if (this.scene.environment) {
      this.scene.environment.dispose();
    }

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
