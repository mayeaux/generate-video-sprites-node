const { program } = require('commander');
const fs = require('fs');

const generateHoverThumbnail = require('./generateHoverThumbnail');

program
  .description('Takes a path to a video and outputs a .webp file that is a 5 second thumbnail at 2x speed (2.5 seconds total)')
  .requiredOption('-i, --inputFilePath <type>', 'Path to the video that the .webp hover thumbnail will be created for')
  .requiredOption('--outputFolder <type>', 'Path to the folder where the hover thumbnail .webp file will be outputted')
  .requiredOption('--filename <type>', 'Filename to be declared (so it will output ${filename}.webp at the outputPath')
  .option('--debug', 'Logs a bunch of stuff and preserves the files as they\'re created')

program.parse();

const options = program.opts();

const {
  inputFilePath,
  filename,
  outputFolder,
  debug,
} = options;

fs.mkdirSync(outputFolder, { recursive: true });

if(debug){
  console.log(`inputFilePath: ${inputFilePath}`)
  console.log(`filename: ${filename}`)
  console.log(`outputFolder: ${outputFolder}`)
  console.log(`debug: ${debug}`)
}

generateHoverThumbnail({
  inputFilePath,
  filename,
  outputFolder,
  debug,
})

// Example to use:

// Without debug
// $ node generate-hover-thumbnail-cli.js --inputFilePath './examples/assets/video.mp4' --outputFolder './examples/assets' --filename video

// With debug (logs and processed files)
// $ node generate-hover-thumbnail-cli.js --inputFilePath './examples/assets/video.mp4' --outputFolder './examples/assets' --filename video --debug

// cd examples && http-server -c-1
