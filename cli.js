const { program } = require('commander');
const fs = require('fs');

const createSpriteWithVTT = require('./index');

program
  .description('Takes a video and creates a thumbnail sprite with corresponding vtt for progress preview thumbnails')
  .requiredOption('-i, --input <type>', 'Path to the video that thumbnails will be created for')
  .option('--outputFolder <type>', 'Path to the folder where the thumbnail sprite/s and vtt will be saved')
  .option('--filename <type>', 'Name of the output files, by default it will be ${filename}_sprite.webp and ${filename}_sprite.vtt')
  .option('--interval <type>', 'Integer representing the interval in seconds between screenshots (aka 2 is once every 2 seconds)', '2')
  .option('--prependPath <type>', 'Used in the webvtt to build paths to where the sprite thumbnail/s will be served')
  .option('--thumbnailSize <type>', 'Instead of setting height/width (px), set the longest side and an algorithm will calculate the other', '140')
  .option('--targetSize <type>', 'Targeted maximum size when splitting the sprite image, in kb', '80')
  .option('--columns <type>', 'I don\'t know what difference it makes but you can change it', '9')
  .option('--debug', 'Logs a bunch of stuff and preserves the files as they\'re created')

program.parse();

const options = program.opts();

const {
  input: inputFilePath,
  filename,
  outputFolder,
  prependPath,
  debug,
  interval: intervalInSecondsAsInteger,
  thumbnailSize: thumbnailLongestSide,
  targetSize: targetSizeInKb,
  columns,
} = options;

// // output variables
const spriteFileName = `${filename}_sprite.webp`;
const vttFileName = `${filename}_sprite.vtt`;

fs.mkdirSync(outputFolder, { recursive: true });

// // where to output the files
const spriteOutputFilePath = `${outputFolder}/${spriteFileName}`;
const webVTTOutputFilePath = `${outputFolder}/${vttFileName}`;

if(debug){
  console.log(`inputFile: ${inputFilePath}`)
  console.log(`spriteOutputFilePath: ${spriteOutputFilePath}`)
  console.log(`webVTTOutputFilePath: ${webVTTOutputFilePath}`)
  console.log(`intervalInSecondsAsInteger: ${intervalInSecondsAsInteger}`)
  console.log(`prependPath: ${prependPath}`)
  console.log(`filename: ${filename}`)
  console.log(`spriteFileName: ${spriteFileName}`)
  console.log(`targetSizeInKb: ${targetSizeInKb}`)
  console.log(`thumbnailLongestSide: ${thumbnailLongestSide}`)
  console.log(`columns: ${columns}`)
}

// createSpriteWithVTT({
//   inputFilePath,
//   filename,
//   spriteFileName,
//   spriteOutputFilePath,
//   webVTTOutputFilePath,
//   prependPath,
//   intervalInSecondsAsInteger,
//   columns,
//   thumbnailLongestSide,
//   targetSizeInKb,
//   debug,
//   outputFolder
// })

// Example to use: $ node cli.js --input './examples/assets/video.mp4' --outputFolder './assets' --filename example --debug --prependPath '.'
