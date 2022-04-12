// ffmpeg -i extrawelt.mp4 -r 1/2 -s 140x79 -f image2 ./thumb/thumb-%d.png
// ffmpeg -i ./videos/extrawelt.mp4 -y -vcodec libx264 -r 0.5 -filter:v scale=w=140:h=80 -f image2 ./something.webp
// https://stackoverflow.com/a/54903986/3973137
// https://github.com/damianociarla/node-ffmpeg#readme


// ffmpeg -i extrawelt.mp4 -vf fps=1/2 -f image2 -s 140x79 out%d.jpg


const ffmpeg = require('fluent-ffmpeg');

const extraweltPath = './videos/extrawelt.mp4';
const fps = 1/2;
const format = 'image2';
const size = '140x79';
const outputFolder = './output1/'

async function convertToMostCompatible(){
  return new Promise(function (resolve, reject) {
    ffmpeg(extraweltPath)
      .fps(fps)
      .format(format)
      .size(size)
      .on('start', function (commandLine) {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('error', function (error) {
        console.log(error);
        return reject(new Error(error))
      })
      .on('progress', function (progress) {
        console.log(`CONVERTED: ${Math.ceil(progress.percent)}%`);
      })
      .on('end', async () => {

        console.log('Processing finished !');
        resolve('success');

      }).save(`${outputFolder}}thumb-%d.jpg`);
  })
}

convertToMostCompatible()
