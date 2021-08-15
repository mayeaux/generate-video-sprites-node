const { getVideoDurationInSeconds } = require('get-video-duration')
const Vtt = require('vtt-creator');
const fs = require('fs');
const spawn = require('child_process').spawn;

function createVTT({ videoDurationInSeconds, height, width, columns, prepend }){
  const createdArray = Array.from({length: videoDurationInSeconds}, (_, i) => i + 1)

  for(const thumbnailNumber of createdArray){
    const row = Math.ceil(thumbnailNumber/columns)
    let column = thumbnailNumber % columns
    if(column === 0) column = column + columns
    const xValue = ( column * width ) - width
    const yValue = ( row * height ) - height

    console.log(thumbnailNumber, row, column, xValue, yValue)

    // TODO: turn thumbnailNumber into seconds, right now it's hardcoded expecting 1 thumbnail per second
    // add line to webvtt file
    v.add(thumbnailNumber - 1, thumbnailNumber,`${prepend}${xValue},${yValue},${width},${height}`);
  }

  console.log(v.toString());

  fs.writeFileSync('./filepath.vtt', v.toString());

  return 'completed'

}

// main.js
async function createSprite(pathToGenerator, argumentsArray) {
  const child = spawn(pathToGenerator, argumentsArray);

  let data = "";
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

// const argumentsArray = ['./output/output1.mp4', '1', '300', '200', '10', 'freddy4.png'];

const fileOutputName = 'output/macdonald19.png'

// have to keep this order to not brick the implementation
const objectForArray = {
  inputFile : './sample.mp4',
  intervalInSecondsAsInteger: 1,
  widthAsInteger: 300,
  heightAsInteger: 200,
  columns: 10,
  fileOutputPath: fileOutputName
}

// arguments array for
let argumentsArray = [];
argumentsArray[0] = objectForArray.inputFile;
argumentsArray[1] = objectForArray.intervalInSecondsAsInteger;
argumentsArray[2] = objectForArray.widthAsInteger;
argumentsArray[3] = objectForArray.heightAsInteger;
argumentsArray[4] = objectForArray.columns;
argumentsArray[5] = objectForArray.fileOutputPath;

const pathToGenerator = './generator'

async function runThis(){
  try {

    const { heightAsInteger: height, widthAsInteger: width, columns } = objectForArray

    const videoDurationInSeconds = Math.round(await getVideoDurationInSeconds('./output/output1.mp4'));

    const response = await createSprite(pathToGenerator, argumentsArray);

    const cttResponse = createVTT({ videoDurationInSeconds, height, width, columns})


    console.log(response)
  } catch (err){
    console.log(err);
  }
}

runThis()



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
