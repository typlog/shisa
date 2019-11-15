export default function buffering(el, audio, ctx) {
  const name = 'data-shisa-buffering'
  ctx.on('canplaythrough', () => {
    el.removeAttribute(name)
  })
  ctx.on('waiting', () => {
    el.setAttribute(name, '')
  })
  ctx.on('seeking', () => {
    el.setAttribute(name, '')
  })
}
