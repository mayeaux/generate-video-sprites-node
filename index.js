// const { spawn, execFile } = require('child_process');
const { getVideoDurationInSeconds } = require('get-video-duration')
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const fileOutputName = 'output/macdonald10.png'

const objectForArray = {
  inputFile : 'sample.mp4',
  intervalInSecondsAsInteger: 2,
  widthAsInteger: 300,
  heightAsInteger: 200,
  columns: 10,
  fileOutputPath: fileOutputName
}

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

    const { stdout, stderr } = await exec(fullString);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
  }
}

(async function main(){

  const videoDurationInSeconds = Math.round(await getVideoDurationInSeconds('./sample.mp4'));

  console.log(response);

  // const response = await lsExample();
  // console.log(response);
})()



// convertFile(objectForArray);

const argumentsArray = ['output/macdonald.mp4', '15', '300', '200', '2', fileOutputName];

// const ls = spawn('./generator', argumentsArray);
//
// ls.stdout.on('data', data => {
//
//   console.log(`stdout: ${data}`);
// });
//
// ls.stderr.on('err', data => {
//
//   console.log(`stderr: ${data}`);
// });
//
// ls.on('close', code => {
//
//   console.log(`child process exited with code ${code}`);
// });



// const childProcess = execFile('./generator', argumentsArray);
//
// childProcess.stdout.on('data', function(data) {
//   console.log(data.toString());
// });



// $ ./generator --help
// Video Thumbnail Generator
//
// Usage:
//   ./generator <video> <interval> <width> <height> <columns> <output> [<parallelism>]
//   ./generator (-h | --help)
//   ./generator --version
//
// Options:
//   -h --help     Show this screen.
//   --version     Show version.
//   <video>         Video filepath.
//   <interval>      Interval em seconds between frames.
//   <width>         Width of each thumbnail.
//   <height>        Height of each thumbnail.
//   <columns>       Total number of thumbnails per line.
//   <output>        Output.
//   [<parallelism>]   Number of files to process in parallel
