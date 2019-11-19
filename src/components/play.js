export default function play(el, shisa) {
  const name = 'data-play'
  el.classList.add('shisa-play')
  el.addEventListener('click', () => toggle())

  shisa.on('play', () => {
    el.setAttribute(name, 'play')
    shisa.el.classList.add('shisa-play_playing')
    shisa.el.classList.remove('shisa-play_paused')
  })
  shisa.on('pause', () => {
    el.setAttribute(name, 'pause')
    shisa.el.classList.add('shisa-play_paused')
    shisa.el.classList.remove('shisa-play_playing')
  })

  function toggle() {
    shisa.audio.paused ? shisa.play() : shisa.pause()
  }
}
