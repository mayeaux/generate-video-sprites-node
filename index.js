// const { spawn, execFile } = require('child_process');
const { getVideoDurationInSeconds } = require('get-video-duration')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
var Vtt = require('vtt-creator');
const fs = require('fs');
const spawn = require('child_process').spawn;


function convertFile(objectForArray){
  let builtArray = [];

  let string = '';

  for(const variable in objectForArray){
    console.log(objectForArray[variable])
    string = string + ' ' + objectForArray[variable];
    builtArray.push(objectForArray[variable])
  }

  console.log(string);

  return string

  console.log(builtArray)
}

async function lsExample() {
  try {

    const object = convertFile(objectForArray);

    let fullString = './generator' + object;
    console.log(fullString)

    console.log('Starting sprite creation')
    const { stdout, stderr } = await exec(fullString);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    let response = {
      stdout, stderr
    }

    return response
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
  }
}


const fileOutputName = 'output/macdonald19.png'

const objectForArray = {
  inputFile : './sample.mp4',
  intervalInSecondsAsInteger: 1,
  widthAsInteger: 300,
  heightAsInteger: 200,
  columns: 10,
  fileOutputPath: fileOutputName
}


async function main(){

  const videoDurationInSeconds = Math.round(await getVideoDurationInSeconds('./sample.mp4'));

  console.log(videoDurationInSeconds);

  const { stdout, stderr } = await lsExample();
  // console.log(response);
  if(stderr){
    console.log('error:')
    console.log(stderr)
  } else {
    console.log('successfully generated sprite')
    console.log(stdout);
  }
}

const createdArray = Array.from({length: 10}, (_, i) => i + 1)

console.log(createdArray);

// main()




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



const argumentsArray = ['./sample.mp4', '1', '300', '200', '10', 'freddy3.png'];


const ls = spawn('./generator', argumentsArray);

ls.stdout.on('data', data => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', data => {
  console.log(`stderr: ${data}`);
});

ls.on('close', code => {
  console.log(`child process exited with code ${code}`);
});





// convertFile(objectForArray);
