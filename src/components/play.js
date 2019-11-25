export default function play(el, shisa) {
  const name = 'data-play'
  el.classList.add('shisa-play')
  el.addEventListener('click', () => toggle())

  shisa.on('play', () => {
    el.setAttribute(name, 'play')
    shisa.el.classList.add('Playing')
    shisa.el.classList.remove('Paused')
  })
  shisa.on('pause', () => {
    el.setAttribute(name, 'pause')
    shisa.el.classList.add('Paused')
    shisa.el.classList.remove('Playing')
  })

  function toggle() {
    shisa.audio.paused ? shisa.play() : shisa.pause()
  }
}
