const names = ['teto', 'inicio', 'miku', 'neru'];
const track = document.querySelector('#track');
const screens = [...document.querySelectorAll('.screen')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const posePlayers = [];
let entrance;
function resetEntrance() {
  if (!window.gsap) return;
  entrance?.kill();
  gsap.set('.detail-copy > :not(.back)', { clearProps: 'opacity,transform' });
}
function showView(focus = true) {
  const requested = location.hash.slice(1);
  const view = names.includes(requested) ? requested : 'inicio';
  const changed = document.body.dataset.view !== view;
  resetEntrance();
  posePlayers.forEach(player => player.setTarget(0, true));
  document.body.dataset.view = view;
  track.style.transform = `translateX(-${names.indexOf(view) * 100 / names.length}%)`;
  document.querySelector('#viewport').scrollLeft = 0;
  screens.forEach(screen => { screen.inert = screen.id !== view; });
  if (focus) {
    document.querySelector(`#${view} h1`).focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  if (focus && changed && view !== 'inicio' && window.gsap && !reducedMotion.matches) {
    const copy = document.querySelector(`#${view} .detail-copy`);
    entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
    entrance.fromTo(copy.querySelectorAll('h1, .fullname, .intro'),
      { y: 12, opacity: 0.45 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, clearProps: 'opacity,transform' }, 0.3);
    entrance.fromTo(copy.querySelectorAll('.capability'),
      { x: view === 'teto' ? -10 : 10, opacity: 0.6 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.06, clearProps: 'opacity,transform' }, 0.5);
  }
}
reducedMotion.addEventListener('change', resetEntrance);
window.addEventListener('hashchange', () => showView());
window.addEventListener('popstate', () => showView());
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    history.pushState(null, '', link.hash);
    showView();
  });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && location.hash !== '#inicio') {
    history.pushState(null, '', '#inicio');
    showView();
  }
});
showView(false);
requestAnimationFrame(() => {
  requestAnimationFrame(() => { document.body.dataset.ready = 'true'; });
});

function createPosePlayer(draw, clock = window) {
  const duration = 1500;
  let progress = 0;
  let target = 0;
  let previousTime = 0;
  let request = null;
  function render() { draw(progress * progress * (3 - 2 * progress)); }
  function tick(time) {
    const step = Math.max(0, time - previousTime) / duration;
    previousTime = time;
    progress = target > progress ? Math.min(target, progress + step) : Math.max(target, progress - step);
    render();
    request = progress === target ? null : clock.requestAnimationFrame(tick);
  }
  function setTarget(next, immediate = false) {
    target = next;
    if (immediate || reducedMotion.matches) {
      if (request !== null) clock.cancelAnimationFrame(request);
      request = null;
      progress = target;
      render();
    } else if (request === null && progress !== target) {
      previousTime = clock.performance.now();
      request = clock.requestAnimationFrame(tick);
    }
  }
  render();
  return { setTarget, finish() { setTarget(target, true); } };
}
reducedMotion.addEventListener('change', () => posePlayers.forEach(player => player.finish()));
document.querySelectorAll('.pose-animation').forEach(async canvas => {
  const member = canvas.closest('.team-member');
  const image = new Image();
  image.src = portraitMotion[canvas.dataset.character].image;
  member.classList.add('motion-loading');
  try {
    await image.decode();
    const draw = createPortraitRenderer(canvas, image, portraitMotion[canvas.dataset.character]);
    if (!draw) return;
    const player = createPosePlayer(draw);
    posePlayers.push(player);
    member.classList.add('motion-ready');
    canvas.addEventListener('webglcontextlost', () => {
      player.setTarget(0, true);
      member.classList.remove('motion-ready');
    });
    member.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') player.setTarget(1); });
    member.addEventListener('pointerleave', () => { if (!member.matches(':focus-visible')) player.setTarget(0); });
    member.addEventListener('focus', () => player.setTarget(1));
    member.addEventListener('blur', () => { if (!member.matches(':hover')) player.setTarget(0); });
    if (member.matches(':focus-visible, :hover')) player.setTarget(1);
  } catch {} finally {
    member.classList.remove('motion-loading');
  }
});
