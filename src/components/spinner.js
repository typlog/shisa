export default function spinner(el, shisa) {
  const name = 'data-buffering'
  el.classList.add('shisa-spinner')

  shisa.on('canplaythrough', () => {
    el.removeAttribute(name)
    shisa.el.classList.remove('Spinning')
  })
  shisa.on('waiting', () => {
    el.setAttribute(name, '')
    shisa.el.classList.add('Spinning')
  })
  shisa.on('seeking', () => {
    el.setAttribute(name, '')
    shisa.el.classList.add('Spinning')
  })
}
