export default function controlTime(el, audio, ctx) {
  const name = 'data-shisa-time'
  const current = el.querySelector(`[${name}-current]`)
  const duration = el.querySelector(`[${name}-duration]`)

  if (current) {
    current.setAttribute(`${name}-current`, '00:00')
    ctx.on('timeupdate', () => {
      current.setAttribute(`${name}-current`, secondToTime(ctx.currentTime))
    })
  }

  if (duration) {
    duration.setAttribute(`${name}-duration`, '--:--')
    ctx.on('loadedmetadata', () => {
      if (ctx.metadataIsFetched && ctx.duration) {
        duration.setAttribute(`${name}-duration`, secondToTime(ctx.duration))
      }
    })
  }
}

function secondToTime(time) {
  time = Math.round(time)
  let hour = Math.floor(time / 3600)
  let min = Math.floor((time - hour * 3600) / 60)
  let sec = Math.floor(time - hour * 3600 - min * 60)
  min = min < 10 ? '0' + min : min
  sec = sec < 10 ? '0' + sec : sec
  if (hour === 0) {
    hour = hour < 10 ? '0' + hour : hour
    return `${min}:${sec}`
  }
  return `${hour}:${min}:${sec}`
}
