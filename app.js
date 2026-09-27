import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { createCharacter } from './chonkimals/player.js';
import { SpeechBubbles } from './chonkimals/speech-bubbles.js';

const projects = [
  { group: 'Zynga Hackathon 2026', title: 'Chonkimals', kind: 'chonkimals' },
  { group: 'Words With Friends', title: 'Dice Challenge', kind: 'dice', video: 'https://www.youtube.com/shorts/Y0ORyzqeXgM', embed: 'https://www.youtube.com/embed/Y0ORyzqeXgM?playsinline=1' },
  { group: 'Words With Friends', title: 'Letter Lock', kind: 'letters', image: 'project-letter-lock.png', video: 'https://www.youtube.com/shorts/DIEdCnECGjg', embed: 'https://www.youtube.com/embed/DIEdCnECGjg?playsinline=1' },
  { group: 'Words With Friends', title: 'Gold Word', kind: 'gold', video: 'https://www.instagram.com/reels/DdUcDmelR2F/', embed: 'https://www.instagram.com/reel/DdUcDmelR2F/embed/' },
  { group: 'Words With Friends', title: 'Bonus Pass', kind: 'pass' },
  { group: 'Merge Dragons', title: 'Dragon Breeding', kind: 'breeding', image: 'project-dragon-breeding.png' },
  { group: 'Merge Dragons', title: 'FTUE Revamp', kind: 'ftue', image: 'project-ftue.png' },
  { group: 'Merge Dragons', title: 'Dragon Book', kind: 'book', image: 'project-dragon-book.png' },
];
const lines = [
  ['I measured twice and hopped once.', 'He pays me 15 snacks an hour.', 'We dug a hole. That counts as progress.', 'The site is looking great. Can’t wait for you to see it.', 'We’re working as fast as our little legs can go.'],
  ['I brought some of Joel’s work!', 'The monitor is load-bearing. Probably.', 'I’m one of the references on his résumé.', 'Please enjoy this very official presentation.', 'I’m available for reference checks after my nap.'],
  ['He’s building the portfolio. I’m building morale.', 'Our permit is written in crayon.', 'I’m the site supervisor. I appointed myself.', 'We’re getting this place up and running. Mostly running.'],
];
const audienceLines = ['Ooh, a sneak peek!', 'Is that a hole or a feature?', 'I came for the snacks.', 'Wait, go back one!', 'I would hire him. For snacks.'];
const pokeLines = [
  ['Keep your stinkin’ human paws off me!', 'I am a professional. Please poke professionally.', 'Help. A giant finger has breached the perimeter.'],
  ['The presenter is very ticklish.', 'No touching the talent! Unless you have snacks.', 'That was my dramatic fall. Thank you.'],
  ['Keep your stinkin’ human paws off me!', 'This is a hard hat, not a tap target.', 'I’m reporting this to the snack department.'],
];
const guestPokeLines = ['I just got here!', 'I was told this was a safe viewing area.', 'Hey! I’m part of the audience!'];
const propLines = { hole: ['This is an important hole.', 'The hole has excellent growth potential.'], shovel: ['This is my senior shovel.', 'I put it on my résumé.'], toolbox: ['The toolbox is mostly snacks.', 'Please return all borrowed snacks.'] };
const propCounts = { hole: 0, shovel: 0, toolbox: 0 };
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion');
const autoplayButton = document.querySelector('#autoplay');
const autoplayProgress = document.querySelector('#autoplay-progress');
const announcement = document.querySelector('#announcement');
let paused = reduced.matches;
let autoplay = !reduced.matches;
let projectElapsed = 0;
const PROJECT_DURATION = 7;
let speech, characters = [], audience = [], cart, cartScreen, elapsed = reduced.matches ? 7 : 0, selected = 0, showing = 0;
let slideTexture, slideCanvas, slideContext, chonkimalsImage;
const projectImages = new Map();
function getProjectImage(project) {
  if (!project.image) return null;
  if (!projectImages.has(project.image)) {
    const image = new Image();
    image.onload = () => { if (projects[selected] === project) drawSlide(); };
    image.src = `./assets/${project.image}`;
    projectImages.set(project.image, image);
  }
  const image = projectImages.get(project.image);
  return image.complete && image.naturalWidth ? image : null;
}
function say(key, line) { if (!speech) return; speech.bubbles.forEach(b => { b.age = 10; }); speech.show(key, line); }
const shot = new Image(); shot.src = './assets/chonkimals-preview.png';
shot.onload = () => { chonkimalsImage = shot; drawSlide(); };
document.fonts.load('600 108px Fredoka').then(drawSlide);
const projectButtons = [...document.querySelectorAll('[data-project]')];
const watchClip = document.querySelector('#watch-clip'), clipDialog = document.querySelector('#clip-dialog');
const clipFrame = document.querySelector('#clip-frame'), clipTitle = document.querySelector('#clip-title'), clipSource = document.querySelector('#clip-source');
function openClip() {
  const project = projects[selected]; if (!project.video) return;
  clipTitle.textContent = project.title; clipSource.href = project.video;
  clipSource.textContent = project.video.includes('instagram.com') ? 'Watch on Instagram ↗' : 'Watch on YouTube ↗';
  const frame = document.createElement('iframe');
  frame.title = `${project.title} video preview`; frame.src = project.embed; frame.allow = 'autoplay; encrypted-media; picture-in-picture; web-share'; frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  clipFrame.replaceChildren(frame);
  clipDialog.showModal(); projectElapsed = 0;
}
watchClip.addEventListener('click', openClip);
document.querySelector('#close-clip').addEventListener('click', () => clipDialog.close());
clipDialog.addEventListener('click', event => { if (event.target === clipDialog) clipDialog.close(); });
clipDialog.addEventListener('close', () => clipFrame.replaceChildren());

function updateMotion() {
  motionButton.innerHTML = `${paused ? 'Resume' : 'Pause'} motion <span aria-hidden="true">${paused ? '▷' : 'Ⅱ'}</span>`;
  motionButton.setAttribute('aria-pressed', String(paused));
}
updateMotion();
motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
reduced.addEventListener('change', e => { paused = e.matches; autoplay = !e.matches; if (e.matches) elapsed = Math.max(elapsed, 7); updateMotion(); updateAutoplay(); });
function updateAutoplay() {
  autoplayButton.innerHTML = `<span class="autoplay-icon" aria-hidden="true">${autoplay ? 'Ⅱ' : '▶'}</span> ${autoplay ? 'Pause autoplay' : 'Play autoplay'}`;
  autoplayButton.setAttribute('aria-pressed', String(autoplay));
}
updateAutoplay();
autoplayButton.addEventListener('click', () => { autoplay = !autoplay; projectElapsed = 0; updateAutoplay(); });

function showProject(index, announce = false) {
  projectElapsed = 0;
  selected = (index + projects.length) % projects.length;
  const project = projects[selected];
  document.querySelector('#project-group').textContent = project.group;
  document.querySelector('#project-title').textContent = project.title;
  watchClip.hidden = !project.video;
  document.querySelector('#project-number').textContent = `${String(selected + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
  projectButtons.forEach((button, i) => button.setAttribute('aria-current', String(i === selected)));
  drawSlide();
  if (announce) announcement.textContent = `${project.title}, ${project.group}`;
}
document.querySelector('#previous-project').addEventListener('click', () => showProject(selected - 1, true));
document.querySelector('#next-project').addEventListener('click', () => showProject(selected + 1, true));
projectButtons.forEach((button, i) => button.addEventListener('click', () => showProject(i, true)));
showProject(0);

function drawSlide() {
  if (!slideContext) return;
  const c = slideContext, p = projects[selected], w = slideCanvas.width, h = slideCanvas.height;
  const merge = p.group === 'Merge Dragons';
  c.fillStyle = merge ? '#e7ead2' : '#f1e7cf';
  c.fillRect(0, 0, w, h);
  const projectImage = p.kind === 'chonkimals' ? chonkimalsImage : getProjectImage(p);
  if (projectImage) {
    const image = projectImage, scale = Math.max(w / image.width, h / image.height);
    c.drawImage(image, (w - image.width * scale) / 2, (h - image.height * scale) / 2, image.width * scale, image.height * scale);
    c.fillStyle = 'rgba(39,34,25,.77)'; c.fillRect(0, h - 133, w, 133);
    c.textAlign = 'left'; c.fillStyle = '#fff8e9'; c.font = '600 28px Fredoka, sans-serif'; c.fillText(p.group.toLowerCase(), 43, h - 101);
    c.font = '600 70px Fredoka, sans-serif'; c.fillText(p.title.toLowerCase(), 40, h - 24, w - 80);
    if (p.video) {
      c.fillStyle = '#f2ce5b'; c.beginPath(); c.arc(w - 84, h - 67, 34, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#4b3828'; c.beginPath(); c.moveTo(w - 93, h - 86); c.lineTo(w - 93, h - 48); c.lineTo(w - 62, h - 67); c.closePath(); c.fill();
    }
  } else {
    const ink = merge ? '#355646' : '#49362c', accent = merge ? '#77945d' : '#b87149';
    c.strokeStyle = accent; c.lineWidth = 4; c.setLineDash([7, 12]);
    c.strokeRect(22, 22, w - 44, h - 44); c.setLineDash([]);
    c.fillStyle = ink; c.textAlign = 'left';
    c.font = '600 39px Fredoka, sans-serif'; c.fillText(p.group.toLowerCase(), 67, 110);
    c.font = '600 26px Fredoka, sans-serif'; c.textAlign = 'right'; c.fillText(`${String(selected + 1).padStart(2, '0')} / 08`, w - 68, 108);
    const words = p.title.toLowerCase().split(' '), split = p.title.length > 14;
    const titleLines = split ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [p.title.toLowerCase()];
    const titleSize = titleLines.some(line => line.length > 13) ? 108 : 135;
    c.font = `600 ${titleSize}px Fredoka, sans-serif`;
    c.textAlign = 'center';
    const startY = titleLines.length === 1 ? 365 : 300;
    titleLines.forEach((line, i) => c.fillText(line, w / 2, startY + i * 125, w - 130));
    c.beginPath(); c.moveTo(285, 492); c.bezierCurveTo(440, 522, 600, 476, 739, 500); c.strokeStyle = accent; c.lineWidth = 10; c.lineCap = 'round'; c.stroke();
    c.font = '500 26px Fredoka, sans-serif'; c.fillStyle = accent; c.fillText(p.video ? 'press the screen to watch the clip' : 'a little look at joel’s work', w / 2, 572);
  }
  if (slideTexture) slideTexture.needsUpdate = true;
}

function makeHardHat() {
  const yellow = new THREE.MeshStandardMaterial({ color: 0xf6be37, roughness: .52 });
  const orange = new THREE.MeshStandardMaterial({ color: 0xdc8522, roughness: .6 });
  const hat = new THREE.Group();
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(.49, .54, .08, 32), yellow); brim.castShadow = true; hat.add(brim);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(.43, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), yellow); dome.position.y = .035; dome.castShadow = true; hat.add(dome);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(.10, .30, .70), orange); stripe.position.y = .29; hat.add(stripe);
  const bill = new THREE.Mesh(new THREE.BoxGeometry(.75, .06, .13), yellow); bill.position.set(0, -.015, .32); bill.castShadow = true; hat.add(bill);
  return hat;
}

function makeWorksite(scene) {
  const orange = new THREE.MeshStandardMaterial({ color: 0xe39a35, roughness: .82 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x54483d, roughness: .9 });
  const pale = new THREE.MeshStandardMaterial({ color: 0xfff7df, roughness: .85 });
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 64;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#f5bf45'; ctx.fillRect(0, 0, 512, 64); ctx.fillStyle = '#564438';
  for (let x = -64; x < 576; x += 70) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 28, 0); ctx.lineTo(x + 94, 64); ctx.lineTo(x + 66, 64); ctx.closePath(); ctx.fill(); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const tape = new THREE.Mesh(new THREE.PlaneGeometry(1, .26), new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, roughness: .9 })); tape.position.set(0, 1.27, -2.4); scene.add(tape);
  const posts = [], cones = [];
  for (const side of [-1, 1]) {
    const post = new THREE.Group(); post.position.z = -2.4;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.065, .09, 1.6, 12), dark); pole.position.y = .8; pole.castShadow = true; post.add(pole);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.105, 12, 8), orange); cap.position.y = 1.6; post.add(cap); scene.add(post); posts.push(post);
    const cone = new THREE.Group(); cone.position.z = 1.6;
    const base = new THREE.Mesh(new THREE.BoxGeometry(.67, .08, .67), dark); base.position.y = .04; cone.add(base);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.045, .28, .65, 20), orange); body.position.y = .39; cone.add(body);
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(.13, .18, .125, 20), pale); stripe.position.y = .42; cone.add(stripe); scene.add(cone); cones.push(cone);
  }
  const soil = new THREE.MeshStandardMaterial({ color: 0x704b32, roughness: 1, side: THREE.DoubleSide });
  const looseSoil = new THREE.MeshStandardMaterial({ color: 0xad8054, roughness: 1, side: THREE.DoubleSide });
  const clay = new THREE.MeshStandardMaterial({ color: 0xc19663, roughness: 1 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x9b6940, roughness: .94 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x87918c, metalness: .25, roughness: .65 });
  const caseMat = new THREE.MeshStandardMaterial({ color: 0xb76842, roughness: .82 });
  const holes = [];
  for (let i = 0; i < 2; i++) {
    const hole = new THREE.Group(); hole.position.z = 2.45; scene.add(hole); holes.push(hole);
    const middle = new THREE.Mesh(new THREE.CircleGeometry(.62, 32), soil); middle.rotation.x = -Math.PI / 2; middle.scale.set(1.35, .74, 1); middle.position.y = .009; hole.add(middle);
    const rim = new THREE.Mesh(new THREE.RingGeometry(.55, .85, 32), looseSoil); rim.rotation.x = -Math.PI / 2; rim.scale.set(1.35, .74, 1); rim.position.y = .013; hole.add(rim);
    for (let j = 0; j < 7; j++) {
      const angle = (j / 7) * Math.PI * 2 + i * .4;
      const clod = new THREE.Mesh(new THREE.SphereGeometry(.17 + (j % 3) * .035, 10, 8), j % 2 ? clay : looseSoil);
      clod.scale.set(1.1, .38, .72); clod.position.set(Math.cos(angle) * .94, .055, Math.sin(angle) * .55); clod.castShadow = true; hole.add(clod);
    }
  }
  const shovel = new THREE.Group(); shovel.position.z = 2.25; shovel.rotation.z = -.14; scene.add(shovel);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.045, .055, 1.42, 10), wood); shaft.position.y = .98; shaft.castShadow = true; shovel.add(shaft);
  const blade = new THREE.Mesh(new THREE.SphereGeometry(.25, 14, 10), steel); blade.scale.set(.7, 1.1, .18); blade.position.y = .22; blade.castShadow = true; shovel.add(blade);
  const grip = new THREE.Mesh(new THREE.TorusGeometry(.17, .04, 8, 20), wood); grip.position.y = 1.75; grip.castShadow = true; shovel.add(grip);
  const toolbox = new THREE.Group(); toolbox.position.z = 2.6; scene.add(toolbox);
  const boxBody = new THREE.Mesh(new THREE.BoxGeometry(.9, .42, .48), caseMat); boxBody.position.y = .26; boxBody.castShadow = true; toolbox.add(boxBody);
  const boxLid = new THREE.Mesh(new THREE.BoxGeometry(.96, .13, .52), dark); boxLid.position.y = .53; boxLid.castShadow = true; toolbox.add(boxLid);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.18, .045, 8, 18, Math.PI), steel); handle.position.y = .66; handle.rotation.z = Math.PI; toolbox.add(handle);
  const latch = new THREE.Mesh(new THREE.BoxGeometry(.11, .1, .025), pale); latch.position.set(0, .44, .275); toolbox.add(latch);
  const pulses = { shovel: -Infinity, toolbox: -Infinity };
  let span = 12;
  return {
    resize(mobile, compact) {
      span = mobile ? 8 : compact ? 10.4 : 12; posts[0].position.x = -span / 2; posts[1].position.x = span / 2;
      cones[0].position.x = mobile ? -3.8 : compact ? -4.8 : -5.5; cones[1].position.x = -cones[0].position.x;
      const spread = mobile ? 2.5 : compact ? 3.25 : 3.85;
      holes[0].position.x = -spread; holes[1].position.x = spread;
      holes.forEach(hole => { hole.position.z = mobile ? 2.45 : 1.55; });
      shovel.position.x = -spread - .4; toolbox.position.x = spread + .5;
      shovel.position.z = mobile ? 2.25 : 1.45; toolbox.position.z = mobile ? 2.6 : 1.7;
    },
    hit(raycaster) {
      if (holes.some(hole => raycaster.intersectObject(hole, true).length)) return 'hole';
      if (raycaster.intersectObject(shovel, true).length) return 'shovel';
      if (raycaster.intersectObject(toolbox, true).length) return 'toolbox';
      return null;
    },
    bump(type, t) { if (type in pulses) pulses[type] = t; },
    update(t) {
      const progress = Math.max(.001, Math.min(1, (t - .25) / 3.2)); tape.scale.x = span * progress; tape.position.x = -span / 2 + span * progress / 2; tape.rotation.z = Math.sin(t * 1.4) * .006 * progress;
      const sway = type => { const age = t - pulses[type]; return age >= 0 && age < 1 ? Math.sin(age * 22) * (1 - age) * .19 : 0; };
      shovel.rotation.z = -.14 + sway('shovel'); toolbox.rotation.z = sway('toolbox');
    }
  };
}

function makeTrapHole(scene) {
  const group = new THREE.Group(); group.position.set(0, .025, 1.45); group.visible = false; scene.add(group);
  const pit = new THREE.Mesh(new THREE.CircleGeometry(2.35, 64), new THREE.MeshBasicMaterial({ color: 0x251c19, side: THREE.DoubleSide }));
  pit.rotation.x = -Math.PI / 2; pit.position.y = .003; pit.scale.set(1.15, .75, 1); group.add(pit);
  const rim = new THREE.Mesh(new THREE.RingGeometry(2.27, 2.75, 64), new THREE.MeshStandardMaterial({ color: 0x9c6e46, roughness: 1, side: THREE.DoubleSide }));
  rim.rotation.x = -Math.PI / 2; rim.position.y = .012; rim.scale.set(1.15, .75, 1); group.add(rim);
  const lip = new THREE.Mesh(new THREE.RingGeometry(2.15, 2.3, 64), new THREE.MeshStandardMaterial({ color: 0x5e3a2a, roughness: 1, side: THREE.DoubleSide }));
  lip.rotation.x = -Math.PI / 2; lip.position.y = .017; lip.scale.set(1.15, .75, 1); group.add(lip);
  for (let i = 0; i < 15; i++) {
    const angle = i / 15 * Math.PI * 2, clod = new THREE.Mesh(new THREE.DodecahedronGeometry(.15 + i % 3 * .045, 0), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xb4895b : 0x80583c, roughness: 1 }));
    clod.scale.y = .45; clod.position.set(Math.cos(angle) * 2.97, .035, Math.sin(angle) * 2.08); group.add(clod);
  }
  return {
    update(age, mobile) {
      const opening = Math.min(1, Math.max(0, age / .6));
      const closing = Math.min(1, Math.max(0, (12.2 - age) / .7));
      const size = Math.max(0, Math.min(opening, closing));
      group.visible = size > .01;
      group.scale.setScalar(size);
      group.position.z = mobile ? 2.1 : 1.45;
    },
    hide() { group.visible = false; }
  };
}

function makeCart(scene) {
  slideCanvas = document.createElement('canvas'); slideCanvas.width = 1024; slideCanvas.height = 640; slideContext = slideCanvas.getContext('2d');
  slideTexture = new THREE.CanvasTexture(slideCanvas); slideTexture.colorSpace = THREE.SRGBColorSpace; drawSlide();
  const frame = new THREE.MeshStandardMaterial({ color: 0x574337, roughness: .7 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xd59c52, roughness: .65 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x37302a, roughness: .88 });
  const group = new THREE.Group(); group.position.set(12, 0, -4.4); scene.add(group);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(9.4, 5.7, .25), frame); panel.position.y = 4.45; panel.castShadow = true; group.add(panel);
  const border = new THREE.Mesh(new THREE.BoxGeometry(9.16, 5.46, .03), edge); border.position.set(0, 4.45, .145); group.add(border);
  cartScreen = new THREE.Mesh(new THREE.PlaneGeometry(8.96, 5.28), new THREE.MeshBasicMaterial({ map: slideTexture, toneMapped: false })); cartScreen.position.set(0, 4.45, .165); group.add(cartScreen);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(.18, 1.55, .18), frame); stand.position.y = .9; stand.castShadow = true; group.add(stand);
  const base = new THREE.Mesh(new THREE.BoxGeometry(8.3, .15, .28), frame); base.position.y = .14; base.castShadow = true; group.add(base);
  for (const x of [-3.86, 3.86]) { const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .14, 20), wheelMat); wheel.rotation.x = Math.PI / 2; wheel.position.set(x, .21, .23); group.add(wheel); }
  return group;
}

async function init() {
  const host = document.querySelector('#stage');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(29, 1, .1, 60);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0xf7f3e9, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  host.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xfffcf0, 0xc2b4a3, 2.7));
  const sun = new THREE.DirectionalLight(0xfff3dc, 3.6); sun.position.set(-3, 7, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 }); sun.shadow.bias = -.0005; sun.shadow.normalBias = .04; sun.shadow.radius = 5; scene.add(sun);
  const fill = new THREE.DirectionalLight(0xddeaff, 1.5); fill.position.set(4, 3, -2); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: .14 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -.02; floor.receiveShadow = true; scene.add(floor);
  const worksite = makeWorksite(scene), trapHole = makeTrapHole(scene); cart = makeCart(scene);
  const dangerButton = document.querySelector('#danger-button'), dangerText = dangerButton.querySelector('.danger-text'), voiceLayer = document.querySelector('#hole-voices');
  const holeEvent = { active: false, started: 0 };
  const holeLines = ['It said not to press!', 'Do you not believe in Chonkimal rights?', 'Ouch.', 'This was not in the risk assessment.', 'Tell Joel we tried.'];
  dangerButton.addEventListener('click', () => {
    if (holeEvent.active) return;
    elapsed = Math.max(elapsed, 7);
    holeEvent.active = true; holeEvent.started = performance.now();
    dangerButton.disabled = true; dangerButton.classList.add('is-pressed'); dangerText.textContent = 'TOO LATE';
    voiceLayer.replaceChildren();
    holeLines.forEach((line, i) => {
      const bubble = document.createElement('div'); bubble.className = 'hole-voice'; bubble.textContent = line;
      bubble.style.setProperty('--delay', `${.55 + i * 1.75}s`);
      bubble.style.setProperty('--dx', `${host.clientWidth * [-.3, .27, -.13, .24, 0][i]}px`);
      bubble.style.setProperty('--dy', `${-host.clientHeight * [.43, .55, .35, .48, .62][i]}px`);
      bubble.style.setProperty('--tilt', `${[-13, 11, -7, 8, -2][i]}deg`);
      voiceLayer.appendChild(bubble);
    });
    speech.bubbles.forEach(bubble => { bubble.age = 10; }); speech.setVisible(false);
    announcement.textContent = 'You pressed the button. The worksite opened beneath the Chonkimals.';
  });
  const loader = new GLTFLoader(); speech = new SpeechBubbles(document.querySelector('.playground'));
  const gltfs = await Promise.all(['frog', 'bear', 'dog'].map(name => loader.loadAsync(`./assets/${name}.glb`)));
  for (const gltf of gltfs) for (const clip of gltf.animations) for (const track of clip.tracks) {
    if (!track.name.endsWith('.position')) continue; const v = track.values, [x, y, z] = v;
    for (let j = 0; j < v.length; j += 3) { v[j] = x; v[j + 1] = y; v[j + 2] = z; }
  }
  characters = gltfs.map((gltf, index) => {
    const actor = createCharacter(gltf, { lod: false }); actor.root.scale.setScalar(2.4 / actor.height); actor.update(1, 'idle'); actor.root.updateMatrixWorld(true); actor.root.position.y -= new THREE.Box3().setFromObject(actor.root, true).min.y;
    const root = new THREE.Group(); root.add(actor.root); scene.add(root);
    const headTop = index !== 1 ? actor.root.getObjectByName('mixamorigHeadTop_End') : null;
    const hat = headTop ? makeHardHat() : null; if (hat) root.add(hat);
    return { root, actor, headTop, hat, hopTime: 1.3 + index * .6, hasJump: gltf.animations.some(c => c.name === 'jumping_up'), reaction: 2, reactionKind: 'hover', lastReaction: -Infinity, lastClick: -Infinity, said: 0, pokes: 0 };
  });
  const skins = await Promise.all(['raccoon', 'fox', 'shiba'].map(name => new THREE.TextureLoader().loadAsync(`./assets/skins/dog_${name}.jpg`)));
  audience = skins.map((texture, index) => {
    texture.flipY = false; texture.colorSpace = THREE.SRGBColorSpace;
    const actor = createCharacter(gltfs[2], { lod: false }); actor.root.scale.setScalar(1.25 / actor.height);
    actor.root.traverse(node => { if (!node.isMesh) return; const material = node.material.clone(); material.map = texture; node.material = material; });
    actor.update(1, 'idle'); actor.root.updateMatrixWorld(true); actor.root.position.y -= new THREE.Box3().setFromObject(actor.root, true).min.y;
    const root = new THREE.Group(); root.add(actor.root); scene.add(root);
    return { root, actor, index, arrived: false, reaction: 2, lastReaction: -Infinity, lastClick: -Infinity, pokes: 0 };
  });
  document.querySelector('#loading').hidden = true; dangerButton.hidden = false;
  let mobile = false, compact = false;
  function resize() {
    const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; mobile = w < 900; compact = w < 1100;
    cart.scale.setScalar(mobile ? .86 : 1);
    camera.position.set(0, mobile ? 4.4 : 5.0, mobile ? 20.8 : 14.5); camera.lookAt(0, mobile ? 1.6 : 3.2, 0); camera.updateProjectionMatrix(); worksite.resize(mobile, compact);
  }
  new ResizeObserver(resize).observe(host); resize();
  say('0', lines[0][0]);
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  function hit(event) { const r = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - r.left) / r.width * 2 - 1, -(event.clientY - r.top) / r.height * 2 + 1); raycaster.setFromCamera(pointer, camera); const main = characters.findIndex(c => raycaster.intersectObject(c.root, true).length); if (main >= 0) return { type: 'main', index: main }; const guest = audience.findIndex(c => raycaster.intersectObject(c.root, true).length); if (guest >= 0) return { type: 'guest', index: guest }; const prop = worksite.hit(raycaster); if (prop) return { type: 'prop', name: prop }; if (cartScreen && raycaster.intersectObject(cartScreen).length) return { type: 'screen' }; return null; }
  function react(target, announce = false) {
    if (holeEvent.active) return;
    if (!target) return; if (target.type === 'screen') { if (announce && projects[selected].video) openClip(); else if (announce) showProject(selected + 1, true); return; }
    if (target.type === 'prop') { const name = target.name, choices = propLines[name], line = choices[propCounts[name]++ % choices.length]; say(name === 'toolbox' ? '2' : '0', line); worksite.bump(name, elapsed); if (announce) announcement.textContent = line; return; }
    if (target.type === 'guest') {
      const c = audience[target.index], now = performance.now();
      if (announce ? now - c.lastClick < 450 : now - c.lastReaction < 1800) return;
      c.lastReaction = now; c.reaction = 0;
      const line = announce ? guestPokeLines[c.pokes++ % guestPokeLines.length] : audienceLines[(target.index + showing++) % audienceLines.length];
      if (announce) c.lastClick = now;
      say(`guest-${target.index}`, line); if (announce) announcement.textContent = line; return;
    }
    const c = characters[target.index], now = performance.now();
    if (announce ? now - c.lastClick < 450 : now - c.lastReaction < 1800) return;
    c.lastReaction = now; c.reaction = 0; c.reactionKind = announce ? 'poke' : 'hover';
    const line = announce ? pokeLines[target.index][c.pokes++ % pokeLines[target.index].length] : lines[target.index][c.said++ % lines[target.index].length];
    if (announce) c.lastClick = now;
    say(String(target.index), line); if (announce) announcement.textContent = line;
  }
  document.querySelectorAll('[data-character]').forEach(button => button.addEventListener('click', () => react({ type: 'main', index: Number(button.dataset.character) }, true)));
  document.querySelectorAll('[data-prop]').forEach(button => button.addEventListener('click', () => react({ type: 'prop', name: button.dataset.prop }, true)));
  let hovered = '';
  renderer.domElement.addEventListener('pointermove', event => { const target = hit(event), key = target ? `${target.type}-${target.name ?? target.index ?? ''}` : ''; renderer.domElement.style.cursor = target ? 'pointer' : 'default'; if (event.pointerType !== 'touch' && key && key !== hovered) react(target); hovered = key; });
  renderer.domElement.addEventListener('pointerleave', () => { hovered = ''; renderer.domElement.style.cursor = 'default'; });
  renderer.domElement.addEventListener('click', event => react(hit(event), true));
  const clock = new THREE.Clock(); let lastLine = 0, guestLine = false;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), .04); if (document.hidden) return;
    if (!paused) elapsed += dt;
    const move = Math.min(1, Math.max(0, (elapsed - .4) / 3.4)); const eased = 1 - (1 - move) ** 3;
    cart.position.x = (mobile ? 8 : 12) * (1 - eased); cart.rotation.y = Math.sin(Math.PI * move) * -.045;
    characters.forEach((c, i) => {
      const home = mobile ? [-3.5, 2.35, 3.55][i] : compact ? [-4.8, 3, 4.8][i] : [-5.45, 3.25, 5.45][i];
      if (i === 1) c.root.position.x = home + (mobile ? 6 : 9) * (1 - eased); else c.root.position.x = home;
      c.root.position.z = i === 1 ? -.2 : -.65;
      if (!paused) { c.hopTime += dt; if (c.hopTime > 3.4 + i * .35) c.hopTime = 0; c.reaction = Math.min(2, c.reaction + dt); }
      const t = c.hopTime, airborne = t < .85, placingTape = i !== 1 && elapsed < 3.5;
      c.root.position.y = placingTape || i === 1 && move < 1 ? 0 : airborne ? Math.sin(t / .85 * Math.PI) * .32 : 0;
      const watching = Math.min(1, Math.max(0, (elapsed - 3.2) / 1.8));
      const firstYaw = i === 1 ? -.13 : i === 0 ? .12 : -.12;
      const watchYaw = i === 0 ? .96 : -1.05;
      c.root.rotation.set(0, firstYaw + (watchYaw - firstYaw) * watching, 0);
      if (c.reaction < 1.2) {
        const p = c.reaction / 1.2;
        if (c.reactionKind === 'poke') {
          const topple = Math.sin(Math.PI * p) ** 2;
          c.root.rotation.z = (i === 2 ? -1 : 1) * topple * (i === 1 ? .72 : 1.08);
          c.root.position.y += Math.sin(Math.PI * p) * .12;
        } else {
          if (i === 0) c.root.position.y = Math.abs(Math.sin(p * Math.PI * 2)) * .6;
          if (i === 1) c.root.rotation.z = Math.sin(p * Math.PI * 6) * .17 * Math.sin(p * Math.PI);
          if (i === 2) c.root.rotation.y += Math.PI * 2 * (p * p * (3 - 2 * p));
        }
      }
      const state = i === 1 && move < 1 ? 'walking' : placingTape ? 'running' : !c.hasJump ? 'idle' : t < .4 ? 'jumping_up' : t < .85 ? 'falling_idle' : t < 1.1 ? 'hard_landing' : 'idle';
      if (!paused) c.actor.update(dt, state);
    });
    audience.forEach((c, i) => {
      const start = 2.8 + i * .65, progress = Math.min(1, Math.max(0, (elapsed - start) / 2.1)), ease = 1 - (1 - progress) ** 3;
      const home = (i - 1) * (mobile ? 1.15 : 1.5);
      c.root.position.set(home + (i % 2 ? 1 : -1) * (mobile ? 5 : 9) * (1 - ease), Math.sin(elapsed * 3 + i) * .025, mobile ? 2.7 : 1.35);
      const turn = Math.min(1, Math.max(0, (elapsed - start - 1.25) / 1.45));
      c.root.rotation.y = [2.45, Math.PI, 3.82][i] * turn + Math.sin(elapsed * .65 + i) * .07;
      c.root.rotation.z = c.reaction < 1 ? (i % 2 ? 1 : -1) * Math.sin(Math.PI * c.reaction) ** 2 * .52 : 0;
      if (!paused) c.reaction = Math.min(2, c.reaction + dt);
      if (!paused) c.actor.update(dt, progress < 1 ? 'walking' : 'idle');
      if (!c.arrived && progress >= 1) {
        c.arrived = true;
        if (!holeEvent.active && i === 0) say('0', 'Wait—are they supposed to be behind the tape?');
        if (!holeEvent.active && i === 2) say('2', 'It’s fine. I drew a second safety line in crayon.');
      }
    });
    if (holeEvent.active) {
      const age = (performance.now() - holeEvent.started) / 1000;
      trapHole.update(age, mobile);
      const pullIn = (c, index) => {
        const delay = index * .12, centerZ = mobile ? 2.1 : 1.45;
        const fall = Math.min(1, Math.max(0, (age - .45 - delay) / 1.08));
        const rise = Math.min(1, Math.max(0, (age - 10 - delay) / 1.05));
        if (age < 10 + delay && fall >= 1) { c.root.visible = false; return; }
        c.root.visible = true;
        const amount = age < 10 + delay ? fall ** 2 : 1 - (1 - rise) ** 3;
        const baseX = c.root.position.x, baseY = c.root.position.y, baseZ = c.root.position.z;
        const pull = age < 10 + delay ? amount : 1 - amount;
        c.root.position.x = THREE.MathUtils.lerp(baseX, 0, pull);
        c.root.position.z = THREE.MathUtils.lerp(baseZ, centerZ, pull);
        c.root.position.y = baseY - 3.5 * pull + Math.sin(Math.PI * (age < 10 + delay ? fall : rise)) * .45;
        c.root.rotation.z += (index % 2 ? -1 : 1) * Math.sin(Math.PI * pull) * 1.15;
        c.root.scale.setScalar(1 - .82 * pull);
      };
      characters.forEach((c, i) => pullIn(c, i));
      audience.forEach((c, i) => pullIn(c, i + characters.length));
      if (age >= 12.2) {
        holeEvent.active = false; trapHole.hide();
        [...characters, ...audience].forEach(c => { c.root.visible = true; c.root.scale.setScalar(1); });
        dangerButton.disabled = false; dangerButton.classList.remove('is-pressed'); dangerText.textContent = 'DO NOT PRESS';
        voiceLayer.replaceChildren(); speech.setVisible(true); lastLine = elapsed;
        announcement.textContent = 'The Chonkimals have climbed back out of the hole.';
        say('1', 'We are adding that to the incident report.');
      }
    }
    worksite.update(elapsed); scene.updateMatrixWorld(true);
    for (const c of characters) { if (!c.hat) continue; const point = c.headTop.getWorldPosition(new THREE.Vector3()); c.hat.position.copy(c.root.worldToLocal(point)); c.hat.position.y += .07; }
    if (!holeEvent.active && !paused && elapsed - lastLine > 9 && elapsed > 6) { lastLine = elapsed; guestLine = !guestLine; if (guestLine) say('guest-2', audienceLines[1 + (showing++ % (audienceLines.length - 1))]); else { const index = showing++ % 3; say(String(index), lines[index][characters[index].said++ % lines[index].length]); } }
    if (autoplay && !paused && !holeEvent.active && !clipDialog.open) { projectElapsed += dt; if (projectElapsed >= PROJECT_DURATION) showProject(selected + 1); }
    autoplayProgress.style.transform = `scaleX(${autoplay ? Math.min(1, projectElapsed / PROJECT_DURATION) : 0})`;
    speech.update(paused ? 0 : dt, camera, (key, out) => { if (key.startsWith('guest-')) { const c = audience[Number(key.slice(6))]; if (!c) return false; out.set(c.root.position.x, c.root.position.y + 1.65, c.root.position.z); return true; } const c = characters[Number(key)]; if (!c) return false; out.set(c.root.position.x, c.root.position.y + 2.55, c.root.position.z); return true; }, () => 1);
    renderer.render(scene, camera);
  });
}
init().catch(error => { console.error(error); document.querySelector('#loading').textContent = 'Our little friends are taking a breather. Their references are still excellent.'; });
