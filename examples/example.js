const createSpriteWithVTT = require('../index')
/** input and output paths **/
// used in the paths, could use different names if you want
const filename = 'hABy9sJ'

// the file to create sprite and vtt from
const inputFile = `./videos/${filename}.mp4`;

const spriteFileName = `${filename}_sprite.png`;
const vttFileName = `${filename}_sprite.vtt`;

// where to output the files
const spriteOutputFilePath = `./output/${spriteFileName}`;
const webVTTOutputFilePath = `./output/${vttFileName}`;

// used in building the path for sprite prepend
// (aka where the sprite image will be served from)
const prependPath = '.'

/**  variables to setup the output of the sprite/vtt **/
// how often should a snapshot be taken
const intervalInSecondsAsInteger = 3;

// TODO: generate aspect ratio properly
// size of the hover image
const widthInPixels = 400;
const heightInPixels = 250;

// how many columns to use, seems arbitrary so I'll use 5
const columns = 5;

console.log(`inputFile: ${inputFile}`)
console.log(`intervalInSecondsAsInteger: ${intervalInSecondsAsInteger}`)
console.log(`widthInPixels: ${widthInPixels}`)
console.log(`heightInPixels: ${heightInPixels}`)
console.log(`columns: ${columns}`)
console.log(`spriteOutputFilePath: ${spriteOutputFilePath}`)
console.log(`prependPath: ${prependPath}`)
console.log(`filename: ${filename}`)
console.log(`spriteFileName: ${spriteFileName}`)

createSpriteWithVTT({
  pathToGenerator: './generator',
  inputFile,
  intervalInSecondsAsInteger,
  widthInPixels, heightInPixels, columns,
  spriteOutputFilePath,
  webVTTOutputFilePath,
  prependPath,
  filename,
  spriteFileName
})

