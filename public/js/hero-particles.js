// Ana sayfa hero partikül animasyonu — antigravity.google'ın GPGPU
// (256x256 float FBO ping-pong) imleç animasyonundan uyarlandı.
// Renkler VT paletine çevrildi; hero görünür değilken durur;
// prefers-reduced-motion tercihine saygı gösterir.
import * as THREE from "/vendor/three.module.min.js";

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

class Noise1D {
  constructor() {
    this.seed = 1337;
  }
  hash(n) {
    const s = Math.sin(n * 127.1 + this.seed) * 43758.5453;
    return s - Math.floor(s);
  }
  getVal(t) {
    const i = Math.floor(t);
    const f = t - i;
    const u = f * f * (3 - 2 * f);
    return this.hash(i) * (1 - u) + this.hash(i + 1) * u;
  }
}

// Poisson disk örneklemesi (Bridson)
function poissonDiskSample(width, height, radius, tries = 20) {
  const cellSize = radius / Math.SQRT2;
  const gw = Math.ceil(width / cellSize);
  const gh = Math.ceil(height / cellSize);
  const grid = new Int32Array(gw * gh).fill(-1);
  const points = [];
  const active = [];

  function fits(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    const gx = Math.floor(x / cellSize);
    const gy = Math.floor(y / cellSize);
    for (let yy = Math.max(0, gy - 2); yy <= Math.min(gh - 1, gy + 2); yy++) {
      for (let xx = Math.max(0, gx - 2); xx <= Math.min(gw - 1, gx + 2); xx++) {
        const idx = grid[yy * gw + xx];
        if (idx !== -1) {
          const dx = points[idx][0] - x;
          const dy = points[idx][1] - y;
          if (dx * dx + dy * dy < radius * radius) return false;
        }
      }
    }
    return true;
  }
  function add(x, y) {
    grid[Math.floor(y / cellSize) * gw + Math.floor(x / cellSize)] = points.length;
    points.push([x, y]);
    active.push(points.length - 1);
  }

  add(Math.random() * width, Math.random() * height);
  while (active.length) {
    const ai = Math.floor(Math.random() * active.length);
    const [px, py] = points[active[ai]];
    let placed = false;
    for (let k = 0; k < tries; k++) {
      const ang = Math.random() * Math.PI * 2;
      const r = radius * (1 + Math.random());
      const x = px + Math.cos(ang) * r;
      const y = py + Math.sin(ang) * r;
      if (fits(x, y)) {
        add(x, y);
        placed = true;
        break;
      }
    }
    if (!placed) active.splice(ai, 1);
  }
  return points;
}

const linearMap = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;

class Particles {
  constructor(scene) {
    this.scene = scene;
    this.renderer = scene.renderer;
    this.lastTime = 0;
    this.everRendered = false;
    this.ringPos = new THREE.Vector2(0, 0);
    this.cursorPos = new THREE.Vector2(0, 0);
    this.colorScheme = 0;
    this.particleScale = (this.renderer.domElement.width / scene.pixelRatio / 2000) * scene.particlesScale;
    this.noise = new Noise1D();
    this.createPoints();
    this.init();
  }

  createPoints() {
    const radius = linearMap(this.scene.density, 0, 300, 10, 2);
    const pts = poissonDiskSample(500, 500, radius, 20);
    this.pointsData = [];
    for (let i = 0; i < pts.length; i++) this.pointsData.push(pts[i][0] - 250, pts[i][1] - 250);
    this.count = this.pointsData.length / 2;
  }

  createDataTexturePosition() {
    const data = new Float32Array(this.length * 4);
    for (let i = 0; i < this.count; i++) {
      const o = i * 4;
      data[o] = this.pointsData[i * 2] * (1 / 250);
      data[o + 1] = this.pointsData[i * 2 + 1] * (1 / 250);
    }
    const tex = new THREE.DataTexture(data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType);
    tex.needsUpdate = true;
    return tex;
  }

  createRenderTarget() {
    return new THREE.WebGLRenderTarget(this.size, this.size, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false
    });
  }

  init() {
    this.size = 256;
    this.length = this.size * this.size;
    this.posTex = this.createDataTexturePosition();
    this.rt1 = this.createRenderTarget();
    this.rt2 = this.createRenderTarget();

    this.renderer.setRenderTarget(this.rt1);
    this.renderer.setClearColor(0, 0);
    this.renderer.clear();
    this.renderer.setRenderTarget(this.rt2);
    this.renderer.setClearColor(0, 0);
    this.renderer.clear();
    this.renderer.setRenderTarget(null);

    this.simScene = new THREE.Scene();
    this.simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPosition: { value: this.posTex },
        uPosRefs: { value: this.posTex },
        uRingPos: { value: new THREE.Vector2(0, 0) },
        uRingRadius: { value: 0.2 },
        uDeltaTime: { value: 0 },
        uRingWidth: { value: 0.05 },
        uRingWidth2: { value: 0.015 },
        uRingDisplacement: { value: this.scene.ringDisplacement },
        uTime: { value: 0 }
      },
      vertexShader: /* glsl */ `
        void main() { gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform sampler2D uPosition;
        uniform sampler2D uPosRefs;
        uniform vec2 uRingPos;
        uniform float uTime;
        uniform float uDeltaTime;
        uniform float uRingRadius;
        uniform float uRingWidth;
        uniform float uRingWidth2;
        uniform float uRingDisplacement;

        ${NOISE_GLSL}

        void main() {
          vec2 simTexCoords = gl_FragCoord.xy / vec2(${this.size.toFixed(1)}, ${this.size.toFixed(1)});
          vec4 pFrame = texture2D(uPosition, simTexCoords);

          float scale = pFrame.z;
          float velocity = pFrame.w;
          vec2 refPos = texture2D(uPosRefs, simTexCoords).xy;

          float time = uTime * .5;
          vec2 curentPos = refPos;

          vec2 pos = pFrame.xy;
          pos *= .8;

          float dist = distance(curentPos.xy, uRingPos);
          float noise0 = snoise(vec3(curentPos.xy * .2 + vec2(18.4924, 72.9744), time * 0.5));
          float dist1 = distance(curentPos.xy + (noise0 * .005), uRingPos);

          float t = smoothstep(uRingRadius - (uRingWidth * 2.), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth, dist1);
          float t2 = smoothstep(uRingRadius - (uRingWidth2 * 2.), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth2, dist1);
          float t3 = smoothstep(uRingRadius + uRingWidth2, uRingRadius, dist);

          t = pow(t, 2.);
          t2 = pow(t2, 3.);

          t += t2 * 3.;
          t += t3 * .4;
          t += snoise(vec3(curentPos.xy * 30. + vec2(11.4924, 12.9744), time * 0.5)) * t3 * .5;

          float nS = snoise(vec3(curentPos.xy * 2. + vec2(18.4924, 72.9744), time * 0.5));
          t += pow((nS + 1.5) * .5, 2.) * .6;

          float noise1 = snoise(vec3(curentPos.xy * 4. + vec2(88.494, 32.4397), time * 0.35));
          float noise2 = snoise(vec3(curentPos.xy * 4. + vec2(50.904, 120.947), time * 0.35));

          float noise3 = snoise(vec3(curentPos.xy * 20. + vec2(18.4924, 72.9744), time * .5));
          float noise4 = snoise(vec3(curentPos.xy * 20. + vec2(50.904, 120.947), time * .5));

          vec2 disp = vec2(noise1, noise2) * .03;
          disp += vec2(noise3, noise4) * .005;

          disp.x += sin((refPos.x * 20.) + (time * 4.)) * .02 * clamp(dist, 0., 1.);
          disp.y += cos((refPos.y * 20.) + (time * 3.)) * .02 * clamp(dist, 0., 1.);

          pos -= (uRingPos - (curentPos + disp)) * pow(t2, .75) * uRingDisplacement;

          float scaleDiff = t - scale;
          scaleDiff *= .2;
          scale += scaleDiff;

          vec2 finalPos = curentPos + disp + (pos * .25);

          velocity *= .5;
          velocity += scale * .25;

          gl_FragColor = vec4(finalPos, scale, velocity);
        }
      `
    });
    this.simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.simMaterial));

    const geo = new THREE.BufferGeometry();
    const uvs = new Float32Array(this.count * 2);
    const positions = new Float32Array(this.count * 3);
    const seeds = new Float32Array(this.count * 4);
    for (let i = 0; i < this.count; i++) {
      uvs[i * 2] = (i % this.size) / this.size;
      uvs[i * 2 + 1] = Math.floor(i / this.size) / this.size;
    }
    for (let i = 0; i < this.count * 4; i++) seeds[i] = Math.random();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute("seeds", new THREE.BufferAttribute(seeds, 4));

    this.renderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPosition: { value: this.posTex },
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(this.scene.colorControls.color1) },
        uColor2: { value: new THREE.Color(this.scene.colorControls.color2) },
        uColor3: { value: new THREE.Color(this.scene.colorControls.color3) },
        uAlpha: { value: 1 },
        uRingPos: { value: new THREE.Vector2(0, 0) },
        uRez: { value: new THREE.Vector2(this.renderer.domElement.width, this.renderer.domElement.height) },
        uParticleScale: { value: this.particleScale },
        uPixelRatio: { value: this.scene.pixelRatio },
        uColorScheme: { value: this.colorScheme }
      },
      vertexShader: /* glsl */ `
        precision highp float;
        attribute vec4 seeds;

        uniform sampler2D uPosition;
        uniform float uTime;
        uniform float uParticleScale;
        uniform float uPixelRatio;
        uniform int uColorScheme;

        varying vec4 vSeeds;
        varying float vVelocity;
        varying vec2 vLocalPos;
        varying vec2 vScreenPos;
        varying float vScale;

        void main() {
          vec4 pos = texture2D(uPosition, uv);
          vSeeds = seeds;

          vVelocity = pos.w;
          vScale = pos.z;
          vLocalPos = pos.xy;
          vec4 viewSpace = modelViewMatrix * vec4(vec3(pos.xy, 0.), 1.0);

          gl_Position = projectionMatrix * viewSpace;
          vScreenPos = gl_Position.xy;

          gl_PointSize = ((vScale * 7.) * (uPixelRatio * 0.5) * uParticleScale);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;

        varying vec4 vSeeds;
        varying vec2 vScreenPos;
        varying vec2 vLocalPos;
        varying float vScale;
        varying float vVelocity;

        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec2 uRingPos;
        uniform vec2 uRez;
        uniform float uAlpha;
        uniform float uTime;
        uniform int uColorScheme;

        ${NOISE_GLSL}

        float sdRoundBox( in vec2 p, in vec2 b, in vec4 r ) {
          r.xy = (p.x>0.0)?r.xy : r.zw;
          r.x  = (p.y>0.0)?r.x  : r.y;
          vec2 q = abs(p)-b+r.x;
          return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
        }

        vec2 rotate(vec2 v, float a) {
          float s = sin(a);
          float c = cos(a);
          mat2 m = mat2(c, s, -s, c);
          return m * v;
        }

        void main() {
          float noiseAngle = snoise(vec3(vLocalPos * 10. + vec2(18.4924, 72.9744), uTime * .85));
          float noiseColor = snoise(vec3(vLocalPos * 2. + vec2(74.664, 91.556), uTime * .5));
          noiseColor = (noiseColor + 1.) * .5;

          float angle = atan(vLocalPos.y - uRingPos.y, vLocalPos.x - uRingPos.x);

          vec2 uv = gl_PointCoord.xy;
          uv -= vec2(0.5);
          uv.y *= -1.;
          uv = rotate(uv, -angle + (noiseAngle * .5));

          float h = 0.8;
          float progress = smoothstep(0., .75, pow(noiseColor, 2.));
          vec3 col = mix(mix(uColor1, uColor2, progress/h), mix(uColor2, uColor3, (progress - h)/(1.0 - h)), step(h, progress));
          vec3 color = col;

          float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(.25));
          rounded = smoothstep(.1, 0., rounded);

          float a = uAlpha * rounded * smoothstep(0.1, 0.2, vScale);

          if(a < 0.01){ discard; }

          color = clamp(color, 0., 1.);
          color = mix(color, color * clamp(vVelocity, 0., 1.), float(uColorScheme));

          gl_FragColor = vec4(color, clamp(a, 0., 1.));
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    this.mesh = new THREE.Points(geo, this.renderMaterial);
    this.mesh.scale.set(5, 5, 5);
    this.scene.scene.add(this.mesh);
  }

  resize() {
    this.renderMaterial.uniforms.uRez.value.set(this.renderer.domElement.width, this.renderer.domElement.height);
  }

  update() {
    const elapsed = this.scene.clock.getElapsedTime();
    const dt = elapsed - this.lastTime;
    this.lastTime = elapsed;

    const nx = (this.noise.getVal(this.scene.time * 0.66 + 94.234) - 0.5) * 2;
    const ny = (this.noise.getVal(this.scene.time * 0.75 + 21.028) - 0.5) * 2;

    if (this.scene.isIntersecting) {
      this.cursorPos.set(
        this.scene.intersectionPoint.x * 0.175 + nx * 0.1,
        this.scene.intersectionPoint.y * 0.175 + ny * 0.1
      );
      this.ringPos.set(
        this.ringPos.x + (this.cursorPos.x - this.ringPos.x) * 0.02,
        this.ringPos.y + (this.cursorPos.y - this.ringPos.y) * 0.02
      );
    } else {
      this.cursorPos.set(nx * 0.2, ny * 0.1);
      this.ringPos.set(
        this.ringPos.x + (this.cursorPos.x - this.ringPos.x) * 0.01,
        this.ringPos.y + (this.cursorPos.y - this.ringPos.y) * 0.01
      );
    }

    this.particleScale = (this.renderer.domElement.width / this.scene.pixelRatio / 2000) * this.scene.particlesScale;

    this.simMaterial.uniforms.uPosition.value = this.everRendered ? this.rt1.texture : this.posTex;
    this.simMaterial.uniforms.uTime.value = elapsed;
    this.simMaterial.uniforms.uDeltaTime.value = dt;
    this.simMaterial.uniforms.uRingRadius.value =
      0.175 + Math.sin(this.scene.time * 1) * 0.03 + Math.cos(this.scene.time * 3) * 0.02;
    this.simMaterial.uniforms.uRingPos.value = this.ringPos;
    this.simMaterial.uniforms.uRingWidth.value = this.scene.ringWidth;
    this.simMaterial.uniforms.uRingWidth2.value = this.scene.ringWidth2;
    this.simMaterial.uniforms.uRingDisplacement.value = this.scene.ringDisplacement;

    this.renderer.setRenderTarget(this.rt2);
    this.renderer.render(this.simScene, this.simCamera);
    this.renderer.setRenderTarget(null);

    this.renderMaterial.uniforms.uPosition.value = this.everRendered ? this.rt2.texture : this.posTex;
    this.renderMaterial.uniforms.uTime.value = elapsed;
    this.renderMaterial.uniforms.uRingPos.value = this.ringPos;
    this.renderMaterial.uniforms.uParticleScale.value = this.particleScale;
  }

  postRender() {
    const tmp = this.rt1;
    this.rt1 = this.rt2;
    this.rt2 = tmp;
    this.everRendered = true;
  }
}

class ParticleScene {
  constructor(options) {
    this.options = options;
    this.pixelRatio = options.pixelRatio || Math.min(window.devicePixelRatio, 2);
    this.particlesScale = options.particlesScale || 1;
    this.density = options.density || 200;
    this.ringWidth = options.ringWidth || 0.107;
    this.ringWidth2 = options.ringWidth2 || 0.05;
    this.ringDisplacement = options.ringDisplacement || 0.15;
    this.colorControls = options.colors;

    this.scene = new THREE.Scene();

    this.canvas = document.createElement("canvas");
    options.container.appendChild(this.canvas);
    this.canvas.width = options.container.offsetWidth;
    this.canvas.height = options.container.offsetHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      precision: "highp"
    });
    this.renderer.extensions.get("EXT_color_buffer_float");
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setPixelRatio(this.pixelRatio);

    this.camera = new THREE.PerspectiveCamera(40, this.canvas.width / this.canvas.height, 0.1, 1000);
    this.camera.position.z = 3.1;

    this.clock = new THREE.Clock();
    this.time = 0;
    this.lastTime = 0;
    this.skipFrame = false;
    this.isPaused = false;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-10, -10);
    this.intersectionPoint = new THREE.Vector3();
    this.isIntersecting = false;
    this.mouseIsOver = false;
    this.raycastPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(12.5, 12.5),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    this.scene.add(this.raycastPlane);

    this.particles = new Particles(this);

    window.addEventListener("resize", () => this.onResize());
    window.addEventListener("pointermove", (e) => this.onPointerMove(e));
    window.addEventListener("pointerleave", () => {
      this.mouseIsOver = false;
    });
  }

  onPointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    if (x < -1 || x > 1 || y < -1 || y > 1) {
      this.mouseIsOver = false;
    } else {
      this.mouse.set(x, y);
      this.mouseIsOver = true;
    }
  }

  onResize() {
    this.canvas.width = this.options.container.offsetWidth;
    this.canvas.height = this.options.container.offsetHeight;
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.camera.aspect = this.canvas.width / this.canvas.height;
    this.camera.updateProjectionMatrix();
    this.particles.resize();
  }

  preRender() {
    const elapsed = this.clock.getElapsedTime();
    this.dt = elapsed - this.lastTime;
    this.lastTime = elapsed;
    this.time += this.dt;

    this.particles.update();

    this.skipFrame = !this.skipFrame;
    if (this.skipFrame) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(this.raycastPlane);
    if (hits.length > 0 && this.mouseIsOver) {
      this.intersectionPoint.copy(hits[0].point);
      this.isIntersecting = true;
    } else {
      this.isIntersecting = false;
    }
  }

  render() {
    if (this.isPaused) return;
    this.preRender();
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = false;
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.particles.postRender();
  }
}

// ---------- Başlat ----------

const container = document.getElementById("heroParticles");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (container && !reduceMotion) {
  try {
    const scene = new ParticleScene({
      container,
      particlesScale: 0.75,
      density: 200,
      ringWidth: 0.15,
      ringWidth2: 0.05,
      ringDisplacement: 0.15,
      // VT paleti: parlak kırmızı -> marka kırmızısı -> siyaha kaybolma
      colors: { color1: "#ff5063", color2: "#a6192e", color3: "#000000" }
    });

    function animate() {
      requestAnimationFrame(animate);
      scene.render();
    }
    animate();

    // Hero görünür değilken (sayfa aşağı kaydırıldığında) simülasyonu durdur
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => {
          scene.isPaused = !entries[0].isIntersecting;
          if (!scene.isPaused) scene.clock.getDelta();
        },
        { threshold: 0 }
      ).observe(container);
    }

    // Sayfa yüklendikten kısa bir süre sonra yumuşak görünme
    setTimeout(() => container.classList.add("visible"), 600);
  } catch (err) {
    // WebGL/float doku desteklenmiyorsa animasyonsuz devam
    console.warn("Hero partikül animasyonu başlatılamadı:", err);
  }
}
