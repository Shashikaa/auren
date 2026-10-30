// All motion is derived from document position; reversing the scroll reverses the scenes.
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const mix = (a, b, t) => a + (b - a) * t;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktop = matchMedia("(min-width: 1024px)").matches;
const mobile = matchMedia("(max-width: 1023px)").matches;
const data = await fetch("content.json").then((r) => r.json());
const asset = (alt) => "assets/" + data.images.find((x) => x.alt === alt)?.file;
const heroVideo = $("#hero-video"),
  introVideo = $("#intro-video");
let entered = false,
  heroComplete = false,
  openingStart = 0;

// Content is separate from the animation engine, so client copy and assets can be replaced.
$(".image-trail").innerHTML = data.images
  .filter((x) => /216x270/.test(x.file))
  .map((x, i) => `<img src="assets/${x.file}" alt="" data-index="${i}">`)
  .join("");
const logoMarkup = data.images
  .filter((x) => /Logo$/.test(x.alt))
  .map((x) => `<img src="assets/${x.file}" alt="${x.alt}" loading="lazy">`)
  .join("");
$(".logo-belt").innerHTML = logoMarkup + logoMarkup;
$(".principles").insertAdjacentHTML(
  "afterbegin",
  '<div class="principle-backgrounds" aria-hidden="true"><div class="bg-sticky">' +
    data.principles
      .map((x) => `<img src="assets/${x.image}" alt="">`)
      .join("") +
    "</div></div>",
);
$(".principle-images").innerHTML = data.principles
  .map(
    (x) =>
      `<picture><img src="assets/${x.image}" alt="${x.heading}" loading="lazy"></picture>`,
  )
  .join("");
$(".principle-copy").innerHTML = data.principles
  .map(
    (x, i) =>
      `<article><div class="principle-content"><em>0${i + 1} / 03</em><picture class="principle-mobile-frame"><img class="principle-mobile-photo" src="assets/${x.image}" alt="${x.heading}" loading="lazy"></picture><div class="principle-text"><h3 class="reveal">${x.heading}</h3><p>${x.description}</p></div><a class="button" href="#contact">Begin Your Build <span>↗</span></a></div></article>`,
  )
  .join("");
const services = [
  [
    "Bodystyling",
    "Bodywork",
    "Refine the silhouette with carefully chosen aero elements, carbon detailing and exterior finishes. A confident presence, balanced with the lines that make your vehicle distinctive.",
  ],
  [
    "Interior",
    "Interior",
    "Create a cabin that feels unmistakably yours. Explore leather, stitching, trim and tactile finishes, brought together with comfort and everyday use in mind.",
  ],
  [
    "Wheels",
    "Wheels",
    "Find the right relationship between wheel, body and road. Finishes, fitment and proportions are selected to bring the complete design into balance.",
  ],
  [
    "Lighting",
    "Lighting",
    "Shape a different expression through light. Considered illumination and subtle finishing details bring a new dimension to the vehicle, inside and out.",
  ],
  [
    "Exhaust",
    "Exhaust",
    "Define a sound that suits the drive. We consider character, response and refinement together, choosing an upgrade that complements your vehicle.",
  ],
  [
    "Protection",
    "Wraps / PPF",
    "Protect the surfaces you value. Explore protective films, alternative finishes and colour possibilities, selected around how you use and care for your vehicle.",
  ],
];
const serviceImages = services.map(([name, key]) => ({
  name,
  src: asset("Auren Service: " + key),
}));
$(".services").innerHTML =
  `<div class="service-texture" aria-hidden="true"></div><div class="service-layout"><div class="service-list">${services.map(([name, key, desc], i) => `<article class="service" data-index="${i}"><div class="service-mobile-visual"><img src="${serviceImages[i].src}" alt="${name} detail" loading="lazy"></div><div class="service-copy"><div class="service-heading"><p class="micro">Service</p><h3 class="reveal">${name}</h3></div><p>${desc}</p><a class="button" href="#contact">Begin Your Build <span>↗</span></a></div></article>`).join("")}</div><aside class="service-stage" aria-hidden="true"><div class="service-pin">${serviceImages.map((im, i) => `<picture class="service-visual" data-index="${i}"><img src="${im.src}" alt="" loading="${i === 0 ? "eager" : "lazy"}"></picture>`).join("")}</div></aside></div>`;

// Native WebGL depth displacement. A flat colour image and a depth image create
// perspective movement without loading a heavy real-time vehicle model.
class DepthScene {
  constructor(
    canvas,
    colour,
    depth,
    { heat = 0, strength = 0.003, lighting = 0 } = {},
  ) {
    this.canvas = canvas;
    this.heat = heat;
    this.strength = strength;
    this.lighting = lighting;
    this.spot = 0;
    this.spotTarget = 0;
    this.ready = false;
    this.pointer = { x: 0, y: 0 };
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      canvas.dataset.renderState = "unavailable";
      return;
    }
    canvas.dataset.renderState = "initializing";
    this.gl = gl;
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(s));
      return s;
    };
    try {
      const program = gl.createProgram();
      gl.attachShader(
        program,
        compile(
          gl.VERTEX_SHADER,
          `attribute vec2 p; varying vec2 uv; void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`,
        ),
      );
      gl.attachShader(
        program,
        compile(
          gl.FRAGMENT_SHADER,
          `precision mediump float;
    varying vec2 uv; uniform sampler2D colour; uniform sampler2D depth;
    uniform vec2 cover;uniform vec2 pointer;uniform float time;uniform float heat;uniform float strength;uniform float lighting;uniform float aspect;uniform float spot;
    void main(){vec2 q=(uv-.5)*cover+.5;float d=texture2D(depth,q).r;
     float b=(texture2D(depth,q+vec2(.003,0.)).r+texture2D(depth,q-vec2(.003,0.)).r+texture2D(depth,q+vec2(0.,.003)).r+texture2D(depth,q-vec2(0.,.003)).r+d*4.)/8.;
     q+=pointer*(b-.5)*strength;
     float haze=sin(q.y*35.-time*2.2)*sin(q.y*19.+time*1.3);
     q.x+=haze*.0035*heat*smoothstep(.95,.05,q.y);
     vec3 col=texture2D(colour,clamp(q,.001,.999)).rgb;vec2 mouse=pointer*.5+.5;float dist=length((uv-mouse)*vec2(aspect,1.));float att=pow(clamp(1.-dist/1.05,0.,1.),2.);float caught=mix(1.,smoothstep(0.,.85,b),.55);float light=.16+1.9*att*caught;col*=mix(1.,light,spot*lighting);col/=1.+.15*spot*lighting*col;gl_FragColor=vec4(col,1.);}`,
        ),
      );
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        canvas.dataset.renderState = "link-error";
        canvas.dataset.renderError = gl.getProgramInfoLog(program);
        return;
      }
      this.program = program;
      gl.useProgram(program);
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const pos = gl.getAttribLocation(program, "p");
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
      this.u = Object.fromEntries(
        [
          "colour",
          "depth",
          "cover",
          "pointer",
          "time",
          "heat",
          "strength",
          "lighting",
          "aspect",
          "spot",
        ].map((k) => [k, gl.getUniformLocation(program, k)]),
      );
      const load = (src) =>
        new Promise((resolve, reject) => {
          const im = new Image();
          im.onload = () => resolve(im);
          im.onerror = reject;
          im.src = src;
        });
      Promise.all([load(colour), load(depth || colour)])
        .then((images) => {
          this.ratio = images[0].width / images[0].height;
          images.forEach((im, i) => {
            gl.activeTexture(gl.TEXTURE0 + i);
            const t = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, t);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(
              gl.TEXTURE_2D,
              gl.TEXTURE_WRAP_S,
              gl.CLAMP_TO_EDGE,
            );
            gl.texParameteri(
              gl.TEXTURE_2D,
              gl.TEXTURE_WRAP_T,
              gl.CLAMP_TO_EDGE,
            );
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGB,
              gl.RGB,
              gl.UNSIGNED_BYTE,
              im,
            );
          });
          gl.uniform1i(this.u.colour, 0);
          gl.uniform1i(this.u.depth, 1);
          this.ready = true;
          canvas.dataset.renderState = "ready";
          canvas.style.opacity = 1;
        })
        .catch(() => {
          canvas.dataset.renderState = "image-error";
          canvas.style.display = "none";
        });
      canvas.addEventListener("webglcontextlost", (e) => {
        e.preventDefault();
        this.ready = false;
        canvas.style.display = "none";
      });
    } catch (error) {
      canvas.dataset.renderState = "shader-error";
      canvas.dataset.renderError = String(error);
      canvas.style.display = "none";
    }
  }
  draw(time, px, py) {
    if (!this.ready) return;
    const c = this.canvas,
      g = this.gl,
      r = c.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const scale = Math.min(devicePixelRatio, 1.5);
    const w = Math.round(r.width * scale),
      h = Math.round(r.height * scale);
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
      g.viewport(0, 0, w, h);
    }
    this.pointer.x = mix(this.pointer.x, reduced ? 0 : px, 0.06);
    this.pointer.y = mix(this.pointer.y, reduced ? 0 : py, 0.06);
    g.useProgram(this.program);
    const aspect = w / h;
    g.uniform2f(
      this.u.cover,
      Math.min(1, aspect / this.ratio),
      Math.min(1, this.ratio / aspect),
    );
    g.uniform2f(this.u.pointer, this.pointer.x, -this.pointer.y);
    g.uniform1f(this.u.time, time / 1000);
    g.uniform1f(this.u.heat, reduced ? 0 : this.heat);
    g.uniform1f(this.u.strength, this.strength);
    this.spot = mix(this.spot, this.spotTarget, 0.045);
    g.uniform1f(this.u.spot, reduced ? 0 : this.spot);
    g.uniform1f(this.u.lighting, this.lighting);
    g.uniform1f(this.u.aspect, w / h);
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
  }
}
if (mobile) {
  $(".hero-fallback").src = "assets/hero-mobile-poster.jpg";
  $(".final-photo").src =
    "assets/cd172e50335c7303fe9e8ca85f952608dd0b0236-880x1592.jpg";
}
const heroDepth = new DepthScene(
  $("#hero-depth"),
  mobile ? "assets/hero-mobile-poster.jpg" : "assets/hero-poster.jpg",
  "assets/depth.webp",
);
const footerDepth = new DepthScene(
  $("#footer-depth"),
  mobile
    ? "assets/cd172e50335c7303fe9e8ca85f952608dd0b0236-880x1592.jpg"
    : "assets/8234f422e53117f9ee574a826d50902f5e4272b5-2880x1800.jpg",
  mobile ? "assets/footer-mobile-depth.png" : "assets/footer-depth.png",
  { strength: 0.025, lighting: 1 },
);

let pointerX = 0,
  pointerY = 0,
  pointerSeen = false;
addEventListener(
  "pointermove",
  (e) => {
    pointerSeen = true;
    pointerX = (e.clientX / innerWidth) * 2 - 1;
    pointerY = (e.clientY / innerHeight) * 2 - 1;
  },
  { passive: true },
);

// Entrance and reveal. The opening is a one-time cinematic; the next sequence scrubs.
function finishHero() {
  heroComplete = true;
  heroVideo.pause();
  heroVideo.style.opacity = 0;
}
function enter(choice) {
  if (entered) return;
  entered = true;
  localStorage.setItem("auren-entrance", choice);
  $(".entrance").classList.add("gone");
  $(".entrance").setAttribute("inert", "");
  document.body.classList.remove("locked");
  openingStart = performance.now();
  if (reduced) {
    finishHero();
    return;
  }
  heroVideo.playbackRate = 2;
  heroVideo.play().catch(finishHero);
}
if (localStorage.getItem("auren-entrance"))
  $(".entrance-actions").innerHTML =
    '<button data-enter="remembered">Enter</button>';
$$("[data-enter]").forEach((b) =>
  b.addEventListener("click", () => enter(b.dataset.enter)),
);
heroVideo.addEventListener("ended", finishHero);
heroVideo.addEventListener("error", finishHero);
// Immediate fallback on unsupported video, without blocking access to the page.
heroVideo.addEventListener("stalled", () => {
  if (entered && performance.now() - openingStart > 5000) finishHero();
});

// Seek only after the previous decode completed. Every frame in the MP4 is a keyframe.
let requestedTime = 0;
function updateSeek() {
  if (
    introVideo.readyState >= 2 &&
    !introVideo.seeking &&
    Math.abs(introVideo.currentTime - requestedTime) > 0.018
  )
    introVideo.currentTime = requestedTime;
}
introVideo.addEventListener("seeked", updateSeek);
introVideo.addEventListener("loadeddata", updateSeek);
function scrubVideo(progress) {
  requestedTime =
    clamp(progress) * Math.max(0, (introVideo.duration || 5.0417) - 0.045);
  updateSeek();
}

let menuOpen = false;
function setMenu(open) {
  menuOpen = open;
  document.body.classList.toggle("menu-open", open);
  document.body.classList.toggle("locked", open || !entered);
  $("#menu-toggle").setAttribute("aria-expanded", String(open));
  $("#menu").inert = !open;
  if (open) {
    heroVideo.pause();
    $("#menu a").focus();
  } else if (entered && !heroComplete) {
    heroVideo.play().catch(finishHero);
  }
}
$("#menu-toggle").addEventListener("click", () => setMenu(!menuOpen));
$$("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) setMenu(false);
});
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      if (a.getAttribute("href") === "#approach") {
        window.scrollTo({
          top: $(".hero-track").offsetTop + innerHeight * 2.4,
          behavior: reduced ? "instant" : "smooth",
        });
      } else {
        target.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
      }
    }
  }),
);
$(".back-top").addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" }),
);
const { setupButtonHovers } = await import("./buttons.js");
setupButtonHovers(reduced);
const { setupHeadingReveals } = await import("./headings.js");
setupHeadingReveals(reduced);
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -25px 0px" },
);
$$(".reveal")
  .filter((el) => !/^H[23]$/.test(el.tagName))
  .forEach((el) => revealObserver.observe(el));

// Lightweight dialogs remain local; no client enquiries are submitted by this preview.
$$(".dialog-close").forEach((b) =>
  b.addEventListener("click", () => b.closest("dialog").close()),
);
$$("dialog").forEach((d) =>
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  }),
);
$("#contact-open").addEventListener("click", () =>
  $("#contact-dialog").showModal(),
);
$("#privacy-open").addEventListener("click", () =>
  $("#privacy-dialog").showModal(),
);
$("#cookie-settings").addEventListener("click", () => {
  setMenu(false);
  $("#privacy-dialog").showModal();
});
$("#reset-preference").addEventListener("click", () => {
  localStorage.removeItem("auren-entrance");
  $("#reset-preference").textContent = "Entrance preference reset";
});
$("#project-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(e.target));
  const text = `PROJECT ENQUIRY\n\nName: ${values.name}\nEmail: ${values.email}\nVehicle: ${values.vehicle}\n\nVision:\n${values.vision}\n`;
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "project-enquiry.txt";
  a.click();
  URL.revokeObjectURL(url);
});
$$("[data-open-collection]").forEach((b) =>
  b.addEventListener("click", () => {
    const stock = b.dataset.openCollection === "stock";
    $("#collection-dialog h2").textContent = stock
      ? "The Collection"
      : "Selected Commissions";
    const items = [
      ["Mercedes G-Wagen", "Mercedes G wagon eagle eye POV"],
      [
        "Porsche GT3 RS",
        "Porsche 992 GT3RS in Red with carbon fibre modifications",
      ],
      ["Land Rover Defender", "Landrover Defender 110"],
    ];
    $(".collection-grid").innerHTML = items
      .map(
        ([name, alt]) =>
          `<article><img src="${asset(alt)}" alt="${name}"><h3>${name}</h3><p>${stock ? "Reference collection — client inventory to be supplied." : "Individual design, from the first sketch to the final finish."}</p><button class="button" data-enquire>Enquire ↗</button></article>`,
      )
      .join("");
    $$("[data-enquire]").forEach((x) =>
      x.addEventListener("click", () => {
        $("#collection-dialog").close();
        $("#contact-dialog").showModal();
      }),
    );
    $("#collection-dialog").showModal();
  }),
);

const { createMotion } = await import("./motion.js");
const motion = createMotion({
  reduced,
  desktop,
  heroVideo,
  introVideo,
  scrubVideo,
  heroDepth,
  footerDepth,
  finishHero,
});
function frame(time) {
  if (
    entered &&
    !menuOpen &&
    !heroComplete &&
    performance.now() - openingStart > 5500
  )
    finishHero();
  motion.render(time, {
    entered,
    heroComplete,
    menuOpen,
    pointerX,
    pointerY,
    pointerSeen,
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
