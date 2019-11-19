export default function mute(el, shisa) {
  const name = 'data-muted'
  let muted = el.getAttribute(name)
  if (muted === '') {
    shisa.muted = true
    shisa.el.classList.add('shisa_muted')
  }

  el.addEventListener('click', () => {
    shisa.muted = !shisa.muted
    shisa.muted ? el.setAttribute(name, '') : el.removeAttribute(name)
    shisa.el.classList.toggle('shisa_muted')
  })
}
