const names = ['teto', 'inicio', 'miku'];
const track = document.querySelector('#track');
const screens = [...document.querySelectorAll('.screen')];
function showView(focus = true) {
  const requested = location.hash.slice(1);
  const view = names.includes(requested) ? requested : 'inicio';
  document.body.dataset.view = view;
  track.style.transform = `translateX(-${names.indexOf(view) * 100 / 3}%)`;
  document.querySelector('#viewport').scrollLeft = 0;
  screens.forEach(screen => { screen.inert = screen.id !== view; });
  if (focus) {
    document.querySelector(`#${view} h1`).focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
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
