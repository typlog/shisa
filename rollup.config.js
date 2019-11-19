import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import minify from 'rollup-plugin-babel-minify'
import replace from '@rollup/plugin-replace'
import pkg from './package.json'

const CONSOLE_CODE = `console.log(\`Shisa v${pkg.version} %c https://jessuni.github.io/shisa/\``

const output = {
  file: 'dist/shikwasa.js',
  format: process.env.FORMAT,
}

const plugins = [
  replace({
    include: './src/main.js',
    delimiters: ['/** ', ' */'],
    'CONSOLE_MSG': CONSOLE_CODE,
  }),
  postcss({
    extract: true,
    minimize: true,
    plugins: [
      autoprefixer()
    ],
  })
]

if (process.env.FORMAT === 'iife') {
  output.file = 'dist/shisa.min.js'
  output.name = 'Shisa'
  plugins.push(minify({
    comments: false,
    banner: false,
    sourceMap: false,
  }))
} else if (process.env.FORMAT === 'cjs') {
  output.file = 'dist/shisa.cjs.js'
}

module.exports = {
  input: 'src/main.js',
  output,
  plugins,
}
