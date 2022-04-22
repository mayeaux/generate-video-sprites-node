const createSpriteWithVTT = require('./index')
const fs = require("fs");
/** input and output paths **/
// used in the paths, could use different names if you want

// the file to create sprite and vtt from
const inputFilePath = `./videos/extrawelt.mp4`   ;

// output variables
const filename = 'extrawelt'
const spriteFileName = `${filename}_sprite.webp`;
const vttFileName = `${filename}_sprite.vtt`;

const outputFileDirectory = './processed';
fs.mkdirSync(outputFileDirectory, { recursive: true });

// where to output the files
const spriteOutputFilePath = `${outputFileDirectory}/${spriteFileName}`;
const webVTTOutputFilePath = `${outputFileDirectory}/${vttFileName}`;

// used in building the path for sprite prepend
// (aka where the sprite image will be served from)
const prependPath = '.'

/**  variables to setup the output of the sprite/vtt **/
// how often should a snapshot be taken
const intervalInSecondsAsInteger = 2;

// in pixels
const thumbnailLongestSide = 140;

// will clip the sprite file to a maximum of this size
const targetSizeInKb = 80;

// how many columns to use, seems arbitrary so will use 9
const columns = 9;

const debug = true;

if(debug){
  console.log(`inputFile: ${inputFilePath}`)
  console.log(`intervalInSecondsAsInteger: ${intervalInSecondsAsInteger}`)
  console.log(`columns: ${columns}`)
  console.log(`spriteOutputFilePath: ${spriteOutputFilePath}`)
  console.log(`prependPath: ${prependPath}`)
  console.log(`filename: ${filename}`)
  console.log(`spriteFileName: ${spriteFileName}`)
}

createSpriteWithVTT({
  inputFilePath,
  filename,
  spriteFileName,
  spriteOutputFilePath,
  webVTTOutputFilePath,
  prependPath,
  intervalInSecondsAsInteger,
  columns,
  thumbnailLongestSide,
  targetSizeInKb,
  debug,
})
