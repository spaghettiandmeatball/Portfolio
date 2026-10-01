import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { createCharacter } from './chonkimals/player.js';
import { SpeechBubbles } from './chonkimals/speech-bubbles.js';
import { openProjectPlayer, isProjectPlayerOpen } from './project-player.js?v=f50ded3c0037';
import { projectCopy } from './project-copy.js?v=b810d130723e';

const projects = [
  { group: 'Zynga Hackathon 2026', title: 'Chonkimals', kind: 'chonkimals', play: './play/chonkimals/' },
  { group: 'Zynga Hackathon 2025', title: 'Word-O-Meter', kind: 'wordometer', play: './play/word-o-meter/' },
  { group: 'Words With Friends', title: 'Dice Challenge', kind: 'dice', video: 'https://www.youtube.com/shorts/Y0ORyzqeXgM', embed: 'https://www.youtube-nocookie.com/embed/Y0ORyzqeXgM?autoplay=1&playsinline=1&rel=0' },
  { group: 'Words With Friends', title: 'Letter Lock', kind: 'letters', image: 'project-letter-lock.png', video: 'https://www.youtube.com/shorts/DIEdCnECGjg', embed: 'https://www.youtube-nocookie.com/embed/DIEdCnECGjg?autoplay=1&playsinline=1&rel=0' },
  { group: 'Words With Friends', title: 'Gold Word', kind: 'gold', video: 'https://www.instagram.com/reels/DdUcDmelR2F/', localVideo: './assets/videos/gold-word.mp4' },
  { group: 'Words With Friends', title: 'Bonus Pass', kind: 'pass' },
  { group: 'Merge Dragons', title: 'Dragon Breeding', kind: 'breeding', image: 'project-dragon-breeding.png' },
  { group: 'Merge Dragons', title: 'A Better Beginning', kind: 'ftue', image: 'project-ftue.png' },
  { group: 'Merge Dragons', title: 'Discovery Book', kind: 'book', image: 'project-dragon-book.png' },
];
// Shuffle once per visit; selecting a named project restores the curated sequence.
const defaultProjectOrder = [2, 3, 6, 7, 8, 4, 5, 0, 1];
let projectOrder = [...defaultProjectOrder];
for (let i = projectOrder.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [projectOrder[i], projectOrder[j]] = [projectOrder[j], projectOrder[i]];
}
function adjacentProject(step) {
  return projectOrder[(projectOrder.indexOf(selected) + step + projectOrder.length) % projectOrder.length];
}
function browseProject(step, announce = false) { showProject(adjacentProject(step), announce, step); }
function selectProject(index) { projectOrder = [...defaultProjectOrder]; showProject(index, true); }
const lines = [
  ['I measured twice and hopped once.', 'He pays me 15 snacks an hour.', 'We dug a hole. That counts as progress.', 'The site is looking great. Can’t wait for you to see it.', 'We’re working as fast as our little legs can go.'],
  ['I brought some of Joel’s work!', 'The monitor is load-bearing. Probably.', 'I’m one of the references on his résumé.', 'Please enjoy this very official presentation.', 'I’m available for reference checks after my nap.'],
  ['He’s building the portfolio. I’m building morale.', 'Our permit is written in crayon.', 'I’m the site supervisor. I appointed myself.', 'We’re getting this place up and running. Mostly running.'],
];
const audienceLines = ['Ooh, a sneak peek!', 'Is that a hole or a feature?', 'I came for the snacks.', 'Wait, go back one!', 'I would hire him. For snacks.'];
const aboutLines = [
  ['I’m here to make sure he says nice things about himself.', 'Joel let me use the good markers for this page.', 'I packed a lunch for the meet and greet.'],
  ['I’m his reference. Please call during snack hours.', 'Joel made the games. I made this introduction awkward.', 'He’s good at making little things feel alive. Exhibit A: me.'],
  ['I followed him here. Is this networking?', 'I’m head of welcoming. There was no interview.', 'He gives very good feedback. I prefer biscuits.'],
];
const aboutGuestLines = ['I thought this was a meet and greet.', 'Do we get tiny name tags?', 'I came to meet Joel. I’m staying for the snacks.'];
const aboutJoelLines = ['Hi, I’m Joel. I’m a Product Designer at Zynga.', 'The tiny details are usually my favorite part.', 'Take a look at the work if you’d like to see what I’ve been making.'];
const pokeLines = [
  ['Keep your stinkin’ human paws off me!', 'I am a professional. Please poke professionally.', 'Help. A giant finger has breached the perimeter.'],
  ['The presenter is very ticklish.', 'No touching the talent! Unless you have snacks.', 'That was my dramatic fall. Thank you.'],
  ['Keep your stinkin’ human paws off me!', 'This is a hard hat, not a tap target.', 'I’m reporting this to the snack department.'],
];
const guestPokeLines = ['I just got here!', 'I was told this was a safe viewing area.', 'Hey! I’m part of the audience!'];
const propLines = { hole: ['This is an important hole.', 'The hole has excellent growth potential.'], shovel: ['This is my senior shovel.', 'I put it on my résumé.'], toolbox: ['The toolbox is mostly snacks.', 'Please return all borrowed snacks.'] };
const propCounts = { hole: 0, shovel: 0, toolbox: 0 };
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const animationVideos = [...document.querySelectorAll('.case-animation video')];
const animationVisibility = new WeakMap();
const animationPaused = new WeakSet();
function syncAnimation(video) {
  const play = animationVisibility.get(video) && !reduced.matches && !document.hidden && !animationPaused.has(video);
  video.muted = true;
  const button = video.closest('figure').querySelector('.animation-toggle');
  button.textContent = play ? 'Pause animation' : 'Play animation';
  button.setAttribute('aria-pressed', String(!!play));
  if (play) video.play().catch(() => { button.textContent = 'Play animation'; button.setAttribute('aria-pressed', 'false'); });
  else video.pause();
}
const animationObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  animationVisibility.set(entry.target, entry.isIntersecting);
  syncAnimation(entry.target);
}), { threshold: .2 });
animationVideos.forEach(video => {
  video.removeAttribute('autoplay');
  video.pause();
  animationObserver.observe(video);
  video.closest('figure').querySelector('.animation-toggle').addEventListener('click', () => {
    if (!video.paused) { animationPaused.add(video); video.pause(); }
    else { animationPaused.delete(video); video.muted = true; video.play().catch(() => {}); }
    const button = video.closest('figure').querySelector('.animation-toggle');
    button.textContent = video.paused ? 'Play animation' : 'Pause animation';
    button.setAttribute('aria-pressed', String(!video.paused));
  });
});
reduced.addEventListener('change', () => animationVideos.forEach(syncAnimation));
document.addEventListener('visibilitychange', () => animationVideos.forEach(syncAnimation));

const autoplayButton = document.querySelector('#autoplay');
const autoplayProgress = document.querySelector('#autoplay-progress');
const announcement = document.querySelector('#announcement');
let paused = reduced.matches;
let autoplay = !reduced.matches;
let projectElapsed = 0;
let slideWobble = 0;
let slideCueAt = -Infinity, slideCueManual = false;
const PROJECT_DURATION = 7;
let speech, characters = [], audience = [], cart, cartScreen, elapsed = reduced.matches ? 7 : 0, selected = 0, showing = 0;
let slideTexture, slideCanvas, slideContext, chonkimalsImage;
const projectImages = new Map();
const slideVideo = document.createElement('video');
slideVideo.id = 'presentation-video';
slideVideo.muted = true;
slideVideo.defaultMuted = true;
slideVideo.loop = true;
slideVideo.playsInline = true;
slideVideo.preload = 'metadata';
slideVideo.hidden = true;
slideVideo.setAttribute('aria-hidden', 'true');
document.body.appendChild(slideVideo);
const slideClips = { chonkimals: './assets/videos/chonkimals-trailer.mp4', dice: './assets/videos/dice-challenge.mp4', letters: './assets/videos/letter-lock.mp4', gold: './assets/videos/gold-word.mp4' };
const trailerPoster = new Image();
trailerPoster.onload = drawSlide;
trailerPoster.src = './assets/chonkimals-trailer-poster.jpg';
const previewSound = document.querySelector('#preview-sound');
function updatePreviewSound() {
  previewSound.textContent = slideVideo.muted ? 'Unmute preview' : 'Mute preview';
  previewSound.setAttribute('aria-pressed', String(!slideVideo.muted));
}
previewSound.addEventListener('click', () => {
  slideVideo.muted = !slideVideo.muted;
  updatePreviewSound();
  if (!paused && !document.hidden && !isProjectPlayerOpen()) {
    slideVideo.play().catch(() => { slideVideo.muted = true; updatePreviewSound(); });
  }
});
let slidePlaybackWanted = false, lastVideoTime = -1;
slideVideo.addEventListener('loadeddata', drawSlide);
function selectSlideVideo(project) {
  slideVideo.pause();
  slidePlaybackWanted = false;
  lastVideoTime = -1;
  const source = slideClips[project.kind];
  slideVideo.muted = true;
  previewSound.hidden = !source;
  updatePreviewSound();
  if (source) slideVideo.src = source;
  else slideVideo.removeAttribute('src');
  slideVideo.load();
}
function updateSlideVideo(active) {
  const wanted = active && !!slideClips[projects[selected].kind];
  if (wanted !== slidePlaybackWanted) {
    slidePlaybackWanted = wanted;
    if (wanted) slideVideo.play().catch(() => { /* Keep the static preview if autoplay is blocked. */ });
    else slideVideo.pause();
  }
  if (wanted && slideVideo.readyState >= 2 && slideVideo.currentTime !== lastVideoTime) {
    lastVideoTime = slideVideo.currentTime;
    drawSlide();
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { slideVideo.pause(); slidePlaybackWanted = false; }
});
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
const openingVisuals = Promise.allSettled([
  document.fonts.load('600 108px Fredoka').then(drawSlide),
  shot.decode(),
]);
const projectButtons = [...document.querySelectorAll('[data-project]')];
const watchClip = document.querySelector('#watch-clip');
watchClip.addEventListener('click', () => { projectElapsed = 0; openProjectPlayer(projects[selected]); });

reduced.addEventListener('change', e => { paused = e.matches; autoplay = !e.matches; if (e.matches) elapsed = Math.max(elapsed, 7); updateAutoplay(); });
function updateAutoplay() {
  autoplayButton.innerHTML = `<span class="autoplay-icon" aria-hidden="true">${autoplay ? 'Ⅱ' : '▶'}</span> ${autoplay ? 'Pause autoplay' : 'Play autoplay'}`;
  autoplayButton.setAttribute('aria-pressed', String(autoplay));
}
updateAutoplay();
autoplayButton.addEventListener('click', () => { autoplay = !autoplay; projectElapsed = 0; updateAutoplay(); });

// Cancel interrupted entrances so fast browsing always lands on the latest project.
const contentMotion = new WeakMap();
function popContent(elements, direction = 1) {
  elements.filter(element => element && !element.hidden).forEach((element, index) => {
    contentMotion.get(element)?.cancel();
    if (reduced.matches) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translate3d(' + direction * 6 + 'px, 8px, 0)' },
      { opacity: 1, transform: 'translate3d(0, 0, 0)' }
    ], { duration: 480, delay: index * 25, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    contentMotion.set(element, animation);
  });
}
function easeInPage(element, { delay = 0, distance = 24, duration = 900 } = {}) {
  contentMotion.get(element)?.cancel();
  if (reduced.matches) return;
  const animation = element.animate([
    { opacity: 0, transform: `translate3d(0, ${distance}px, 0)` },
    { opacity: 1, transform: 'translate3d(0, 0, 0)' }
  ], { duration, delay, easing: 'cubic-bezier(.22, .7, .18, 1)', fill: 'backwards' });
  contentMotion.set(element, animation);
}
let panelResize;
function showProject(index, announce = false, travelDirection) {
  const panel = document.querySelector('.preview');
  const oldHeight = panel.getBoundingClientRect().height;
  panelResize?.cancel();
  const changed = index !== selected;
  const direction = travelDirection || (projectOrder.indexOf(index) < projectOrder.indexOf(selected) ? -1 : 1);
  projectElapsed = 0;
  const next = (index + projects.length) % projects.length;
  if (next !== selected && !reduced.matches) {
    slideWobble = 1;
    slideCueAt = performance.now();
    slideCueManual = announce;
  }
  selected = next;
  const project = projects[selected];
  selectSlideVideo(project);
  const detailRoutes = { dice: 'dice-challenge', letters: 'letter-lock', breeding: 'dragon-breeding', ftue: 'onboarding', book: 'discovery-book' };
  document.querySelector('#project-details-link').hidden = !detailRoutes[project.kind];
  document.querySelector('#project-details-link').href = '#' + (detailRoutes[project.kind] || 'work');
  document.querySelector('#project-group').textContent = project.group;
  document.querySelector('#project-title').textContent = project.title;
  document.querySelector('#coming-next-title').textContent = projects[adjacentProject(1)].title;
  document.querySelector('#coming-next').setAttribute('aria-label', `Next project: ${projects[adjacentProject(1)].title}`);
  watchClip.hidden = !(project.video || project.play);
  watchClip.innerHTML = `<span aria-hidden="true">▶</span> ${project.play ? 'Play Game' : 'Watch the clip'}`;
  document.querySelector('#chonkimals-details').hidden = project.kind !== 'chonkimals';
  const story = document.querySelector('#project-details');
  const copy = projectCopy[project.kind];
  story.hidden = !copy;
  story.setAttribute('aria-label', `About ${project.title}`);
  story.replaceChildren();
  if (copy) {
    const lead = document.createElement('p');
    lead.className = 'project-story-lead';
    lead.textContent = copy.lead;
    const overview = document.createElement('p');
    overview.textContent = copy.overview;
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = copy.summary;
    const list = document.createElement('ul');
    copy.details.forEach(([label, text]) => {
      const item = document.createElement('li');
      const heading = document.createElement('strong');
      heading.textContent = `${label}: `;
      item.append(heading, document.createTextNode(text));
      list.append(item);
    });
    details.append(summary, list);
    story.append(lead, overview, details);
    if (copy.note) {
      const note = document.createElement('p');
      note.className = 'project-fact';
      note.textContent = copy.note;
      story.append(note);
    }
  }
  if (announce) { autoplay = false; updateAutoplay(); }
  document.querySelector('#project-number').textContent = `${String(projectOrder.indexOf(selected) + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
  projectButtons.forEach(button => button.setAttribute('aria-current', String(Number(button.dataset.project) === selected)));
  if (changed && !panel.hidden) {
    const newHeight = panel.getBoundingClientRect().height;
    if (!reduced.matches && oldHeight && newHeight !== oldHeight) {
      panelResize = panel.animate([{height: oldHeight + 'px'}, {height: newHeight + 'px'}],
        {duration: 360, easing: 'cubic-bezier(.22,1,.36,1)'});
    }
    popContent([document.querySelector('.preview-current'), document.querySelector('#chonkimals-details'), story], direction);
  }
  drawSlide();
  if (announce) announcement.textContent = `${project.title}, ${project.group}`;
}
document.querySelector('#previous-project').addEventListener('click', () => browseProject(-1, true));
document.querySelector('#next-project').addEventListener('click', () => browseProject(1, true));
document.querySelector('#coming-next').addEventListener('click', () => browseProject(1, true));
projectButtons.forEach(button => button.addEventListener('click', () => selectProject(Number(button.dataset.project))));
showProject(projectOrder[0]);
function pauseForProjectStory() { autoplay = false; updateAutoplay(); }
document.querySelectorAll('.project-story').forEach(story => {
  story.addEventListener('pointerenter', pauseForProjectStory);
  story.addEventListener('focusin', pauseForProjectStory);
  story.addEventListener('touchstart', pauseForProjectStory, { passive: true });
});

function drawSlide() {
  if (!slideContext) return;
  const c = slideContext, p = projects[selected], w = slideCanvas.width, h = slideCanvas.height;
  if (p.kind === 'chonkimals') {
    const backdrop = c.createLinearGradient(0, 0, 0, h);
    backdrop.addColorStop(0, '#29464f');
    backdrop.addColorStop(.55, '#456964');
    backdrop.addColorStop(1, '#71846b');
    c.fillStyle = backdrop; c.fillRect(0, 0, w, h);
    const glow = c.createRadialGradient(w / 2, h * .45, 30, w / 2, h * .45, h * .8);
    glow.addColorStop(0, 'rgba(230,238,210,.22)');
    glow.addColorStop(1, 'rgba(230,238,210,0)');
    c.fillStyle = glow; c.fillRect(0, 0, w, h);
    const media = slideVideo.readyState >= 2 && slideVideo.videoWidth ? slideVideo : trailerPoster;
    const mediaWidth = media.videoWidth || media.naturalWidth;
    const mediaHeight = media.videoHeight || media.naturalHeight;
    if (mediaWidth && mediaHeight) {
      const scale = Math.min(w / mediaWidth, h * .96 / mediaHeight);
      const width = mediaWidth * scale, height = mediaHeight * scale;
      const x = (w - width) / 2, y = (h - height) / 2;
      c.save();
      c.shadowColor = 'rgba(28,46,32,.35)'; c.shadowBlur = 18; c.shadowOffsetY = 5;
      c.fillStyle = '#223529'; c.beginPath(); c.roundRect(x, y, width, height, 9); c.fill();
      c.shadowColor = 'transparent'; c.clip();
      c.drawImage(media, x, y, width, height);
      c.restore();
    }
    if (slideTexture) slideTexture.needsUpdate = true;
    return;
  }
  if (slideClips[p.kind] && slideVideo.readyState >= 2 && slideVideo.videoWidth) {
    const scale = Math.min(w / slideVideo.videoWidth, h / slideVideo.videoHeight);
    const width = slideVideo.videoWidth * scale, height = slideVideo.videoHeight * scale;
    c.fillStyle = '#171411'; c.fillRect(0, 0, w, h);
    c.drawImage(slideVideo, (w - width) / 2, (h - height) / 2, width, height);
    if (slideTexture) slideTexture.needsUpdate = true;
    return;
  }
  const merge = p.group === 'Merge Dragons';
  c.fillStyle = merge ? '#e7ead2' : '#f1e7cf';
  c.fillRect(0, 0, w, h);
  const projectImage = p.kind === 'chonkimals' ? chonkimalsImage : getProjectImage(p);
  if (projectImage) {
    const image = projectImage, scale = Math.max(w / image.width, h / image.height);
    c.drawImage(image, (w - image.width * scale) / 2, (h - image.height * scale) / 2, image.width * scale, image.height * scale);
    c.fillStyle = 'rgba(39,34,25,.77)'; c.fillRect(0, h - 133, w, 133);
    c.textAlign = 'left'; c.fillStyle = '#fff8e9'; c.font = '600 28px Fredoka, sans-serif'; c.fillText(p.group.toLowerCase(), 43, h - 101);
    if (p.kind === 'ftue') {
      c.font = '600 35px Fredoka, sans-serif';
      c.fillText('a better beginning', 40, h - 53, w - 80);
      c.fillText('FTUE Optimization', 40, h - 14, w - 80);
    } else { c.font = '600 70px Fredoka, sans-serif'; c.fillText(p.title.toLowerCase(), 40, h - 24, w - 80); }
    if (p.video || p.play) drawVideoCue(c, w / 2, 257, p.play ? 'PLAY GAME' : 'WATCH THE CLIP');
  } else {
    const ink = merge ? '#355646' : '#49362c', accent = merge ? '#77945d' : '#b87149';
    c.strokeStyle = accent; c.lineWidth = 4; c.setLineDash([7, 12]);
    c.strokeRect(22, 22, w - 44, h - 44); c.setLineDash([]);
    c.fillStyle = ink; c.textAlign = 'left';
    c.font = '600 39px Fredoka, sans-serif'; c.fillText(p.group.toLowerCase(), 67, 110);
    c.font = '600 26px Fredoka, sans-serif'; c.textAlign = 'right'; c.fillText(`${String(projectOrder.indexOf(selected) + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`, w - 68, 108);
    const words = p.title.toLowerCase().split(' '), split = p.title.length > 14;
    const titleLines = split ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [p.title.toLowerCase()];
    const titleSize = titleLines.some(line => line.length > 13) ? 108 : 135;
    c.font = `600 ${titleSize}px Fredoka, sans-serif`;
    c.textAlign = 'center';
    const startY = titleLines.length === 1 ? 330 : 270;
    titleLines.forEach((line, i) => c.fillText(line, w / 2, startY + i * 110, w - 130));
    if (p.video || p.play) drawVideoCue(c, w / 2, 490, p.play ? 'PLAY GAME' : 'WATCH THE CLIP');
    else {
      c.beginPath(); c.moveTo(285, 442); c.bezierCurveTo(440, 472, 600, 426, 739, 450); c.strokeStyle = accent; c.lineWidth = 10; c.lineCap = 'round'; c.stroke();
      c.font = '500 26px Fredoka, sans-serif'; c.fillStyle = accent; c.fillText('a little look at joel’s work', w / 2, 522);
    }
  }
  if (slideTexture) slideTexture.needsUpdate = true;
}

function drawVideoCue(c, x, y, label = 'WATCH THE CLIP') {
  c.save();
  c.shadowColor = 'rgba(34,24,17,.35)'; c.shadowBlur = 18; c.shadowOffsetY = 8;
  c.fillStyle = '#fff7de'; c.strokeStyle = '#4b3828'; c.lineWidth = 6;
  c.beginPath(); c.roundRect(x - 235, y - 53, 470, 106, 18); c.fill(); c.stroke();
  c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0;
  c.fillStyle = '#f2ce5b'; c.beginPath(); c.arc(x - 170, y, 38, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#4b3828'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#4b3828'; c.beginPath(); c.moveTo(x - 179, y - 18); c.lineTo(x - 179, y + 18); c.lineTo(x - 147, y); c.closePath(); c.fill();
  c.fillStyle = '#4b3828'; c.textAlign = 'left'; c.font = '600 39px Fredoka, sans-serif'; c.fillText(label, x - 112, y + 14, 325);
  c.restore();
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

function makeHatDust(scene) {
  const group = new THREE.Group(); group.visible = false; scene.add(group);
  const geometry = new THREE.SphereGeometry(.18, 8, 6);
  const puffs = Array.from({ length: 6 }, (_, index) => {
    const puff = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: index % 2 ? 0xc8a77e : 0xe0c39c, transparent: true, opacity: 0, depthWrite: false }));
    group.add(puff); return puff;
  });
  return {
    update(progress, point) {
      group.visible = progress >= 0 && progress < 1;
      if (!group.visible) return;
      group.position.copy(point);
      puffs.forEach((puff, index) => {
        const angle = index / puffs.length * Math.PI * 2;
        const spread = .12 + progress * .62;
        puff.position.set(Math.cos(angle) * spread, .06 + progress * .22, Math.sin(angle) * spread * .72);
        puff.scale.setScalar((1 - progress) * (index % 2 ? .85 : 1.15));
        puff.material.opacity = (1 - progress) * .62;
      });
    }
  };
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
  const snackMat = new THREE.MeshStandardMaterial({ color: 0xd7a465, roughness: .95 });
  const snacks = [-1, 0, 1].map(() => {
    const snack = new THREE.Mesh(new THREE.DodecahedronGeometry(.13, 0), snackMat);
    snack.castShadow = true; snack.visible = false; toolbox.add(snack); return snack;
  });
  const pulses = { shovel: -Infinity, toolbox: -Infinity };
  let span = 12;
  return {
    resize(layout, wide) {
      span = THREE.MathUtils.lerp(8, THREE.MathUtils.lerp(10.4, 12, wide), layout);
      posts[0].position.x = -span / 2; posts[1].position.x = span / 2;
      cones[0].position.x = -THREE.MathUtils.lerp(3.8, THREE.MathUtils.lerp(4.8, 5.5, wide), layout); cones[1].position.x = -cones[0].position.x;
      const spread = THREE.MathUtils.lerp(2.5, THREE.MathUtils.lerp(3.25, 3.85, wide), layout);
      holes[0].position.x = -spread; holes[1].position.x = spread;
      holes.forEach(hole => { hole.position.z = THREE.MathUtils.lerp(2.45, 1.55, layout); });
      shovel.position.x = -spread - .4; toolbox.position.x = spread + .5;
      shovel.position.z = THREE.MathUtils.lerp(2.25, 1.45, layout); toolbox.position.z = THREE.MathUtils.lerp(2.6, 1.7, layout);
    },
    hit(raycaster) {
      if (holes.some(hole => raycaster.intersectObject(hole, true).length)) return 'hole';
      if (raycaster.intersectObject(shovel, true).length) return 'shovel';
      if (raycaster.intersectObject(toolbox, true).length) return 'toolbox';
      return null;
    },
    bump(type, t) { if (type in pulses) pulses[type] = t; },
    update(t, mishap, mishapAge, hiddenByHole) {
      const progress = Math.max(.001, Math.min(1, (t - .25) / 3.2)); tape.scale.x = span * progress; tape.position.x = -span / 2 + span * progress / 2; tape.rotation.z = Math.sin(t * 1.4) * .006 * progress;
      const sway = type => { const age = t - pulses[type]; return age >= 0 && age < 1 ? Math.sin(age * 22) * (1 - age) * .19 : 0; };
      shovel.rotation.z = -.14 + sway('shovel'); toolbox.rotation.z = sway('toolbox');
      const coneAge = !hiddenByHole && mishap === 'cone' ? mishapAge : -1;
      const tip = coneAge < 0 ? 0 : Math.min(1, coneAge / .3) * (1 - Math.min(1, Math.max(0, (coneAge - 1.8) / .55)));
      cones[0].rotation.z = tip * 1.15 + (tip ? Math.sin(coneAge * 18) * .025 : 0);
      const snackAge = !hiddenByHole && mishap === 'snacks' ? mishapAge : -1;
      const lidLift = snackAge < 0 ? 0 : Math.sin(Math.PI * Math.min(1, snackAge / 1.2)) * .28;
      boxLid.position.y = .53 + lidLift; handle.position.y = .66 + lidLift;
      snacks.forEach((snack, i) => {
        const age = snackAge - .2 - i * .1;
        snack.visible = age >= 0 && age < 2.2;
        if (!snack.visible) return;
        const p = Math.min(1, age / 1.5);
        snack.position.set((i - 1) * (.15 + p * .26), .64 + Math.sin(Math.PI * p) * (1.05 + i * .13), .18 + p * .28);
        snack.rotation.set(age * 7, age * 4, age * 5);
      });
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
    update(age, layout) {
      const opening = Math.min(1, Math.max(0, age / .6));
      const closing = Math.min(1, Math.max(0, (12.2 - age) / .7));
      const size = Math.max(0, Math.min(opening, closing));
      group.visible = size > .01;
      group.scale.setScalar(size);
      group.position.z = THREE.MathUtils.lerp(2.1, 1.45, layout);
    },
    hide() { group.visible = false; }
  };
}

function makeCart(scene) {
  slideCanvas = document.createElement('canvas'); slideCanvas.width = 1024; slideCanvas.height = 576; slideContext = slideCanvas.getContext('2d');
  slideTexture = new THREE.CanvasTexture(slideCanvas); slideTexture.colorSpace = THREE.SRGBColorSpace; drawSlide();
  const frame = new THREE.MeshStandardMaterial({ color: 0x574337, roughness: .7 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xd59c52, roughness: .65 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x37302a, roughness: .88 });
  const group = new THREE.Group(); group.position.set(12, 0, -4.4); scene.add(group);
  const screenWidth = 8.96, screenHeight = screenWidth * 9 / 16;
  const screenY = 1.81 + screenHeight / 2;
  const panel = new THREE.Mesh(new THREE.BoxGeometry(9.4, screenHeight + .42, .25), frame); panel.position.y = screenY; panel.castShadow = true; group.add(panel);
  const border = new THREE.Mesh(new THREE.BoxGeometry(9.16, screenHeight + .18, .03), edge); border.position.set(0, screenY, .145); group.add(border);
  cartScreen = new THREE.Mesh(new THREE.PlaneGeometry(screenWidth, screenHeight), new THREE.MeshBasicMaterial({ map: slideTexture, toneMapped: false })); cartScreen.position.set(0, screenY, .165); group.add(cartScreen);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(.18, 1.55, .18), frame); stand.position.y = .9; stand.castShadow = true; group.add(stand);
  const base = new THREE.Mesh(new THREE.BoxGeometry(8.3, .15, .28), frame); base.position.y = .14; base.castShadow = true; group.add(base);
  for (const x of [-3.86, 3.86]) { const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .14, 20), wheelMat); wheel.rotation.x = Math.PI / 2; wheel.position.set(x, .21, .23); group.add(wheel); }
  return group;
}

async function init() {
  const host = document.querySelector('#stage');
  const layoutMix = () => THREE.MathUtils.smoothstep(host.clientWidth, 540, 860);
  const wideMix = () => THREE.MathUtils.smoothstep(host.clientWidth, 980, 1200);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(29, 1, .1, 60);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setClearColor(0xf7f3e9, 0);
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  host.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xfffcf0, 0xc2b4a3, 2.7));
  const sun = new THREE.DirectionalLight(0xfff3dc, 3.6); sun.position.set(-3, 7, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 }); sun.shadow.bias = -.0005; sun.shadow.normalBias = .04; sun.shadow.radius = 5; scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xddeaff, 1.5); fill.position.set(4, 3, -2); scene.add(fill);
  // The shadow-receiving stage meets the work rail’s front fascia.
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xb7a17b, roughness: 1 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(20, .48, 40), groundMaterial);
  floor.position.set(0, -.27, 10); floor.receiveShadow = true; scene.add(floor);
  const groundClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  function maskBelowGround(root) {
    root.traverse(node => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach(material => { material.clippingPlanes = [groundClip]; material.clipShadows = true; });
    });
  }
  const workLayer = new THREE.Group(); scene.add(workLayer);
  const worksite = makeWorksite(workLayer), trapHole = makeTrapHole(workLayer); cart = makeCart(workLayer);
  const dangerButton = document.querySelector('#danger-button'), dangerText = dangerButton.querySelector('.danger-text'), voiceLayer = document.querySelector('#hole-voices');
  const holeEvent = { active: false, started: 0 };
  const mishap = { type: null, started: 0, nextAt: 16, count: 0, spoken: false };
  const main = document.querySelector('main'), playground = document.querySelector('.playground'), workPanel = document.querySelector('.preview'), aboutPanel = document.querySelector('.about-panel');
  const introWork = document.querySelector('.intro-work'), introAbout = document.querySelector('.intro-about');
  const casePanels = [...document.querySelectorAll('.case-panel')];
  const caseKinds = { 'dice-challenge': 'dice', 'letter-lock': 'letters', 'dragon-breeding': 'breeding', onboarding: 'ftue', 'discovery-book': 'book' };
  const caseOrder = Object.keys(caseKinds);
  casePanels.forEach(panel => {
    const index = caseOrder.indexOf(panel.dataset.case);
    const nav = panel.querySelector('.case-project-nav');
    nav.replaceChildren(...[-1, 1].map(direction => {
      const route = caseOrder[(index + direction + caseOrder.length) % caseOrder.length];
      const link = document.createElement('a');
      link.href = '#' + route; link.dataset.caseDirection = direction;
      const label = document.createElement('span');
      label.textContent = direction < 0 ? '← Previous project' : 'Next project →';
      const title = document.createElement('strong');
      title.textContent = projects.find(project => project.kind === caseKinds[route]).title;
      link.append(label, title); return link;
    }));
  });
  const isCase = next => Object.hasOwn(caseKinds, next);
  const caseFor = next => casePanels.find(panel => panel.dataset.case === next);
  const route = () => ['about', ...Object.keys(caseKinds)].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'work';
  const destination = next => isCase(next) ? caseFor(next) : aboutPanel;
  const navLinks = [...document.querySelectorAll('.site-nav a')];
  const loader = new GLTFLoader();
  const JOEL_HEIGHT = 3.65;
  let joel = null, joelLoad = null, aboutWelcomeAt = -Infinity;
  function loadJoel() {
    if (joelLoad) return joelLoad;
    joelLoad = loader.loadAsync('./assets/joel_wave.glb').then(wave => {
      const model = wave.scene;
      model.traverse(node => {
        if (!node.isMesh) return;
        node.castShadow = true;
        node.frustumCulled = false;
        if (node.material) { node.material.roughness = .78; node.material.metalness = 0; }
      });
      const bounds = new THREE.Box3().setFromObject(model);
      const height = bounds.getSize(new THREE.Vector3()).y || 1;
      const scale = JOEL_HEIGHT / height;
      model.scale.setScalar(scale);
      model.position.y = -bounds.min.y * scale;
      const root = new THREE.Group(); root.add(model); scene.add(root);
      const mixer = new THREE.AnimationMixer(model);
      // The wave starts from a planted stance. Hold that exact pose between greetings.
      const standing = new THREE.AnimationClip('joel_standing', 1, wave.animations[0].tracks.map(track => {
        const pose = Array.from(track.createInterpolant().evaluate(0));
        return new track.constructor(track.name, [0, 1], [...pose, ...pose]);
      }));
      const idleAction = mixer.clipAction(standing);
      const waveAction = mixer.clipAction(wave.animations[0]);
      for (const track of wave.animations[0].tracks) track.setInterpolation(THREE.InterpolateLinear);
      waveAction.setLoop(THREE.LoopOnce); waveAction.clampWhenFinished = true;
      idleAction.play();
      joel = { root, mixer, idleAction, waveAction, lastHover: -Infinity, lastClick: -Infinity, said: 0 };
      mixer.addEventListener('finished', event => {
        if (event.action !== waveAction) return;
        idleAction.reset().fadeIn(.3).play(); waveAction.fadeOut(.3);
      });
      root.visible = viewTransition ? viewTransition.to === 'about' && (!viewTransition.lowering || viewTransition.lowered) : view === 'about';
      return joel;
    }).catch(error => { console.warn('Joel could not join the scene', error); joelLoad = null; return null; });
    return joelLoad;
  }
  function waveJoel() {
    if (!joel || paused) return false;
    joel.idleAction.fadeOut(.25);
    joel.waveAction.reset().fadeIn(.25).play();
    return true;
  }
  const CAMERA_TRAVEL = 16;
  let view = 'work', viewTransition = null, sceneProgress = 0, sceneryProgress = 0, sceneSide = 1, scenePan = 0;
  const sceneLocation = next => next === 'work' ? 0 : next === 'about' ? CAMERA_TRAVEL : -CAMERA_TRAVEL;

  const hatGroundPosition = index => new THREE.Vector3(
    THREE.MathUtils.lerp(3.1, 4.4, layoutMix()) * (index === 0 ? -1 : 1), .12, THREE.MathUtils.lerp(3.15, 2.35, layoutMix())
  );
  const hatGroundRotation = index => new THREE.Quaternion().setFromEuler(
    new THREE.Euler(0, index === 0 ? -.45 : .55, index === 0 ? -.24 : .27)
  );
  function snapHats(next) {
    characters.forEach((c, index) => {
      if (!c.hat) return;
      c.hatMode = next === 'work' ? 'worn' : 'ground';
      if (next === 'work') {
        c.root.add(c.hat);
        c.hat.position.set(0, 0, 0);
        c.hat.quaternion.identity();
      } else {
        workLayer.add(c.hat);
        c.hat.position.copy(hatGroundPosition(index));
        c.hat.quaternion.copy(hatGroundRotation(index));
      }
    });
  }
  function setSceneProgress(progress, targetPan = scenePan, backgroundProgress = progress) {
    sceneProgress = progress;
    sceneryProgress = backgroundProgress;
    playground.style.setProperty('--scene-progress', sceneryProgress.toFixed(4));
    scenePan = targetPan;
    const layout = layoutMix(), pan = scenePan;
    floor.position.x = pan;
    sun.position.x = pan - 3; sun.target.position.x = pan; fill.position.x = pan + 4;
    groundMaterial.color.setHex(0xb7a17b).lerp(new THREE.Color(sceneSide < 0 ? 0xb7a17b : 0x829b76), sceneryProgress);
    camera.position.set(pan, THREE.MathUtils.lerp(4.4, 5.0, layout), THREE.MathUtils.lerp(20.8, 14.5, layout));
    camera.lookAt(pan, THREE.MathUtils.lerp(1.6, 3.2, layout), 0);
  }
  function applyView(next, alreadyRevealed = false) {
    const previous = view;
    playground.hidden = false;
    if (isCase(next)) selectProject(projects.findIndex(project => project.kind === caseKinds[next]));
    const crewComment = document.querySelector('.crew-commentary');
    crewComment.hidden = !isCase(next);
    if (isCase(next)) crewComment.querySelector('span').textContent = { 'dice-challenge': 'Rolling out another project. Literally.', 'letter-lock': 'We found the words. Where did the snacks go?', 'dragon-breeding': 'Bear with me. I’m on crank duty.', onboarding: 'Every great camp adventure starts somewhere.', 'discovery-book': 'We like to keep our dragons organized.' }[next];
    view = next; main.dataset.view = next; main.dataset.casePage = String(isCase(next)); workLayer.visible = next === 'work';
    sceneSide = isCase(next) ? -1 : 1;
    workLayer.position.x = 0;
    setSceneProgress(next !== 'work' ? 1 : 0, next === 'about' && alreadyRevealed ? scenePan : sceneLocation(next));
    main.classList.remove('is-case-travel', 'is-hoisting', 'is-lowering');
    casePanels.forEach(panel => { panel.hidden = panel.dataset.case !== next; });
    document.querySelector('.about-scenery-word').textContent = isCase(next) ? 'dragon breeding' : 'meet joel';
    if (joel) joel.root.visible = next === 'about';
    if (next === 'about') loadJoel();
    document.querySelector('[data-joel]').hidden = next !== 'about';
    document.querySelectorAll('[data-prop]').forEach(button => { button.hidden = next !== 'work'; });
    workPanel.hidden = next !== 'work'; aboutPanel.hidden = next !== 'about';
    introWork.hidden = next !== 'work'; introAbout.hidden = next !== 'about';
    dangerButton.hidden = next !== 'work';
    if (previous !== next && !alreadyRevealed) popContent(next === 'work'
      ? [introWork, workPanel] : [introAbout, destination(next)]);
    [introWork.parentElement, introWork, introAbout, workPanel, aboutPanel, ...casePanels].forEach(element => element.classList.remove('is-transition-arriving'));
    snapHats(next);
    characters.forEach((c, index) => {
      if (next === 'about') c.jumpStarted = -Infinity;
      if (next === 'work' && previous !== 'work') c.nextHopAt = elapsed + 10 + index * 4;
    });
    if (next === 'work' && previous !== 'work') mishap.nextAt = elapsed + 15;
    navLinks.forEach(link => link.setAttribute('aria-current', link.hash === (isCase(next) ? '#work' : `#${next}`) ? 'page' : 'false'));
    if (previous !== next) (isCase(next) ? caseFor(next).querySelector('h1') : document.querySelector('.wordmark')).focus({ preventScroll: true });
  }
  function revealIncoming(next) {
    if (!isCase(next) && viewTransition?.lowering) { main.dataset.casePage = "false"; main.classList.remove("is-lowering"); workLayer.visible = next === 'work'; }
    if (isCase(next)) {
      const introHeight = introWork.parentElement.getBoundingClientRect().height;
      const fullHeight = playground.getBoundingClientRect().height;
      const stripHeight = innerWidth <= 760 ? 124 : 154;
      const sceneOffset = -fullHeight * .57;
      playground.style.setProperty('--crew-scene-height', fullHeight + 'px');
      playground.style.setProperty('--crew-scene-offset', sceneOffset + 'px');
      main.dataset.casePage = 'true'; main.classList.add('is-hoisting');
      const liftOptions = { duration: 1350, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards' };
      main.animate([{ transform: 'translateY(' + introHeight + 'px)' }, { transform: 'translateY(0)' }], liftOptions);
      playground.animate([{ height: fullHeight + 'px' }, { height: stripHeight + 'px' }], liftOptions);
      host.animate([{ top: '0px' }, { top: sceneOffset + 'px' }], liftOptions);
      document.querySelector('.crew-commentary').hidden = true;
    }
    const leaving = [introWork, workPanel, introAbout, aboutPanel, ...casePanels];
    const arriving = next !== 'work' ? [introAbout, destination(next)] : [introWork, workPanel];
    leaving.forEach(element => { element.hidden = true; });
    arriving.forEach(element => { element.hidden = false; element.classList.add('is-transition-arriving'); });
    introWork.parentElement.classList.add('is-transition-arriving');
    if (next === 'work') easeInPage(introWork, { distance: 12, duration: 700 });
    const panel = next === 'work' ? workPanel : destination(next);
    if (isCase(next) || (isCase(view) && next !== 'about')) {
      contentMotion.get(panel)?.cancel();
      if (!reduced.matches) contentMotion.set(panel, panel.animate([
        { opacity: 1, transform: isCase(next) ? 'translateY(65vh)' : 'translateX(100vw)' },
        { opacity: 1, transform: isCase(next) ? 'translateY(-2px)' : 'translateX(-8px)', offset: .9 },
        { opacity: 1, transform: 'translate(0,0)' }
      ], { duration: isCase(next) ? 1350 : 1100, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards' }));
    } else easeInPage(panel, { delay: 90, distance: 26, duration: 950 });
  }
  let caseSwipe = null, swipeId = 0, scrollJourney = 0;
  function returnToTop(done) {
    const journey = ++scrollJourney;
    const startY = window.scrollY;
    if (reduced.matches || startY < 24) { window.scrollTo({ top: 0, behavior: 'instant' }); done(); return; }
    const duration = Math.min(750, 380 + Math.sqrt(startY) * 6);
    const started = performance.now();
    function step(now) {
      if (journey !== scrollJourney) return;
      const progress = Math.min(1, (now - started) / duration);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: startY * (1 - eased), behavior: 'instant' });
      if (progress < 1) requestAnimationFrame(step);
      else done();
    }
    requestAnimationFrame(step);
  }
  function navigate(next, addHistory = true, swipeDirection = null, atTop = false) {
    if (!atTop && next !== view && window.scrollY > 24) { returnToTop(() => navigate(next, addHistory, swipeDirection, true)); return; }
    if (!atTop) ++scrollJourney;
    document.querySelectorAll(".case-panel video").forEach(video => video.pause());
    if (caseSwipe) { ++swipeId; caseSwipe.cancel(); caseSwipe = null; }
    if (isCase(next) && isCase(view) && next !== view) {
      const id = ++swipeId;
      const order = Object.keys(caseKinds);
      const direction = swipeDirection ?? (order.indexOf(next) > order.indexOf(view) ? 1 : -1);
      if (addHistory && location.hash !== '#' + next) history.pushState({ view: next }, '', '#' + next);
      const outgoing = caseFor(view), incoming = caseFor(next);
      const stage = document.querySelector('.case-stage');
      const finish = () => {
        applyView(next, true);
        speech?.setVisible(true);
        announcement.textContent = incoming.querySelector('h1').textContent + ' case study';
      };
      if (reduced.matches) { finish(); return; }
      const oldHeight = stage.getBoundingClientRect().height;
      incoming.hidden = false;
      main.inert = true;
      stage.classList.add('is-swiping');
      const newHeight = incoming.getBoundingClientRect().height + 72;
      stage.style.height = oldHeight + 'px';
      selectProject(projects.findIndex(project => project.kind === caseKinds[next]));
      const options = { duration: 820, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'both' };
      const outgoingMotion = outgoing.animate([
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(' + -direction * 110 + '%)', opacity: .65 }
      ], options);
      const incomingMotion = incoming.animate([
        { transform: 'translateX(' + direction * 110 + '%)', opacity: .65 },
        { transform: 'translateX(0)', opacity: 1 }
      ], options);
      const heightMotion = stage.animate([{ height: oldHeight + 'px' }, { height: newHeight + 'px' }], options);
      const cleanup = () => {
        outgoingMotion.cancel(); incomingMotion.cancel(); heightMotion.cancel();
        stage.classList.remove('is-swiping'); stage.style.height = '';
        main.inert = false;
        casePanels.forEach(panel => { panel.hidden = panel.dataset.case !== view; });
      };
      caseSwipe = { cancel: cleanup };
      setTimeout(() => {
        if (id !== swipeId) return;
        cleanup(); caseSwipe = null; finish();
      }, options.duration + 20);
      return;
    }
    if (addHistory && location.hash !== `#${next}`) history.pushState({ view: next }, '', `#${next}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (holeEvent.active) {
      holeEvent.active = false; trapHole.hide(); voiceLayer.replaceChildren();
      [...characters, ...audience].forEach(c => { c.root.visible = true; c.root.scale.setScalar(1); });
      dangerButton.disabled = false; dangerButton.classList.remove('is-pressed'); dangerText.textContent = 'DO NOT PRESS';
    }
    if (viewTransition?.to === next) return;
    if (next === view && !viewTransition) return;
    if (next === view && viewTransition) { viewTransition = null; applyView(next); main.classList.remove('is-traveling'); speech.setVisible(true); return; }
    if (!speech) { applyView(next); return; }
    if (paused || reduced.matches) { viewTransition = null; applyView(next); speech.setVisible(true); announcement.textContent = next === 'about' ? 'About and contact' : 'Projects'; return; }
    speech.bubbles.forEach(bubble => { bubble.age = 10; }); speech.setVisible(false);
    mishap.type = null; dangerButton.hidden = true;
    const caseJourney = isCase(next) || isCase(view);
    sceneSide = next === 'about' ? 1 : caseJourney ? -1 : 1;
    main.classList.toggle('is-case-travel', caseJourney);
    playground.hidden = false;
    main.classList.add('is-traveling');
    const lowering = isCase(view) && !isCase(next);
    const toPan = next === 'about' ? (isCase(view) ? -CAMERA_TRAVEL * 2 : CAMERA_TRAVEL)
      : view === 'about' && next === 'work' ? (scenePan < 0 ? -CAMERA_TRAVEL * 3 : 0)
      : view === 'about' && isCase(next) && scenePan > 0 ? CAMERA_TRAVEL * 2 : sceneLocation(next);
    workLayer.position.x = next === 'work' ? toPan : 0;
    viewTransition = { to: next, lowering, fromPan: scenePan, toPan, direction: Math.sign(toPan - scenePan) || -1, fromProgress: sceneProgress, started: performance.now(), welcomed: false, revealed: false };
    playground.style.setProperty('--about-entry-side', next === 'about' ? viewTransition.direction : -viewTransition.direction);
    workLayer.visible = !lowering;
    if (lowering) {
      main.classList.add('is-lowering');
      document.querySelector('.crew-commentary').hidden = true;
      const panel = caseFor(view);
      panel.classList.add('is-transition-arriving');
      const fullHeight = parseFloat(playground.style.getPropertyValue('--crew-scene-height')) || 420;
      const stripHeight = playground.getBoundingClientRect().height;
      const top = parseFloat(playground.style.getPropertyValue('--crew-scene-offset')) || -178;
      const stripWidth = playground.getBoundingClientRect().width;
      const stageHeight = host.getBoundingClientRect().height;
      let expandedHeight = fullHeight, expandedWidth = stripWidth, expandedStageHeight = stageHeight;
      if (next === 'about') {
        const previousView = main.dataset.view;
        main.dataset.casePage = 'false'; main.dataset.view = 'about';
        const expanded = playground.getBoundingClientRect();
        expandedHeight = expanded.height; expandedWidth = expanded.width;
        expandedStageHeight = host.getBoundingClientRect().height;
        main.dataset.casePage = 'true'; main.dataset.view = previousView;
      }
      const lowerOptions = { duration: 1350, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' };
      const motions = [
        panel.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(75vh)' }], lowerOptions),
        playground.animate([{ height: stripHeight + 'px', width: stripWidth + 'px' }, { height: expandedHeight + 'px', width: expandedWidth + 'px' }], lowerOptions),
        host.animate([{ top: top + 'px', height: stageHeight + 'px' }, { top: '0px', height: expandedStageHeight + 'px' }], lowerOptions)
      ];
      if (next === 'about') viewTransition.lowerMotions = motions;
      else setTimeout(() => motions.forEach(motion => motion.cancel()), 1360);
    }
    if (next === 'about') loadJoel();
    if (next === 'about') document.querySelector('.about-scenery-word').textContent = 'meet joel';
    if (joel) joel.root.visible = next === 'about' ? !lowering : view === 'about';
    if (view === 'about' && next === 'work') waveJoel();
  }
  document.querySelectorAll(['work', 'about', ...caseOrder].map(route => `a[href="#${route}"]`).join(',')).forEach(link => link.addEventListener('click', event => { event.preventDefault(); navigate(link.hash.slice(1), true, link.dataset.caseDirection ? Number(link.dataset.caseDirection) : null); }));
  window.addEventListener('popstate', () => navigate(route(), false));
  window.addEventListener('hashchange', () => navigate(route(), false));
  document.querySelector('.crew-commentary button').addEventListener('click', () => { document.querySelector('.crew-commentary').hidden = true; });
  const initialJoelLoad = loadJoel(); // Fetch Joel ahead of time, so switching scenes never waits on him.
  const holeLines = ['It said not to press!', 'Do you not believe in Chonkimal rights?', 'Ouch.', 'This was not in the risk assessment.', 'Tell Joel we tried.'];
  dangerButton.addEventListener('click', () => {
    if (holeEvent.active) return;
    elapsed = Math.max(elapsed, 7);
    holeEvent.active = true; holeEvent.started = performance.now();
    mishap.type = null; mishap.nextAt = elapsed + 27;
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
  speech = new SpeechBubbles(document.querySelector('.playground'));
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
    const dust = hat ? makeHatDust(workLayer) : null;
    const idleOptions = index === 0 ? ['idle', 'idle_2', 'idle_3'] : index === 2 ? ['idle_3', 'idle_2', 'idle'] : ['idle'];
    return { root, actor, headTop, hat, dust, hatMode: hat ? 'worn' : null, hatStart: null, hatStartRotation: null, hatLandedAt: -Infinity, idleOptions, idleIndex: 0, nextIdleAt: 8 + index * 4, jumpStarted: -Infinity, nextHopAt: 11 + index * 5, hasJump: gltf.animations.some(c => c.name === 'jumping_up'), hasRun: gltf.animations.some(c => c.name === 'running'), hasWalk: gltf.animations.some(c => c.name === 'walking'), hasGreeting: gltf.animations.some(c => c.name === 'greeting'), reaction: 2, reactionKind: 'hover', lastReaction: -Infinity, lastClick: -Infinity, said: 0, aboutSaid: 0, pokes: 0 };
  });
  const skins = await Promise.all(['raccoon', 'fox', 'shiba'].map(name => new THREE.TextureLoader().loadAsync(`./assets/skins/dog_${name}.jpg`)));
  audience = skins.map((texture, index) => {
    texture.flipY = false; texture.colorSpace = THREE.SRGBColorSpace;
    const actor = createCharacter(gltfs[2], { lod: false }); actor.root.scale.setScalar(1.25 / actor.height);
    actor.root.traverse(node => { if (!node.isMesh) return; const material = node.material.clone(); material.map = texture; node.material = material; });
    actor.update(1, 'idle'); actor.root.updateMatrixWorld(true); actor.root.position.y -= new THREE.Box3().setFromObject(actor.root, true).min.y;
    const root = new THREE.Group(); root.add(actor.root); scene.add(root);
    const idleOptions = [['idle_2', 'idle'], ['idle_3', 'idle_2'], ['idle', 'idle_3']][index];
    return { root, actor, index, idleOptions, idleIndex: 0, nextIdleAt: 10 + index * 3, arrived: false, reaction: 2, lastReaction: -Infinity, lastClick: -Infinity, aboutSaid: 0, pokes: 0 };
  });
  [...characters, ...audience].forEach(c => maskBelowGround(c.root));
  document.querySelector('#loading').hidden = true; dangerButton.hidden = false;
  if (route() !== 'work') { elapsed = Math.max(elapsed, 7); applyView(route()); window.scrollTo({ top: 0, behavior: 'instant' }); }
  let layout = layoutMix(), wide = wideMix();
  function resize() {
    const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / h;
    layout = layoutMix(); wide = wideMix();
    cart.scale.setScalar(THREE.MathUtils.lerp(.86, 1, layout));
    camera.updateProjectionMatrix(); setSceneProgress(sceneProgress, scenePan, sceneryProgress); worksite.resize(layout, wide);
  }
  // Resizing clears WebGL's drawing buffer. Do it just before the next render,
  // rather than in ResizeObserver after a frame has already been drawn.
  let sceneResizePending = false;
  new ResizeObserver(() => { sceneResizePending = true; }).observe(host); resize();
  if (view === 'work') say('0', lines[0][0]);
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  function hit(event) { const r = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - r.left) / r.width * 2 - 1, -(event.clientY - r.top) / r.height * 2 + 1); raycaster.setFromCamera(pointer, camera); const main = characters.findIndex(c => raycaster.intersectObject(c.root, true).length); if (main >= 0) return { type: 'main', index: main }; const guest = audience.findIndex(c => raycaster.intersectObject(c.root, true).length); if (guest >= 0) return { type: 'guest', index: guest }; if (view === 'about' && joel && raycaster.intersectObject(joel.root, true).length) return { type: 'joel' }; if (view !== 'work' || viewTransition) return null; const prop = worksite.hit(raycaster); if (prop) return { type: 'prop', name: prop }; if (cartScreen && raycaster.intersectObject(cartScreen).length) return { type: 'screen' }; return null; }
  function react(target, announce = false) {
    if (holeEvent.active) return;
    if (!target) return; if (target.type === 'screen') { if (announce && (projects[selected].video || projects[selected].play)) watchClip.click(); else if (announce) browseProject(1, true); return; }
    const quietAbout = view === 'about' && !viewTransition;
    if (target.type === 'joel') {
      const now = performance.now(); if (now - (announce ? joel.lastClick : joel.lastHover) < (announce ? 450 : 1800)) return;
      if (announce) joel.lastClick = now; else joel.lastHover = now;
      waveJoel();
      if (!announce && quietAbout) return;
      if (quietAbout) aboutWelcomeAt = now;
      const line = quietAbout ? aboutJoelLines[joel.said++ % aboutJoelLines.length] : announce ? 'I hired the crew. They appointed themselves.' : 'Oh, hey!';
      say('joel', line); if (announce) announcement.textContent = line;
      return;
    }
    if (target.type === 'prop') { const name = target.name, choices = propLines[name], line = choices[propCounts[name]++ % choices.length]; say(name === 'toolbox' ? '2' : '0', line); worksite.bump(name, elapsed); if (announce) announcement.textContent = line; return; }
    if (target.type === 'guest') {
      const c = audience[target.index], now = performance.now();
      if (announce ? now - c.lastClick < 450 : now - c.lastReaction < 1800) return;
      c.lastReaction = now; c.reaction = 0;
      const line = quietAbout ? announce ? aboutGuestLines[c.aboutSaid++ % aboutGuestLines.length] : null : announce ? guestPokeLines[c.pokes++ % guestPokeLines.length] : audienceLines[(target.index + showing++) % audienceLines.length];
      if (announce) c.lastClick = now;
      if (!quietAbout || announce) say(`guest-${target.index}`, line);
      if (announce) announcement.textContent = line; return;
    }
    const c = characters[target.index], now = performance.now();
    if (announce ? now - c.lastClick < 450 : now - c.lastReaction < 1800) return;
    c.lastReaction = now; c.reaction = 0; c.reactionKind = announce ? 'poke' : 'hover';
    const line = quietAbout ? announce ? aboutLines[target.index][c.aboutSaid++ % aboutLines[target.index].length] : null : announce ? pokeLines[target.index][c.pokes++ % pokeLines[target.index].length] : lines[target.index][c.said++ % lines[target.index].length];
    if (announce) c.lastClick = now;
    if (!quietAbout || announce) say(String(target.index), line);
    if (announce) announcement.textContent = line;
  }
  document.querySelectorAll('[data-character]').forEach(button => button.addEventListener('click', () => react({ type: 'main', index: Number(button.dataset.character) }, true)));
  document.querySelector('[data-joel]').addEventListener('click', () => { if (joel) react({ type: 'joel' }, true); });
  document.querySelectorAll('[data-prop]').forEach(button => button.addEventListener('click', () => react({ type: 'prop', name: button.dataset.prop }, true)));
  let hovered = '';
  renderer.domElement.addEventListener('pointermove', event => { const target = hit(event), key = target ? `${target.type}-${target.name ?? target.index ?? ''}` : ''; renderer.domElement.style.cursor = target ? 'pointer' : 'default'; if (event.pointerType !== 'touch' && key && key !== hovered) react(target); hovered = key; });
  renderer.domElement.addEventListener('pointerleave', () => { hovered = ''; renderer.domElement.style.cursor = 'default'; });
  renderer.domElement.addEventListener('click', event => react(hit(event), true));
  const clock = new THREE.Clock(); let lastLine = 0, guestLine = false;
  let openingReady = false;
  Promise.all([openingVisuals, initialJoelLoad]).then(() => { openingReady = true; });
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), .04); if (document.hidden) return;
    if (sceneResizePending) { sceneResizePending = false; resize(); }
    if (!paused) elapsed += dt;
    let runOffset = 0;
    if (viewTransition) {
      const age = (performance.now() - viewTransition.started) / 1000;
      const raisingCase = isCase(viewTransition.to);
      const arrivingAbout = viewTransition.to === 'about';
      const lowerDuration = viewTransition.lowering ? 1.35 : 0;
      const travelDuration = arrivingAbout ? 2.35 : raisingCase || viewTransition.lowering ? 1.2 : 2.35;
      const total = arrivingAbout ? lowerDuration + travelDuration : raisingCase || viewTransition.lowering ? 2.95 : 2.35;
      const t = Math.min(1, Math.max(0, age - lowerDuration) / travelDuration), smooth = t * t * (3 - 2 * t);
      if (arrivingAbout && viewTransition.lowering && age >= lowerDuration && !viewTransition.lowered) {
        viewTransition.lowered = true;
        caseFor(view).hidden = true;
        main.dataset.casePage = 'false';
        main.dataset.view = 'about';
        main.classList.remove('is-lowering', 'is-case-travel');
        viewTransition.lowerMotions?.forEach(motion => motion.cancel());
        workLayer.visible = false;
        if (joel) joel.root.visible = true;
      }
      if (arrivingAbout && t >= .84 && joel && !viewTransition.welcomed) {
        joel.root.visible = true;
        viewTransition.welcomed = waveJoel();
      }
      setSceneProgress(THREE.MathUtils.lerp(viewTransition.fromProgress, viewTransition.to !== 'work' ? 1 : 0, smooth), THREE.MathUtils.lerp(viewTransition.fromPan, viewTransition.toPan, smooth), arrivingAbout && viewTransition.lowering ? smooth : THREE.MathUtils.lerp(viewTransition.fromProgress, viewTransition.to !== 'work' ? 1 : 0, smooth));
      runOffset = Math.sin(Math.PI * t) * .45 * viewTransition.direction;
      if (age >= (arrivingAbout ? lowerDuration + 1.05 : raisingCase ? 1.6 : viewTransition.lowering ? 1.35 : 1.05) && !viewTransition.revealed) {
        viewTransition.revealed = true;
        revealIncoming(viewTransition.to);
      }
      if (age >= total) {
        const arrived = viewTransition.to, welcomed = viewTransition.welcomed, revealed = viewTransition.revealed;
        viewTransition = null; applyView(arrived, revealed); main.classList.remove('is-traveling'); speech.setVisible(true); lastLine = elapsed;
        if (arrived === 'about' && !welcomed) loadJoel().then(() => { if (view === 'about') waveJoel(); });
        if (arrived === 'work') say('1', 'Back to the slides!');

        announcement.textContent = isCase(arrived) ? projects.find(project => project.kind === caseKinds[arrived]).title + ' case study' : arrived === 'about' ? 'About and contact' : 'Projects';
      }
    }
    if (!paused && view === 'work' && !viewTransition && !holeEvent.active && !mishap.type && elapsed >= mishap.nextAt) {
      mishap.type = mishap.count++ % 2 === 0 ? 'cone' : 'snacks';
      mishap.started = elapsed; mishap.nextAt = elapsed + 29 + (mishap.count % 2) * 7; mishap.spoken = false;
    }
    const mishapAge = mishap.type ? elapsed - mishap.started : -1;
    if (mishap.type && mishapAge > .55 && !mishap.spoken && !holeEvent.active) {
      const line = mishap.type === 'cone' ? 'That was a safety drill.' : 'Those were load-bearing snacks.';
      say(mishap.type === 'cone' ? '0' : '2', line); announcement.textContent = line;
      lastLine = elapsed; mishap.spoken = true;
    }
    if (mishap.type && mishapAge > 3.2) mishap.type = null;
    const move = Math.min(1, Math.max(0, (elapsed - .4) / 3.4)); const eased = 1 - (1 - move) ** 3;
    cart.position.x = THREE.MathUtils.lerp(8, 12, layout) * (1 - eased); cart.rotation.y = Math.sin(Math.PI * move) * -.045;
    slideWobble = paused ? 0 : Math.max(0, slideWobble - dt * 2.6);
    cart.rotation.z = Math.sin((1 - slideWobble) * Math.PI * 3) * slideWobble * .022;
    const slideAge = (performance.now() - slideCueAt) / 1000;
    const slidePulse = !paused && view === 'work' && !viewTransition && slideAge >= 0 && slideAge < 1.3 ? Math.sin(Math.PI * slideAge / 1.3) : 0;
    characters.forEach((c, i) => {
      const workHome = THREE.MathUtils.lerp([-3.5, 2.35, 3.55][i], THREE.MathUtils.lerp([-4.8, 3, 4.8][i], [-5.45, 3.25, 5.45][i], wide), layout);
      const aboutHome = THREE.MathUtils.lerp([-2.65, 0, 2.65][i], [-4.35, 0, 4.35][i], layout);
      const home = THREE.MathUtils.lerp(workHome, aboutHome, sceneProgress);
      if (i === 1) c.root.position.x = home + THREE.MathUtils.lerp(6, 9, layout) * (1 - eased); else c.root.position.x = home;
      c.root.position.x += scenePan;
      c.root.position.x += runOffset;
      c.root.position.z = i === 1 ? -.2 : -.65;
      if (!paused) {
        c.reaction = Math.min(2, c.reaction + dt);
        if (!viewTransition && elapsed >= c.nextIdleAt && c.idleOptions.length > 1) {
          c.idleIndex = (c.idleIndex + 1) % c.idleOptions.length;
          c.nextIdleAt = elapsed + 11 + i * 2;
        }
        if (view === 'work' && !viewTransition && !holeEvent.active && c.hasJump && elapsed >= c.nextHopAt) {
          c.jumpStarted = elapsed;
          c.nextHopAt = elapsed + (i === 0 ? 16 : 20);
        }
      }
      const t = elapsed - c.jumpStarted, jumping = view === 'work' && !viewTransition && c.hasJump && t >= 0 && t < 1.1;
      const placingTape = i !== 1 && elapsed < 3.5;
      c.root.position.y = placingTape || i === 1 && move < 1 ? 0 : jumping && t < .85 ? Math.sin(t / .85 * Math.PI) * .22 : 0;
      const watching = Math.min(1, Math.max(0, (elapsed - 3.2) / 1.8));
      const firstYaw = i === 1 ? -.13 : i === 0 ? .12 : -.12;
      const watchYaw = i === 0 ? .96 : -1.05;
      c.root.rotation.set(0, firstYaw + (watchYaw - firstYaw) * watching, 0);
      if (view === 'about' && !viewTransition) c.root.rotation.y = [-.35, 0, .35][i];
      if (viewTransition) c.root.rotation.y = Math.PI / 2 * viewTransition.direction;
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
      if (viewTransition?.to === 'work' && i !== 1) {
        const pickup = Math.max(0, Math.min(1, ((performance.now() - viewTransition.started) / 1000 - 1.72) / .58));
        c.root.rotation.z += (i === 0 ? -.18 : .18) * Math.sin(Math.PI * pickup);
      }
      if (mishap.type === 'cone' && i === 0 && mishapAge > 1.25 && mishapAge < 2.7) {
        const fix = Math.sin((mishapAge - 1.25) / 1.45 * Math.PI);
        c.root.position.x -= fix * .17; c.root.position.y += fix * .22; c.root.rotation.z -= fix * .13;
      }
      if (mishap.type === 'snacks' && i === 2 && mishapAge > .3 && mishapAge < 2.4) {
        c.root.rotation.z += Math.sin(mishapAge * 13) * .08 * (1 - mishapAge / 2.4);
      }
      if (slidePulse) {
        if (i === 1) { c.root.rotation.y += slidePulse * (slideCueManual ? .55 : .14); c.root.rotation.z -= slidePulse * (slideCueManual ? .12 : .045); c.root.position.y += slidePulse * (slideCueManual ? .1 : .035); }
        else c.root.rotation.y += slidePulse * (i === 0 ? .22 : -.22);
      }
      if (!paused && view === 'about' && !viewTransition) {
        const welcome = (performance.now() - aboutWelcomeAt) / 1000 - i * .1;
        if (welcome > 0 && welcome < .8) c.root.rotation.z += (i === 2 ? -1 : 1) * Math.sin(Math.PI * welcome / .8) * .16;
      }
      const presenting = i === 1 && c.hasGreeting && slideCueManual && slidePulse > 0;
      const state = viewTransition ? ((main.classList.contains('is-hoisting') || main.classList.contains('is-lowering') || (isCase(viewTransition.to) && (performance.now() - viewTransition.started) > 1200)) ? (c.hasGreeting ? 'greeting' : c.idleOptions[c.idleIndex]) : 'running') : presenting ? 'greeting' : i === 1 && move < 1 ? 'walking' : placingTape ? 'running' : jumping ? t < .4 ? 'jumping_up' : t < .85 ? 'falling_idle' : 'hard_landing' : c.idleOptions[c.idleIndex];
      if (!paused) c.actor.update(dt, state === 'running' && !c.hasRun ? c.hasWalk ? 'walking' : 'idle' : state === 'walking' && !c.hasWalk ? 'idle' : state);
    });
    audience.forEach((c, i) => {
      const start = 2.8 + i * .65, progress = Math.min(1, Math.max(0, (elapsed - start) / 2.1)), ease = 1 - (1 - progress) ** 3;
      const home = (i - 1) * THREE.MathUtils.lerp(1.15, 1.5, layout);
      c.root.position.set(home + (i % 2 ? 1 : -1) * THREE.MathUtils.lerp(5, 9, layout) * (1 - ease) + scenePan + runOffset, Math.sin(elapsed * 3 + i) * .025, THREE.MathUtils.lerp(2.7, 1.35, layout));
      const turn = Math.min(1, Math.max(0, (elapsed - start - 1.25) / 1.45));
      c.root.rotation.y = viewTransition ? Math.PI / 2 * viewTransition.direction : view === 'about' ? [-.15, 0, .15][i] : [2.45, Math.PI, 3.82][i] * turn + Math.sin(elapsed * .65 + i) * .07;
      c.root.rotation.z = c.reaction < 1 ? (i % 2 ? 1 : -1) * Math.sin(Math.PI * c.reaction) ** 2 * .52 : 0;
      if (slideCueManual && slidePulse) c.root.rotation.z += (i % 2 ? -1 : 1) * slidePulse * .09;
      if (!paused && view === 'about' && !viewTransition) {
        const welcome = (performance.now() - aboutWelcomeAt) / 1000 - i * .13;
        if (welcome > 0 && welcome < .9) {
          const wave = Math.sin(Math.PI * welcome / .9);
          c.root.position.y += wave * .2;
          c.root.rotation.z += (i % 2 ? -1 : 1) * wave * .24;
        }
      }
      if (!paused) c.reaction = Math.min(2, c.reaction + dt);
      if (!paused && !viewTransition && progress >= 1 && elapsed >= c.nextIdleAt) {
        c.idleIndex = (c.idleIndex + 1) % c.idleOptions.length;
        c.nextIdleAt = elapsed + 12 + i * 2;
      }
      if (!paused) c.actor.update(dt, viewTransition || progress < 1 ? 'walking' : c.idleOptions[c.idleIndex]);
      if (!c.arrived && progress >= 1) {
        c.arrived = true;
        if (!holeEvent.active && view === 'work' && i === 0) say('0', 'Wait—are they supposed to be behind the tape?');
        if (!holeEvent.active && view === 'work' && i === 2) say('2', 'It’s fine. I drew a second safety line in crayon.');
      }
    });
    if (joel) {
      const joelScene = viewTransition?.to === 'about' ? viewTransition.toPan : viewTransition && view === 'about' ? viewTransition.fromPan : scenePan;
      joel.root.position.set(joelScene + THREE.MathUtils.lerp(-1.65, -2.15, layout), 0, -.65);
      joel.root.rotation.y = -.12;
      if (!paused && (view === 'about' || viewTransition)) joel.mixer.update(dt);
    }
    if (holeEvent.active) {
      const age = (performance.now() - holeEvent.started) / 1000;
      trapHole.update(age, layout);
      const pullIn = (c, index) => {
        const delay = index * .12, centerZ = THREE.MathUtils.lerp(2.1, 1.45, layout);
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
    worksite.update(elapsed, mishap.type, mishapAge, holeEvent.active); scene.updateMatrixWorld(true);
    characters.forEach((c, index) => {
      if (!c.hat) return;
      if (c.hatMode === 'worn') {
        const point = c.headTop.getWorldPosition(new THREE.Vector3());
        c.hat.position.copy(c.root.worldToLocal(point)); c.hat.position.y += .07;
      }
      if (!viewTransition) { c.dust.update(-1, hatGroundPosition(index)); return; }
      const age = (performance.now() - viewTransition.started) / 1000;
      if (viewTransition.to === 'about') {
        if (c.hatMode === 'worn') {
          scene.updateMatrixWorld(true);
          workLayer.attach(c.hat);
          c.hatStart = c.hat.position.clone();
          c.hatStartRotation = c.hat.quaternion.clone();
          c.hatMode = 'dropping';
        }
        if (c.hatMode === 'dropping') {
          const p = Math.min(1, age / .58), ease = 1 - (1 - p) ** 3;
          c.hat.position.lerpVectors(c.hatStart, hatGroundPosition(index), ease);
          c.hat.position.y += Math.sin(Math.PI * p) * .34;
          c.hat.quaternion.slerpQuaternions(c.hatStartRotation, hatGroundRotation(index), ease);
          if (p >= 1) { c.hatMode = 'ground'; c.hatLandedAt = performance.now(); }
        }
      } else if (viewTransition.to === 'work' && age >= 1.72 && c.hatMode === 'ground') {
        c.hatStart = c.hat.position.clone();
        c.hatStartRotation = c.hat.quaternion.clone();
        c.hatMode = 'lifting';
      }
      if (c.hatMode === 'lifting') {
        const p = Math.min(1, Math.max(0, (age - 1.72) / .58)), ease = p * p * (3 - 2 * p);
        const point = c.headTop.getWorldPosition(new THREE.Vector3()); point.y += .07;
        c.hat.position.lerpVectors(c.hatStart, point, ease);
        c.hat.position.y += Math.sin(Math.PI * p) * .43;
        c.hat.quaternion.slerpQuaternions(c.hatStartRotation, c.root.getWorldQuaternion(new THREE.Quaternion()), ease);
        if (p >= 1) {
          c.root.add(c.hat);
          c.hat.quaternion.identity();
          c.hat.position.copy(c.root.worldToLocal(point));
          c.hatMode = 'worn';
        }
      }
      const dustAge = (performance.now() - c.hatLandedAt) / 850;
      c.dust.update(viewTransition.to !== 'work' ? dustAge : -1, hatGroundPosition(index));
    });
    if (view === 'work' && !viewTransition && !holeEvent.active && !paused && elapsed - lastLine > 9 && elapsed > 6) { lastLine = elapsed; guestLine = !guestLine; if (guestLine) say('guest-2', audienceLines[1 + (showing++ % (audienceLines.length - 1))]); else { const index = showing++ % 3; say(String(index), lines[index][characters[index].said++ % lines[index].length]); } }
    if (view === 'work' && !viewTransition && autoplay && !paused && !holeEvent.active && !isProjectPlayerOpen()) { projectElapsed += dt; if (projectElapsed >= PROJECT_DURATION) browseProject(1); }
    autoplayProgress.style.transform = `scaleX(${autoplay ? Math.min(1, projectElapsed / PROJECT_DURATION) : 0})`;
    updateSlideVideo(view === 'work' && !viewTransition && !paused && !document.hidden && !isProjectPlayerOpen());
    speech.update(paused ? 0 : dt, camera, (key, out) => { if (key === 'joel') { if (!joel || !joel.root.visible) return false; out.set(joel.root.position.x, JOEL_HEIGHT + .3, joel.root.position.z); return true; } if (key.startsWith('guest-')) { const c = audience[Number(key.slice(6))]; if (!c) return false; out.set(c.root.position.x, c.root.position.y + 1.65, c.root.position.z); return true; } const c = characters[Number(key)]; if (!c) return false; out.set(c.root.position.x, c.root.position.y + 2.55, c.root.position.z); return true; }, () => 1);
    renderer.render(scene, camera);
    if (openingReady) { openingReady = false; window.finishSiteSplash?.(); }
  });
}
init().catch(error => {
  console.error(error);
  document.querySelector('#loading').textContent = 'Our little friends are taking a breather. Their references are still excellent.';
  window.finishSiteSplash?.();
});
