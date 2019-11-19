export default function play(el, shisa) {
  const name = 'data-play'
  el.addEventListener('click', () => toggle())

  shisa.on('play', () => {
    el.setAttribute(name, 'play')
    shisa.el.classList.add('shisa_play')
    shisa.el.classList.remove('shisa_pause')
  })
  shisa.on('pause', () => {
    el.setAttribute(name, 'pause')
    shisa.el.classList.add('shisa_pause')
    shisa.el.classList.remove('shisa_play')
  })

  function toggle() {
    shisa.audio.paused ? shisa.play() : shisa.pause()
  }
}
