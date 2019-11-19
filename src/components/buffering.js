export default function buffering(el, shisa) {
  const name = 'data-buffering'
  shisa.on('canplaythrough', () => {
    el.removeAttribute(name)
    shisa.el.classList.remove('shisa_buffering')
  })
  shisa.on('waiting', () => {
    el.setAttribute(name, '')
    shisa.el.classList.add('shisa_buffering')
  })
  shisa.on('seeking', () => {
    el.setAttribute(name, '')
    shisa.el.classList.add('shisa_buffering')
  })
}
