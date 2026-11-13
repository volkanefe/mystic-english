import * as THREE from 'three';
import { WeatherType } from '../types/game';
import { WindShaderUniforms } from './proceduralModels';

interface WeatherPreset {
  fogColor: THREE.Color;
  fogDensity: number;
  skyColor: THREE.Color;
  keyColor: THREE.Color;
  keyIntensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  windStrength: number;
  rainOpacity: number;
  sunbeamOpacity: number;
  fireflyOpacity: number;
  exposure: number;
}

const PRESETS: Record<WeatherType, WeatherPreset> = {
  normal: {
    fogColor: new THREE.Color(0x0d1524),
    fogDensity: 0.021,
    skyColor: new THREE.Color(0x0b1220),
    keyColor: new THREE.Color(0x9ec5ff),
    keyIntensity: 1.55,
    hemiSky: new THREE.Color(0x3a5480),
    hemiGround: new THREE.Color(0x16211c),
    hemiIntensity: 0.72,
    windStrength: 0.32,
    rainOpacity: 0.0,
    sunbeamOpacity: 0.0,
    fireflyOpacity: 0.75,
    exposure: 1.05,
  },
  storm: {
    fogColor: new THREE.Color(0x070a12),
    fogDensity: 0.032,
    skyColor: new THREE.Color(0x06080f),
    keyColor: new THREE.Color(0x64748b),
    keyIntensity: 0.75,
    hemiSky: new THREE.Color(0x1e293b),
    hemiGround: new THREE.Color(0x0d1312),
    hemiIntensity: 0.45,
    windStrength: 1.0,
    rainOpacity: 0.62,
    sunbeamOpacity: 0.0,
    fireflyOpacity: 0.05,
    exposure: 0.82,
  },
  sunny: {
    fogColor: new THREE.Color(0x28272c),
    fogDensity: 0.011,
    skyColor: new THREE.Color(0x1c2538),
    keyColor: new THREE.Color(0xffd28a),
    keyIntensity: 2.9,
    hemiSky: new THREE.Color(0xfcd39a),
    hemiGround: new THREE.Color(0x243628),
    hemiIntensity: 0.95,
    windStrength: 0.18,
    rainOpacity: 0.0,
    sunbeamOpacity: 0.44,
    fireflyOpacity: 0.95,
    exposure: 1.24,
  },
};

const _dummy = new THREE.Object3D();
const _targetFogColor = new THREE.Color();

export class WeatherSystem {
  public currentWeather: WeatherType = 'normal';
  private autoTimer = 0;
  private nextChangeIn = 24;

  // Current interpolated state
  public windStrength = PRESETS.normal.windStrength;
  public rainOpacity = 0;
  public sunbeamOpacity = 0;
  private fireflyOpacity = PRESETS.normal.fireflyOpacity;
  private lightningFlash = 0;
  private lightningCooldown = 3.5;

  // Scene objects
  private rainMesh: THREE.InstancedMesh;
  private rainMat: THREE.MeshBasicMaterial;
  private rainPositions: Float32Array;
  private rainSpeeds: Float32Array;
  private readonly rainCount = 950;

  private sunbeamsGroup: THREE.Group;
  private sunbeamMats: THREE.ShaderMaterial[] = [];

  private fireflies: THREE.Points;
  private fireflyMat: THREE.PointsMaterial;
  private fireflyBasePos: Float32Array;
  private readonly fireflyCount = 90;

  private lightningLine: THREE.Line;
  private lightningMat: THREE.LineBasicMaterial;
  private lightningLight: THREE.DirectionalLight;

  private windUniforms: WindShaderUniforms;
  private onThunder?: (intensity: number) => void;
  private onWeatherChanged?: (weather: WeatherType) => void;

  constructor(
    scene: THREE.Scene,
    windUniforms: WindShaderUniforms,
    onThunder?: (intensity: number) => void,
    onWeatherChanged?: (weather: WeatherType) => void,
  ) {
    this.windUniforms = windUniforms;
    this.onThunder = onThunder;
    this.onWeatherChanged = onWeatherChanged;

    // 1. 3D Rain Streaks (InstancedMesh)
    const dropGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.85, 4);
    this.rainMat = new THREE.MeshBasicMaterial({
      color: 0xa5c8e8,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.rainMesh = new THREE.InstancedMesh(dropGeo, this.rainMat, this.rainCount);
    this.rainMesh.frustumCulled = false;

    this.rainPositions = new Float32Array(this.rainCount * 3);
    this.rainSpeeds = new Float32Array(this.rainCount);

    for (let i = 0; i < this.rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 34;
      this.rainPositions[i * 3 + 1] = Math.random() * 20;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 34;
      this.rainSpeeds[i] = 17 + Math.random() * 9;

      _dummy.position.set(
        this.rainPositions[i * 3],
        this.rainPositions[i * 3 + 1],
        this.rainPositions[i * 3 + 2],
      );
      _dummy.rotation.set(0, 0, 0.16);
      _dummy.updateMatrix();
      this.rainMesh.setMatrixAt(i, _dummy.matrix);
    }
    this.rainMesh.instanceMatrix.needsUpdate = true;
    scene.add(this.rainMesh);

    // 2. Volumetric Sunbeams (God-rays)
    this.sunbeamsGroup = new THREE.Group();
    const beamConfigs = [
      { x: -3.5, y: 9.5, z: -2.0, rx: 0.15, rz: -0.28, rTop: 0.6, rBot: 3.6, len: 18 },
      { x: 2.2, y: 10.2, z: -1.5, rx: 0.12, rz: -0.24, rTop: 0.8, rBot: 4.2, len: 19 },
      { x: 0.0, y: 11.0, z: 1.0, rx: 0.18, rz: -0.26, rTop: 0.5, rBot: 3.1, len: 18 },
    ];

    beamConfigs.forEach((cfg, idx) => {
      const beamGeo = new THREE.CylinderGeometry(cfg.rTop, cfg.rBot, cfg.len, 24, 1, true);
      const beamMat = new THREE.ShaderMaterial({
        uniforms: {
          uOpacity: { value: 0 },
          uTime: { value: idx * 1.7 },
          uColor: { value: new THREE.Color(0xffe19c) },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewPos;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPos = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float uOpacity;
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewPos;
          void main() {
            vec3 viewDir = normalize(vViewPos);
            float fresnel = pow(abs(dot(viewDir, vNormal)), 1.6);
            float verticalFade = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.15, vUv.y);
            float shimmer = 0.82 + 0.18 * sin(vUv.x * 18.0 + uTime * 0.8);
            float alpha = uOpacity * fresnel * verticalFade * shimmer;
            gl_FragColor = vec4(uColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });

      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(cfg.x, cfg.y, cfg.z);
      beam.rotation.set(cfg.rx, 0, cfg.rz);
      this.sunbeamsGroup.add(beam);
      this.sunbeamMats.push(beamMat);
    });
    scene.add(this.sunbeamsGroup);

    // 3. Fireflies / Mystic Spores
    const ffGeo = new THREE.BufferGeometry();
    const ffPos = new Float32Array(this.fireflyCount * 3);
    this.fireflyBasePos = new Float32Array(this.fireflyCount * 3);
    for (let i = 0; i < this.fireflyCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 1.6 + Math.random() * 14;
      const x = Math.cos(angle) * dist;
      const y = 0.6 + Math.random() * 4.5;
      const z = Math.sin(angle) * dist;
      ffPos[i * 3] = x;
      ffPos[i * 3 + 1] = y;
      ffPos[i * 3 + 2] = z;
      this.fireflyBasePos[i * 3] = x;
      this.fireflyBasePos[i * 3 + 1] = y;
      this.fireflyBasePos[i * 3 + 2] = z;
    }
    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
    this.fireflyMat = new THREE.PointsMaterial({
      color: 0xa7f3d0,
      size: 0.11,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.fireflies = new THREE.Points(ffGeo, this.fireflyMat);
    scene.add(this.fireflies);

    // 4. Lightning Bolt & Flash Light
    const boltGeo = new THREE.BufferGeometry();
    const boltVerts = new Float32Array(12 * 3);
    boltGeo.setAttribute('position', new THREE.BufferAttribute(boltVerts, 3));
    this.lightningMat = new THREE.LineBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0,
    });
    this.lightningLine = new THREE.Line(boltGeo, this.lightningMat);
    this.lightningLine.visible = false;
    scene.add(this.lightningLine);

    this.lightningLight = new THREE.DirectionalLight(0xdbeafe, 0);
    this.lightningLight.position.set(-14, 24, -18);
    scene.add(this.lightningLight);
  }

  public setWeather(weather: WeatherType, resetTimer = true): void {
    if (this.currentWeather !== weather) {
      this.currentWeather = weather;
      this.onWeatherChanged?.(weather);
    }
    if (resetTimer) {
      this.autoTimer = 0;
      this.nextChangeIn = 22 + Math.random() * 16;
    }
  }

  public triggerLightning(): void {
    this.lightningFlash = 1.0;
    const baseX = (Math.random() - 0.5) * 28;
    const baseZ = -22 - Math.random() * 14;
    const pos = this.lightningLine.geometry.attributes.position as THREE.BufferAttribute;

    let curX = baseX;
    let curY = 26;
    let curZ = baseZ;
    for (let i = 0; i < 12; i++) {
      pos.setXYZ(i, curX, curY, curZ);
      curX += (Math.random() - 0.5) * 2.8;
      curY -= 2.25;
      curZ += (Math.random() - 0.5) * 1.4;
    }
    pos.needsUpdate = true;
    this.lightningLine.visible = true;
    this.onThunder?.(0.75 + Math.random() * 0.25);
  }

  public update(
    delta: number,
    elapsed: number,
    livesRatio: number,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    keyLight: THREE.DirectionalLight,
    hemiLight: THREE.HemisphereLight,
  ): void {
    // 1. Automatic randomized weather transitions (storm more likely when health is low!)
    this.autoTimer += delta;
    if (this.autoTimer >= this.nextChangeIn) {
      this.autoTimer = 0;
      this.nextChangeIn = 20 + Math.random() * 16;

      const stormBias = (1 - livesRatio) * 0.35;
      const roll = Math.random();
      let next: WeatherType = 'normal';
      if (roll < 0.34 + stormBias) {
        next = 'storm';
      } else if (roll < 0.68) {
        next = 'normal';
      } else {
        next = 'sunny';
      }
      if (next === this.currentWeather) {
        next = this.currentWeather === 'normal' ? (Math.random() > 0.45 ? 'storm' : 'sunny') : 'normal';
      }
      this.setWeather(next, false);
    }

    const preset = PRESETS[this.currentWeather];
    const dampSpeed = 0.75;

    // Gloominess scaling as player loses lives
    const gloomFactor = 0.58 + livesRatio * 0.42;

    // 2. Smoothly interpolate fog, sky, lights, wind
    const fog = scene.fog as THREE.FogExp2;
    _targetFogColor.copy(preset.fogColor).multiplyScalar(gloomFactor);
    fog.color.lerp(_targetFogColor, 1 - Math.exp(-dampSpeed * delta));
    fog.density = THREE.MathUtils.damp(
      fog.density,
      preset.fogDensity + (1 - livesRatio) * 0.009,
      dampSpeed,
      delta,
    );

    if (scene.background instanceof THREE.Color) {
      _targetFogColor.copy(preset.skyColor).multiplyScalar(gloomFactor);
      scene.background.lerp(_targetFogColor, 1 - Math.exp(-dampSpeed * delta));
    }

    keyLight.color.lerp(preset.keyColor, 1 - Math.exp(-dampSpeed * delta));
    keyLight.intensity = THREE.MathUtils.damp(
      keyLight.intensity,
      preset.keyIntensity * gloomFactor + this.lightningFlash * 7.5,
      3.5,
      delta,
    );

    hemiLight.color.lerp(preset.hemiSky, 1 - Math.exp(-dampSpeed * delta));
    hemiLight.groundColor.lerp(preset.hemiGround, 1 - Math.exp(-dampSpeed * delta));
    hemiLight.intensity = THREE.MathUtils.damp(
      hemiLight.intensity,
      preset.hemiIntensity * gloomFactor,
      dampSpeed,
      delta,
    );

    renderer.toneMappingExposure = THREE.MathUtils.damp(
      renderer.toneMappingExposure,
      preset.exposure * (0.82 + livesRatio * 0.18) + this.lightningFlash * 0.45,
      2.2,
      delta,
    );

    this.windStrength = THREE.MathUtils.damp(this.windStrength, preset.windStrength, 0.9, delta);
    this.rainOpacity = THREE.MathUtils.damp(this.rainOpacity, preset.rainOpacity, 1.2, delta);
    this.sunbeamOpacity = THREE.MathUtils.damp(this.sunbeamOpacity, preset.sunbeamOpacity, 0.85, delta);
    this.fireflyOpacity = THREE.MathUtils.damp(this.fireflyOpacity, preset.fireflyOpacity, 1.1, delta);

    this.windUniforms.uTime.value = elapsed;
    this.windUniforms.uWindStrength.value = this.windStrength;

    // 3. Update 3D Rain Streaks
    this.rainMat.opacity = this.rainOpacity;
    this.rainMesh.visible = this.rainOpacity > 0.015;
    if (this.rainMesh.visible) {
      const windDrift = this.windStrength * 4.5;
      for (let i = 0; i < this.rainCount; i++) {
        let rx = this.rainPositions[i * 3] + windDrift * delta;
        let ry = this.rainPositions[i * 3 + 1] - this.rainSpeeds[i] * delta;
        const rz = this.rainPositions[i * 3 + 2];

        if (ry < 0) {
          ry = 18 + Math.random() * 4;
          rx = (Math.random() - 0.5) * 34;
        }
        if (rx > 17) rx -= 34;

        this.rainPositions[i * 3] = rx;
        this.rainPositions[i * 3 + 1] = ry;

        _dummy.position.set(rx, ry, rz);
        _dummy.rotation.set(0, 0, 0.14 * this.windStrength);
        _dummy.updateMatrix();
        this.rainMesh.setMatrixAt(i, _dummy.matrix);
      }
      this.rainMesh.instanceMatrix.needsUpdate = true;
    }

    // 4. Lightning logic during storm (or critical low health)
    if (this.currentWeather === 'storm' || livesRatio <= 0.2) {
      this.lightningCooldown -= delta;
      if (this.lightningCooldown <= 0) {
        this.triggerLightning();
        this.lightningCooldown = this.currentWeather === 'storm' ? 4.5 + Math.random() * 6 : 8 + Math.random() * 8;
      }
    }

    if (this.lightningFlash > 0.001) {
      this.lightningFlash = Math.max(0, this.lightningFlash - delta * 3.8);
      this.lightningLight.intensity = this.lightningFlash * 10;
      this.lightningMat.opacity = Math.min(1, this.lightningFlash * 1.6);
      if (this.lightningFlash < 0.15) {
        this.lightningLine.visible = false;
      }
    } else {
      this.lightningLight.intensity = 0;
      this.lightningLine.visible = false;
    }

    // 5. Volumetric Sunbeams
    this.sunbeamsGroup.visible = this.sunbeamOpacity > 0.01;
    if (this.sunbeamsGroup.visible) {
      for (let i = 0; i < this.sunbeamMats.length; i++) {
        this.sunbeamMats[i].uniforms.uOpacity.value = this.sunbeamOpacity;
        this.sunbeamMats[i].uniforms.uTime.value = elapsed + i * 2.1;
      }
    }

    // 6. Fireflies / Forest Spores
    this.fireflyMat.opacity = this.fireflyOpacity;
    this.fireflies.visible = this.fireflyOpacity > 0.02;
    if (this.fireflies.visible) {
      const fPos = this.fireflies.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < this.fireflyCount; i++) {
        const bx = this.fireflyBasePos[i * 3];
        const by = this.fireflyBasePos[i * 3 + 1];
        const bz = this.fireflyBasePos[i * 3 + 2];
        fPos.setXYZ(
          i,
          bx + Math.sin(elapsed * 0.7 + i) * 0.45,
          by + Math.sin(elapsed * 1.1 + i * 0.7) * 0.28,
          bz + Math.cos(elapsed * 0.65 + i * 1.3) * 0.45,
        );
      }
      fPos.needsUpdate = true;
    }
  }

  public dispose(): void {
    this.rainMesh.geometry.dispose();
    this.rainMat.dispose();
    this.sunbeamsGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
      }
    });
    this.sunbeamMats.forEach((m) => m.dispose());
    this.fireflies.geometry.dispose();
    this.fireflyMat.dispose();
    this.lightningLine.geometry.dispose();
    this.lightningMat.dispose();
  }
}
