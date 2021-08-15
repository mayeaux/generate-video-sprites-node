const { getVideoDurationInSeconds } = require('get-video-duration')
const Vtt = require('vtt-creator');
const fs = require('fs');
const spawn = require('child_process').spawn;

process.on('unhandledRejection', console.log)

/**
 * Creates a VTT file given an amount of seconds, width, height, columns. Written to an out path.
 * @param videoDurationInSeconds
 * @param height
 * @param width
 * @param columns
 * @param spriteOutputFilePath
 * @param outputFile
 * @returns {string}
 */
function createVTT({ videoDurationInSeconds, height, width, columns, spriteOutputFilePath, outputFile }){
  const v = new Vtt();

  const createdArray = Array.from({length: videoDurationInSeconds}, (_, i) => i + 1)

  for(const thumbnailNumber of createdArray){
    const row = Math.ceil(thumbnailNumber/columns)
    let column = thumbnailNumber % columns
    if(column === 0) column = column + columns
    const xValue = ( column * width ) - width
    const yValue = ( row * height ) - height

    // TODO: turn thumbnailNumber into seconds, right now it's hardcoded expecting 1 thumbnail per second
    // add line to webvtt file
    v.add(thumbnailNumber - 1, thumbnailNumber,`${spriteOutputFilePath}#xywh=${xValue},${yValue},${width},${height}`);
  }

  fs.writeFileSync(outputFile, v.toString());

  return 'completed'

}

/**
 * Takes a video and outputs a sprite image when below parameters are defined
 * @param pathToGenerator
 * @param inputFilePath
 * @param width - in pixels
 * @param height - in pixels
 * @param intervalInSeconds
 * @param columns
 * @param outputFilePath
 * @returns {Promise<string>}
 */
async function createSprite({pathToGenerator, inputFilePath, width, height, intervalInSeconds, columns, outputFilePath }) {
  const child = spawn(pathToGenerator, argumentsArray);

  let data = "";
  // TODO: check for error here
  for await (const chunk of child.stdout) {
    console.log('stdout chunk: '+chunk);
    data += chunk;
  }
  let error = "";
  for await (const chunk of child.stderr) {
    console.error('stderr chunk: '+chunk);
    error += chunk;
  }
  const exitCode = await new Promise( (resolve, reject) => {
    child.on('close', resolve);
  });

  if( exitCode) {
    throw new Error( `subprocess error exit ${exitCode}, ${error}`);
  }
  return data;
}

const channelName = 'anthony'
const uploadTag = '2fd233sdd'

const spriteOutputFile = `output/${uploadTag}.png`

const inputFile =  './output/sample.mp4';
const intervalInSecondsAsInteger = 1;
const widthInPixels = 300;
const heightInPixels = 200;
const columns = 10;

// arguments array for the generator
let argumentsArray = [];
argumentsArray[0] = inputFile
argumentsArray[1] = intervalInSecondsAsInteger
argumentsArray[2] = widthInPixels
argumentsArray[3] = heightInPixels
argumentsArray[4] = columns;
argumentsArray[5] = spriteOutputFile;

const pathToGenerator = './generator'
const webVTTOutputPath = `./output/${uploadTag}.vtt`

const spriteOutputFilePath = `/uploads/${channelName}/${uploadTag}-sprite.png`

/**
 * Main exported function that is used to compile the sprite/webvtt
 * @param inputFile - path to the video to have sprites/webvtt created from
 * @param intervalInSecondsAsInteger
 * @param widthInPixels
 * @param heightInPixels
 * @param columns
 * @param spriteOutputFilePath
 * @param webVTTOutputPath
 * @returns {Promise<void>}
 */
async function createSpriteAndThumbnails(inputFile, intervalInSecondsAsInteger, widthInPixels, heightInPixels, columns, spriteOutputFilePath, webVTTOutputPath){
  try {

    const videoDurationInSeconds = Math.round(await getVideoDurationInSeconds(inputFile));

    const response = await createSprite({ pathToGenerator, argumentsArray });
    console.log(response)

    const cttResponse = createVTT({ videoDurationInSeconds, height: heightInPixels, width: widthInPixels, columns, spriteOutputFilePath, outputFile: webVTTOutputPath})
    console.log(cttResponse)

  } catch (err){
    console.log(err);
  }
}

// createSpriteAndThumbnails()

module.exports = createSpriteAndThumbnails
