const createSpriteWithVTT = require('./index')
/** input and output paths **/
// used in the paths, could use different names if you want
const filename = 'extrawelt'

// the file to create sprite and vtt from
const inputFile = `./videos/${filename}.mp4`   ;

const spriteFileName = `${filename}_sprite.webp`;
const vttFileName = `${filename}_sprite.vtt`;

// where to output the files
const spriteOutputFilePath = `./output/${spriteFileName}`;
const webVTTOutputFilePath = `./output/${vttFileName}`;

// used in building the path for sprite prepend
// (aka where the sprite image will be served from)
const prependPath = '.'

/**  variables to setup the output of the sprite/vtt **/
// how often should a snapshot be taken
const intervalInSecondsAsInteger = 2;

// in pixels
const thumbnailLongestSide = 140;

const targetSizeInKb = 80;

// how many columns to use, seems arbitrary so I'll use 9
const columns = 9;

console.log(`inputFile: ${inputFile}`)
console.log(`intervalInSecondsAsInteger: ${intervalInSecondsAsInteger}`)
console.log(`columns: ${columns}`)
console.log(`spriteOutputFilePath: ${spriteOutputFilePath}`)
console.log(`prependPath: ${prependPath}`)
console.log(`filename: ${filename}`)
console.log(`spriteFileName: ${spriteFileName}`)

createSpriteWithVTT({
  pathToGenerator: './generator',
  inputFile,
  intervalInSecondsAsInteger,
  columns,
  spriteOutputFilePath,
  webVTTOutputFilePath,
  prependPath,
  filename,
  spriteFileName,
  debug: true,
  thumbnailLongestSide,
  targetSizeInKb,
})
