export default function spinner(el, shisa) {
  const name = 'data-buffering'
  el.classList.add('shisa-spinner')

  shisa.on('canplaythrough', () => {
    el.removeAttribute(name)
    shisa.el.classList.remove('shisa-spinner_spinning')
  })
  shisa.on('waiting', () => {
    el.setAttribute(name, '')
    shisa.el.classList.add('shisa-spinner_spinning')
  })
  shisa.on('seeking', () => {
    el.setAttribute(name, '')
    shisa.el.classList.add('shisa-spinner_spinning')
  })
}
