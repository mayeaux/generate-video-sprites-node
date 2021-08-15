const { getVideoDurationInSeconds } = require('get-video-duration')
const Vtt = require('vtt-creator');
const fs = require('fs');
const spawn = require('child_process').spawn;

/**
 * Creates a VTT file given an amount of seconds, width, height, columns. Written to an out path.
 * @param videoDurationInSeconds
 * @param height
 * @param width
 * @param columns
 * @param prependForVTT
 * @param outputFile
 * @returns {string}
 */
function createVTT({ videoDurationInSeconds, height, width, columns, prependForVTT, outputFile }){
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
    v.add(thumbnailNumber - 1, thumbnailNumber,`${prependForVTT}${xValue},${yValue},${width},${height}`);
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
const uploadTag = '2fd233d'

const spriteOutputFile = `output/${uploadTag}.png`

// have to keep this order to not brick the implementation
const objectForArray = {
  inputFile : './output/sample.mp4',
  intervalInSecondsAsInteger: 1,
  widthAsInteger: 300,
  heightAsInteger: 200,
  columns: 10,
  fileOutputPath: spriteOutputFile
}

// arguments array for the generator
let argumentsArray = [];
argumentsArray[0] = objectForArray.inputFile;
argumentsArray[1] = objectForArray.intervalInSecondsAsInteger;
argumentsArray[2] = objectForArray.widthAsInteger;
argumentsArray[3] = objectForArray.heightAsInteger;
argumentsArray[4] = objectForArray.columns;
argumentsArray[5] = objectForArray.fileOutputPath;

const pathToGenerator = './generator'
const webVTTOutputPath = `/output/${uploadTag}`

const prependForVTT = `/uploads/${channelName}/${uploadTag}.png#xywh=`

async function createSpriteAndThumbnails(){
  try {

    const { heightAsInteger: height, widthAsInteger: width, columns } = objectForArray

    const videoDurationInSeconds = Math.round(await getVideoDurationInSeconds(objectForArray.inputFile));

    const response = await createSprite(pathToGenerator, argumentsArray);
    console.log(response)

    const cttResponse = createVTT({ videoDurationInSeconds, height, width, columns, prependForVTT, outputFile: webVTTOutputPath})
    console.log(cttResponse)

  } catch (err){
    console.log(err);
  }
}

createSpriteAndThumbnails()



// const ls = spawn('./generator', argumentsArray);
//
// ls.stdout.on('data', data => {
//   console.log(`stdout: ${data}`);
// });
//
// ls.stderr.on('data', data => {
//   console.log(`stderr: ${data}`);
// });
//
// ls.on('close', code => {
//   console.log(`child process exited with code ${code}`);
// });





// convertFile(objectForArray);
