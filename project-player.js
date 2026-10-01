const dialog = document.querySelector('#project-player');
const content = dialog.querySelector('.player-content');
const title = dialog.querySelector('#player-title');
const source = dialog.querySelector('#player-source');
const fullscreenButton = dialog.querySelector('.player-fullscreen');
let ownsFullscreen = false;
const supportsFullscreen = () => document.fullscreenEnabled && document.documentElement.requestFullscreen;

function setExpanded(expanded) {
  dialog.classList.toggle('is-expanded', expanded);
  fullscreenButton.setAttribute('aria-pressed', String(expanded));
  fullscreenButton.textContent = expanded ? 'Exit full screen' : supportsFullscreen() ? 'Full screen' : 'Fill screen';
}

async function leaveFullscreen() {
  setExpanded(false);
  if (ownsFullscreen && document.fullscreenElement) {
    try { await document.exitFullscreen(); } catch { /* Keep the close control usable. */ }
  }
  ownsFullscreen = false;
}

fullscreenButton.addEventListener('click', async () => {
  if (dialog.classList.contains('is-expanded')) {
    await leaveFullscreen();
    return;
  }
  setExpanded(true);
  if (supportsFullscreen() && !document.fullscreenElement) {
    try {
      // A dialog cannot itself request fullscreen. Its modal stays above the page.
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      ownsFullscreen = true;
      if (!dialog.open) await leaveFullscreen();
    } catch { /* The expanded viewport layout also works without native fullscreen. */ }
  }
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && ownsFullscreen) {
    ownsFullscreen = false;
    setExpanded(false);
  }
});
dialog.addEventListener('cancel', event => {
  if (dialog.classList.contains('is-expanded')) {
    event.preventDefault();
    void leaveFullscreen();
  }
});

export function isProjectPlayerOpen() {
  return dialog.open;
}

export function openProjectPlayer(project) {
  if (!(project.embed || project.play || project.localVideo) || dialog.open) return;
  title.textContent = project.title;
  source.parentElement.hidden = !!project.play;
  if (project.video) source.href = project.video;
  dialog.classList.toggle('is-game', !!(project.play || project.localVideo));
  fullscreenButton.hidden = !(project.play || project.localVideo);
  setExpanded(false);
  if (project.localVideo) {
    const video = document.createElement('video');
    video.src = project.localVideo;
    video.controls = true; video.playsInline = true; video.autoplay = true;
    video.setAttribute('aria-label', project.title + ' video');
    content.replaceChildren(video);
  } else {
  const frame = document.createElement('iframe');
  frame.title = `${project.title} — ${project.play ? 'playable game' : 'project video'}`;
  frame.src = project.play || project.embed;
  frame.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  content.replaceChildren(frame);
  }
  dialog.showModal();
  document.body.classList.add('player-open');
}

dialog.querySelector('.player-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  void leaveFullscreen();
  content.querySelectorAll('video').forEach(video => video.pause());
  content.replaceChildren();
  document.body.classList.remove('player-open');
});
