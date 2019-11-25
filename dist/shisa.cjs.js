'use strict';

class Events {
  constructor() {
    this.audioEvents = [
      'abort', 'canplay', 'canplaythrough',
      'complete', 'durationchange', 'emptied',
      'ended', 'error', 'loadeddata',
      'loadedmetadata', 'loadstart', 'pause',
      'play', 'playing', 'progress', 'ratechange',
      'seeked', 'seeking', 'stalled', 'suspend',
      'timeupdate', 'volumechange', 'waiting'
     ];
    this.events = {};
  }

  on(name, callback) {
    if (!this.audioEvents.includes(name) || typeof callback !== 'function') {
      console.error('invalid event name or callback function');
    } else if (!this.events[name]) {
      this.events[name] = [];
    }
    this.events[name].push(callback);
  }

  trigger(name, data = {}) {
    if (this.events[name] && this.events[name].length) {
      this.events[name].forEach(fn => fn(data));
    }
  }
}

function play(el, shisa) {
  const name = 'data-play';
  el.classList.add('shisa-play');
  el.addEventListener('click', () => toggle());

  shisa.on('play', () => {
    el.setAttribute(name, 'play');
    shisa.el.classList.add('Playing');
    shisa.el.classList.remove('Paused');
  });
  shisa.on('pause', () => {
    el.setAttribute(name, 'pause');
    shisa.el.classList.add('Paused');
    shisa.el.classList.remove('Playing');
  });

  function toggle() {
    shisa.audio.paused ? shisa.play() : shisa.pause();
  }
}

function mute(el, shisa) {
  const name = 'data-muted';
  el.classList.add('shisa-mute');
  let muted = el.getAttribute(name);
  if (muted === '') {
    shisa.muted = true;
    shisa.el.classList.add('Muted');
  }

  el.addEventListener('click', () => {
    shisa.muted = !shisa.muted;
    shisa.muted ? el.setAttribute(name, '') : el.removeAttribute(name);
    shisa.el.classList.toggle('Muted');
  });
}

const _CONFIG = {
  min: 0.25,
  max: 5,
  step: 0.25,
};

function speed(el, shisa) {
  const name = 'data-speed';
  el.classList.add('shisa-speed');

  shisa.on('ratechange', () => {
    el.setAttribute(name, shisa.speed);
    el.textContent = numToString(shisa.speed) + 'x';
  });

  const rawData = {
    min: el.getAttribute(`${name}-min`),
    max: el.getAttribute(`${name}-max`),
    step: el.getAttribute(`${name}-step`),
  };

  const speedOptions = Object.keys(rawData).reduce((arr, k) => {
    arr[k] = rawData[k] && !isNaN(+rawData[k]) ? +rawData[k] : _CONFIG[k];
    if (rawData[k] !== arr[k]) {
      el.setAttribute(`${name}-${k}`, arr[k]);
    }
    return arr
  }, {});

  let speed = el.getAttribute(name);
  if ((!speed || typeof +speed !== 'number') && speed !== 0) {
    speed = shisa.audio.defaultPlaybackRate;
  }
  shisa.speed = Math.max(speedOptions.min, Math.min(speed, speedOptions.max));
  el.textContent = numToString(shisa.speed) + 'x';

  el.addEventListener('click', () => {
    shisa.speed = shisa.speed >= speedOptions.max ? speedOptions.min : Math.min(speedOptions.max, Math.max(speedOptions.min, shisa.speed + speedOptions.step));
  });
}

function numToString(num) {
  const float = parseFloat(num).toFixed(2);
  return float.slice(-1) === '0' ? float.slice(0, -1) : float
}

function spinner(el, shisa) {
  const name = 'data-buffering';
  el.classList.add('shisa-spinner');

  shisa.on('canplaythrough', () => {
    el.removeAttribute(name);
    shisa.el.classList.remove('Spinning');
  });
  shisa.on('waiting', () => {
    el.setAttribute(name, '');
    shisa.el.classList.add('Spinning');
  });
  shisa.on('seeking', () => {
    el.setAttribute(name, '');
    shisa.el.classList.add('Spinning');
  });
}

function controlTime(el, shisa) {
  el.classList.add('shisa-time');
  const attr = Array.from(el.attributes).find(v => {
    return /data-time-/.test(v.name)
  });
  if (!attr) return

  const type = attr.name.slice(10);
  if (type === 'current') {
    attr.value = el.textContent = secondToTime(shisa.currentTime);
    el.classList.add('shisa-time_current');
    shisa.on('timeupdate', () => {
      attr.value = el.textContent = secondToTime(shisa.currentTime);
    });
  } else if (type === 'duration') {
    attr.value = el.textContent = '--:--';
    el.classList.add('shisa-time_duration');
    shisa.on('loadedmetadata', () => {
      if (shisa.metadataIsFetched && shisa.duration) {
        attr.value = el.textContent = secondToTime(shisa.duration);
      }
    });
    shisa.on('durationchange', () => {
      if (shisa.duration !== -1) {
        attr.value = el.textContent = secondToTime(shisa.duration);
      }
    });
  }
}

function secondToTime(time) {
  time = Math.round(time);
  let hour = Math.floor(time / 3600);
  let min = Math.floor((time - hour * 3600) / 60);
  let sec = Math.floor(time - hour * 3600 - min * 60);
  min = min < 10 ? '0' + min : min;
  sec = sec < 10 ? '0' + sec : sec;
  if (hour === 0) {
    hour = hour < 10 ? '0' + hour : hour;
    return `${min}:${sec}`
  }
  return `${hour}:${min}:${sec}`
}

const _CONFIG$1 = {
  forward: 15,
  backward: 15,
};

function seek(el, shisa) {
  el.classList.add('shisa-seek');
  const attr = Array.from(el.attributes).find(v => {
    return /data-seek-/.test(v.name)
  });
  if (!attr) return
  const direction = attr.name.slice(10);
  let step = attr.value;

  if (direction === 'forward' || direction === 'backward') {
    step = step && !isNaN(+step) ? +step : _CONFIG$1[direction];
    attr.value = step;
    step = direction === 'forward' ? step : - step;
    el.addEventListener('click', () => {
      shisa.seek(shisa.currentTime + step);
    });
  }
}

function progress(el, shisa) {
  const name = 'data-progress';
  const bar = {
    buffer: null,
    play: null
  };
  el.classList.add('shisa-progress');

  Object.keys(bar).forEach(k => {
    bar[k] = document.createElement('div');
    bar[k].classList.add(`shisa-progress_${k}`);
    bar[k].setAttribute('aria-role', 'progressbar');
    bar[k].setAttribute('aria-readonly', '');
    bar[k].setAttribute('aria-valuemin', 0);
    bar[k].setAttribute('aria-valuemax', 1);
    el.append(bar[k]);
    setWidth(bar[k], 0);
  });

  shisa.on('progress', () => {
    if (shisa.metadataIsFetched && shisa.duration) {
      const value = shisa.audio.buffered.length ? shisa.audio.buffered.end(shisa.audio.buffered.length - 1) / shisa.duration : 0;
      setWidth(bar.buffer, value);
    }
  });

  shisa.on('loadedmetadata', () => {
    if (shisa.metadataIsFetched && shisa.duration) {
      const value = shisa.audio.currentTime / shisa.duration;
      setWidth(bar.play, value);
    }
  });

  shisa.on('timeupdate', () => {
    if (shisa.metadataIsFetched && shisa.duration) {
      const value = shisa.audio.currentTime / shisa.duration;
      setWidth(bar.play, value);
    }
  });

  shisa.on('ended', () => {
    shisa.audio.currentTime = 0;
  });

  let initSeek = null;
  let dragging = false;
  const slider = document.createElement('input');
  slider.setAttribute(`${name}-slider`, '');
  slider.classList.add('shisa-progress_slider');
  el.append(slider);
  slider.type = 'range';
  slider.min = 0;
  slider.max = 100;
  slider.value = 0;
  slider.step = 0.01;

  slider.addEventListener('input', () => {
    if (!dragging) {
      dragging = true;
    }
  });

  slider.addEventListener('change', () => {
    if (dragging) {
      dragging = false;
    }
    if (shisa.metadataIsFetched && shisa.duration) {
      shisa.seek(slider.value / slider.max * shisa.duration);
      slider.setAttribute('value', slider.value);
    } else {
      initSeek = slider.value;
    }
  });
  shisa.on('canplay', () => {
    if (initSeek && shisa.duration) {
      shisa.seek(initSeek / slider.max * shisa.duration);
      initSeek = null;
    }
  });
  shisa.on('timeupdate', () => {
    if (!dragging) {
      slider.value = shisa.currentTime / shisa.duration * slider.max;
      slider.setAttribute('value', slider.value);
    }
  });
 }

function setWidth(el, value) {
  el.style.width = `${value * 100}%`;
  el.setAttribute('aria-valuenow', value);
}

const BUILTIN_COMPS = {
  play,
  mute,
  speed,
  spinner,
  time: controlTime,
  seek,
  progress,
};

const REGISTERED_COMPS = {};

const DEFAULT_AUDIO_CONFIG = {
  preload: 'metadata',
  autoplay: false,
  defaultMuted: false,
  defaultPlaybackRate: '1.0',
};

class Shisa {
  constructor(el, src, options = {}) {
    this.el = el;
    this.el.classList.add('shisa');
    this.events = new Events();
    this.audio = new Audio();
    Object.assign(this.audio, DEFAULT_AUDIO_CONFIG, options);
    this.audio.src = src;
    this.el.classList.add('shisa_ready');
    this.metadataIsFetched = false;

    const els = this.el.querySelectorAll('[data-shisa]');
    for (let i = 0; i < els.length; i++) {
      this._renderComponent(els[i], this.audio);
    }

    this._initEvents();
    this.events.audioEvents.forEach(name => {
      this.audio.addEventListener(name, (e) => {
        this.events.trigger(name, e);
      });
    });
  }

  _renderComponent(el) {
    const name = el.getAttribute('data-shisa');
    const fn = BUILTIN_COMPS[name] || REGISTERED_COMPS[name];
    if (fn) {
      fn(el, this);
    }
  }

  _initEvents() {
    this.on('loadedmetadata', () => {
      this.metadataIsFetched = true;
    });
  }

  on(name, callback) {
    this.events.on(name, callback);
  }

  get currentTime() {
    return this.audio.currentTime
  }

  set currentTime(value) {
    this.audio.currentTime = value;
  }

  get duration() {
    return this.audio.duration
  }

  get muted() {
    return this.audio.muted
  }

  set muted(value) {
    this.audio.muted = value;
  }

  get speed() {
    return this.audio.playbackRate
  }

  set speed(value) {
    if (value && typeof +value === 'number') {
      this.audio.playbackRate = +value;
    }
  }

  seek(time) {
    time = parseInt(time);
    if (isNaN(time) || !isFinite(time)) {
      throw new Error('Seeking time is not a valid number.')
    } else {
      this.currentTime = time;
    }
  }

  play(src) {
    if (src) {
      this.audio.src = src;
    }
    if (!this.audio.paused) return
    const promise = this.audio.play();
    if (promise !== undefined) {
      promise.catch((e) => {
        if (e.name === 'NotAllowedError' || e.name === 'NotSupportedError') {
          this.pause();
        }
      });
    }
  }

  pause() {
    if (this.audio.paused) return
    this.audio.pause();
  }

  destroy() {
    this.audio.pause();
    this.audio.src = '';
    this.audio.load();
    this.audio = null;
  }
}

Shisa.register = function(name, fn) {
  REGISTERED_COMPS[name] = fn;
};

window.Shisa = Shisa;

console.log(`%c Built w/Shisa Podcast Player v0.0.1 %c https://jessuni.github.io/shisa/`,'color:#555;padding:4px 0','padding: 2px 0;');

module.exports = Shisa;
