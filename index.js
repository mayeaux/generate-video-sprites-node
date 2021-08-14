const { spawn } = require('child_process');

const argumentsArray = ['macdonald.mp4', '60', '300', '200', '2', 'macdonald1.png'];

const ls = spawn('./generator', argumentsArray);

ls.stdout.on('data', data => {

  console.log(`stdout: ${data}`);
});

ls.stderr.on('err', data => {

  console.log(`stderr: ${data}`);
});

ls.on('close', code => {

  console.log(`child process exited with code ${code}`);
});

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
