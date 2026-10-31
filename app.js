const names = ['teto', 'inicio', 'miku', 'neru'];
const track = document.querySelector('#track');
const screens = [...document.querySelectorAll('.screen')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
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
