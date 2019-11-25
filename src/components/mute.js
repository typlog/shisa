export default function mute(el, shisa) {
  const name = 'data-muted'
  el.classList.add('shisa-mute')
  let muted = el.getAttribute(name)
  if (muted === '') {
    shisa.muted = true
    shisa.el.classList.add('Muted')
  }

  el.addEventListener('click', () => {
    shisa.muted = !shisa.muted
    shisa.muted ? el.setAttribute(name, '') : el.removeAttribute(name)
    shisa.el.classList.toggle('Muted')
  })
}
