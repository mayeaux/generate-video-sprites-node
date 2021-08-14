// const { spawn, execFile } = require('child_process');
const { getVideoDurationInSeconds } = require('get-video-duration')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
var Vtt = require('vtt-creator');
const fs = require('fs');
const spawn = require('child_process').spawn;

const fileOutputName = 'output/macdonald19.png'

const objectForArray = {
  inputFile : './sample.mp4',
  intervalInSecondsAsInteger: 1,
  widthAsInteger: 300,
  heightAsInteger: 200,
  columns: 10,
  fileOutputPath: fileOutputName
}


async function createVTT(){
  const videoDurationInSeconds = Math.round(await getVideoDurationInSeconds('./sample.mp4'));

  console.log(videoDurationInSeconds);

  const createdArray = Array.from({length: videoDurationInSeconds}, (_, i) => i + 1)

  // const createdArray = Array.from(Array(videoDurationInSeconds).keys())

  var v = new Vtt();

  // console.log(createdArray);

  // v.add(0, 1, '/uploads/anthony/macdonald10.png#xywh=0,0,300,200');
  // v.add(1, 2, '/uploads/anthony/macdonald10.png#xywh=300,0,300,200');
  // v.add(3, 4, '/uploads/anthony/macdonald10.png#xywh=600,0,300,200');

  const width = 300;
  const height = 200;
  const columns = 3

  const prepend = '/uploads/anthony/macdonald10.png#xywh='

  for(const thumbnailNumber of createdArray){
    const row = Math.ceil(thumbnailNumber/columns)
    const column = thumbnailNumber % columns
    const xValue = ( column * width ) - width
    const yValue = ( row * height ) - height

    // TODO: turn thumbnailNumber into seconds, right now it's hardcoded expecting 1 thumbnail per second
    // add line to webvtt file
    v.add(thumbnailNumber - 1, thumbnailNumber,`${prepend}${xValue},${yValue},${width},${height}`);
  }

  console.log(v.toString());
}
createVTT()
// Given 3 (d)
// 1 1 1 0 0
// 2 1 2 300 0
// 3 1 3 600 0
// 4 2 1 0 200
// 5 2 2 300 200
// 6 2 3 600 200
// 7 3 1 0 400
// 8 3 2 300 400
// 9 3 3 600 400
//
//
// row = Ceil(a / d)
// column = a % d
// x = ( column * 300 ) - 300
// y value =  ( row * 200 ) - 200
//
// 0 0
// 300 0
// 600 0
// 900 0
// 1200 0
// 1500 0
// 1800 0
// 2100 0
// 2400 0
// 2700 0
// 0 200
// 300 200
// 600 200
// 900 000
// 1200 200
// 1500 200
// 1800 200
// 2100 200
// 2400 200
// 2700 200
// 0 400


// let seconds = 7; // (assume every second so it's not a big deal')
// // given a row of 10:
//
// var v = new Vtt();
// v.add(0, 1, '/uploads/anthony/macdonald10.png#xywh=0,0,300,200');
// v.add(1, 2, '/uploads/anthony/macdonald10.png#xywh=300,0,300,200');
// v.add(3, 4, '/uploads/anthony/macdonald10.png#xywh=600,0,300,200');
//
// console.log(v.toString());
//
// fs.writeFileSync('./filepath.vtt', v.toString());


// main.js
async function spawnChild(argumentsArray) {
  const child = spawn('./generator', argumentsArray);

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

const argumentsArray = ['./sample.mp4', '1', '300', '200', '10', 'freddy4.png'];

async function runThis(){
  try {
    const response = await spawnChild(argumentsArray);

    console.log(response)
  } catch (err){
    console.log(err);
  }
}

// runThis()



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
