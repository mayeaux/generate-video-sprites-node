const joinImages = require('join-images');
const fs = require('fs-extra');

async function createFullImage({
   columns,
   outputPath,
}){
  const screenshotImagesDirectory = `${outputPath}/screenshotImages`;
  const horizontalImagesDirectory = `${outputPath}/horizontalImages`;

  fs.mkdirSync(horizontalImagesDirectory, { recursive: true });

  fs.emptyDirSync(horizontalImagesDirectory)

  // how many screenshot images there are in total
  let amountOfFiles = fs.readdirSync(screenshotImagesDirectory)
                      .filter( function( elm ) {return elm.match(/.*\.(png?)/ig);})
                      .length;

  // calculate the total amount of rows
  const rows = Math.ceil(amountOfFiles / columns);

  c.l('amount of files, columns, rows')
  c.l(amountOfFiles, columns, rows)

  // create array for
  function createArray(columns, startingAmount){
    // the image number to start it at
    const realStartingAmount = columns * (startingAmount - 1);

    c.l('real starting amount', realStartingAmount)
    c.l('columns', columns)

    // +1 because we're starting at 1
    const amountOfThingsToLoopThrough = columns + 1;
    c.l('amount of things', amountOfThingsToLoopThrough)

    // create array for a horizontal join
    const fileNameArray = [];
    // the amount of images equals the amount of columns
    for(let x = 1 ; x < amountOfThingsToLoopThrough; x++){
      const imageNumber = realStartingAmount + x;
      // this conditional bugfixes where there would be one extra, I believe
      if(imageNumber <= amountOfFiles){
        fileNameArray.push(`${screenshotImagesDirectory}/thumb-${imageNumber}.png`);
      }
    }

    return fileNameArray
  }

  // loop through all the rows and create the horizontally joined images
  for(let x = 1; x < rows + 1; x++){

    // create array with the amount of images being the columns
    const array = createArray(columns, x);

    c.l(array);

    // create Sharp instance
    const sharpHorizontalInstance = await joinImages.joinImages(array, { direction: 'horizontal'});

    // save Sharp instance to file
    const horizontalImageResponse = await sharpHorizontalInstance.toFile(`${horizontalImagesDirectory}/${x}.webp`);
  }

  // count how many horizontal images were created
  let horizontalImages = fs.readdirSync(horizontalImagesDirectory)
    .filter( function( elm ) {return elm.match(/.*\.(webp?)/ig);})

  let arrayOfRowSizes = [];

  for(const image of horizontalImages){
    const horizontalFile = `${horizontalImagesDirectory}/${image}`;
    var stats = fs.statSync(horizontalFile)
    var fileSizeInBytes = stats.size;
    var fileSizeInKb = Math.round(fileSizeInBytes / (1024));
    arrayOfRowSizes.push(fileSizeInKb)
    c.l(fileSizeInKb)
  }

  const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

  const averageKbSize = Math.round(average(arrayOfRowSizes));

  c.l('average kb size');
  c.l(averageKbSize)

  return averageKbSize
}

module.exports = createFullImage;
