// "Bizi kampüste bul" bölümü — morph partikül animasyonu.
// Bölümün tamamına yayılmış partiküller; bölüme fare gelince (dokunmatikte
// bölüm görünür olunca) VT logosunun şekline toplanır. Logo şekli
// logo-white.png'nin alfa kanalından örneklenir. Hero animasyonuyla aynı
// görsel dil: kapsül şekilli noktalar, VT kırmızısı palet.
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

// Görselin alfa kanalından hedef noktalar örnekle (logo-space: x ±ar/2, y ±0.5)
async function sampleImageTargets(url, maxSamples) {
  const img = await new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = url;
  });
  const gw = 160;
  const gh = Math.round((gw * img.height) / img.width);
  const cv = document.createElement("canvas");
  cv.width = gw;
  cv.height = gh;
  const ctx = cv.getContext("2d");
  ctx.drawImage(img, 0, 0, gw, gh);
  const data = ctx.getImageData(0, 0, gw, gh).data;
  const ar = img.width / img.height;
  const pts = [];
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      if (data[(y * gw + x) * 4 + 3] > 100) {
        pts.push([(x / gw - 0.5) * ar, -(y / gh - 0.5)]);
      }
    }
  }
  // Karıştır ve gerekirse tekrar kullan
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  const out = [];
  for (let i = 0; i < maxSamples; i++) out.push(pts[i % pts.length]);
  return out;
}

class MorphParticles {
  constructor({ container, hoverTarget, morphAnchor, image, colors, count = 5000 }) {
    this.container = container;
    this.hoverTarget = hoverTarget;
    this.morphAnchor = morphAnchor;
    this.count = count;
    this.colors = colors;
    this.morph = 0;
    this.morphGoal = 0;
    this.isPaused = false;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.canvas = document.createElement("canvas");
    container.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false
    });
    this.renderer.setPixelRatio(this.pixelRatio);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;
    this.clock = new THREE.Clock();

    sampleImageTargets(image, count).then((targets) => {
      this.buildPoints(targets);
      this.resize();
      this.bindEvents();
      this.animate();
      requestAnimationFrame(() => container.classList.add("visible"));
    });
  }

  buildPoints(targets) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const homes = new Float32Array(this.count * 2);
    const targ = new Float32Array(this.count * 2);
    const seeds = new Float32Array(this.count * 4);
    for (let i = 0; i < this.count; i++) {
      // Ev konumu: bölümün tamamına yayıl (normalize -0.5..0.5)
      homes[i * 2] = Math.random() - 0.5;
      homes[i * 2 + 1] = Math.random() - 0.5;
      targ[i * 2] = targets[i][0];
      targ[i * 2 + 1] = targets[i][1];
      for (let k = 0; k < 4; k++) seeds[i * 4 + k] = Math.random();
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aHome", new THREE.BufferAttribute(homes, 2));
    geo.setAttribute("aTarget", new THREE.BufferAttribute(targ, 2));
    geo.setAttribute("seeds", new THREE.BufferAttribute(seeds, 4));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uRez: { value: new THREE.Vector2(1, 1) },
        uLogoCenter: { value: new THREE.Vector2(0, 0) },
        uLogoScale: { value: 200 },
        uPixelRatio: { value: this.pixelRatio },
        uColor1: { value: new THREE.Color(this.colors.color1) },
        uColor2: { value: new THREE.Color(this.colors.color2) },
        uColor3: { value: new THREE.Color(this.colors.color3) }
      },
      vertexShader: /* glsl */ `
        precision highp float;
        attribute vec2 aHome;
        attribute vec2 aTarget;
        attribute vec4 seeds;

        uniform float uTime;
        uniform float uMorph;
        uniform vec2 uRez;
        uniform vec2 uLogoCenter;
        uniform float uLogoScale;
        uniform float uPixelRatio;

        varying vec4 vSeeds;
        varying vec2 vLocalPos;
        varying float vMix;

        ${NOISE_GLSL}

        void main() {
          vSeeds = seeds;

          // Boşta gezinme: yumuşak noise sürüklenmesi (piksel cinsinden)
          float t = uTime * 0.25;
          vec2 drift = vec2(
            snoise(vec3(aHome * 3.0 + vec2(12.9, 78.2), t)),
            snoise(vec3(aHome * 3.0 + vec2(93.9, 67.3), t))
          ) * 26.0;

          vec2 home = aHome * uRez + drift;

          // Logo hedefi: hafif titreşimle
          vec2 jitter = vec2(
            snoise(vec3(aTarget * 8.0 + vec2(5.2, 1.3), t * 1.6)),
            snoise(vec3(aTarget * 8.0 + vec2(9.1, 3.7), t * 1.6))
          ) * 2.5;
          vec2 target = uLogoCenter + aTarget * uLogoScale + jitter;

          // Kademeli morph: her partikül kendi gecikmesiyle katılır
          float m = clamp((uMorph - seeds.x * 0.35) / 0.65, 0.0, 1.0);
          m = m * m * (3.0 - 2.0 * m);
          vMix = m;

          vec2 pos = mix(home, target, m);

          gl_Position = vec4(pos / (uRez * 0.5), 0.0, 1.0);

          float size = mix(4.0 + seeds.y * 5.0, 3.5 + seeds.y * 2.5, m);
          gl_PointSize = size * uPixelRatio;
          vLocalPos = pos / uRez;
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;

        varying vec4 vSeeds;
        varying vec2 vLocalPos;
        varying float vMix;

        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform float uTime;

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
          return mat2(c, s, -s, c) * v;
        }

        void main() {
          float noiseAngle = snoise(vec3(vLocalPos * 10.0 + vec2(18.49, 72.97), uTime * 0.85));
          float noiseColor = snoise(vec3(vLocalPos * 2.0 + vec2(74.66, 91.55), uTime * 0.5));
          noiseColor = (noiseColor + 1.0) * 0.5;

          vec2 uv = gl_PointCoord.xy - 0.5;
          uv.y *= -1.0;
          // Şekle toplandıkça kapsüller yatay hizaya döner
          uv = rotate(uv, (noiseAngle * 3.14) * (1.0 - vMix * 0.8));

          float h = 0.8;
          float progress = smoothstep(0.0, 0.75, pow(noiseColor, 2.0));
          vec3 color = mix(mix(uColor1, uColor2, progress/h), mix(uColor2, uColor3, (progress - h)/(1.0 - h)), step(h, progress));

          // Toplanınca renk kararmasın: siyaha kayan ucu kıs
          color = mix(color, mix(uColor1, uColor2, progress), vMix * 0.85);

          float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(.25));
          rounded = smoothstep(0.1, 0.0, rounded);

          // Boşta yalnızca partiküllerin ~%20'si seçilir (sakin zemin);
          // şekillenirken hepsi belirginleşir
          float idleA = step(0.8, vSeeds.z) * (0.25 + vSeeds.w * 0.35);
          float a = rounded * mix(idleA, 0.8 + vSeeds.w * 0.2, vMix);
          if (a < 0.01) { discard; }

          gl_FragColor = vec4(clamp(color, 0.0, 1.0), clamp(a, 0.0, 1.0));
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    this.points = new THREE.Points(geo, this.material);
    this.scene.add(this.points);
  }

  resize() {
    const w = this.container.offsetWidth;
    const h = this.container.offsetHeight;
    this.renderer.setSize(w, h);
    this.material.uniforms.uRez.value.set(w, h);

    // Logo konumu: morphAnchor elemanının merkezine, yoksa bölüm ortasına
    let cx = 0;
    let cy = 0;
    let scale = Math.min(h * 0.5, 280);
    if (this.morphAnchor && this.morphAnchor.offsetParent !== null) {
      const a = this.morphAnchor.getBoundingClientRect();
      const c = this.container.getBoundingClientRect();
      cx = a.left + a.width / 2 - (c.left + c.width / 2);
      cy = -(a.top + a.height / 2 - (c.top + c.height / 2));
      scale = Math.min(a.height * 0.7, a.width * 0.42, 300);
    }
    this.material.uniforms.uLogoCenter.value.set(cx, cy);
    this.material.uniforms.uLogoScale.value = scale;
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize());

    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) {
      this.hoverTarget.addEventListener("pointerenter", () => (this.morphGoal = 1));
      this.hoverTarget.addEventListener("pointerleave", () => (this.morphGoal = 0));
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => {
          const visible = entries[0].isIntersecting;
          this.isPaused = !visible;
          // Dokunmatik cihazlarda: bölümün büyük kısmı görünene kadar bekle,
          // sonra kısa bir gecikmeyle şekillen — dağınık hal önce algılansın
          if (!canHover) {
            clearTimeout(this.touchMorphTimer);
            if (visible) {
              this.touchMorphTimer = setTimeout(() => (this.morphGoal = 1), 900);
            } else {
              this.morphGoal = 0;
            }
          }
          if (visible) this.clock.getDelta();
        },
        { threshold: canHover ? 0.35 : 0.55 }
      ).observe(this.container);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.isPaused) return;
    this.morph += (this.morphGoal - this.morph) * 0.035;
    this.material.uniforms.uMorph.value = this.morph;
    this.material.uniforms.uTime.value = this.clock.getElapsedTime();
    this.renderer.render(this.scene, this.camera);
  }
}

// ---------- Başlat ----------

const container = document.getElementById("campusParticles");
const section = document.getElementById("campusSection");
const anchor = document.getElementById("campusMorphZone");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (container && section && !reduceMotion) {
  try {
    new MorphParticles({
      container,
      hoverTarget: section,
      morphAnchor: anchor,
      image: "/img/odtuvt/logo-mark-white.png",
      colors: { color1: "#ff5063", color2: "#a6192e", color3: "#000000" }
    });
  } catch (err) {
    console.warn("Kampüs morph animasyonu başlatılamadı:", err);
  }
}
