export default function play(el, audio, ctx) {
  const name = 'data-shisa-play'
  el.addEventListener('click', () => toggle())

  ctx.on('play', () => {
    el.setAttribute(name, 'play')
  })
  ctx.on('pause', () => {
    el.setAttribute(name, 'pause')
  })

  function toggle() {
    audio.paused ? ctx.play() : ctx.pause()
  }
}
