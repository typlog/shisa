export default function mute(el, audio, ctx) {
  const name = 'data-muted'
  let muted = el.getAttribute(name)
  if (muted === '') {
    ctx.muted = true

  }

  el.addEventListener('click', () => {
    ctx.muted = !ctx.muted
    ctx.muted ? el.setAttribute(name, '') : el.removeAttribute(name)
  })
}
