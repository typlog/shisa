const _CONFIG = {
  forward: 15,
  backward: 15,
}

export default function seek(el, audio, ctx, options = {}) {
  const name = 'data-shisa-seek'
  const seekForward = el.querySelector(`[${name}-forward]`)
  const seekBackward = el.querySelector(`[${name}-backward]`)

  if (seekForward) {
    let forwardTime = seekForward.getAttribute(`${name}-forward`)
    forwardTime = forwardTime && !isNaN(+forwardTime) ? +forwardTime : options.forward || _CONFIG.forward
    seekForward.setAttribute(`${name}-forward`, forwardTime)

    seekForward.addEventListener('click', () => {
      ctx.seek(ctx.currentTime + forwardTime)
    })
  }

  if (seekBackward) {
    let backwardTime = seekBackward.getAttribute(`${name}-backward`)
    backwardTime = backwardTime && !isNaN(+backwardTime) ? +backwardTime : options.backward || _CONFIG.backward
    seekBackward.setAttribute(`${name}-backward`, backwardTime)

    seekBackward.addEventListener('click', () => {
      ctx.seek(ctx.currentTime - backwardTime)
    })
  }
}
