const joinImages = require('join-images');
const fs = require('fs')

const amountOfFiles = fs.readdirSync('./output1').length

const columns = 9;

const prePath = './output1'

function createArray(columns, startingAmount){
  const fileNameArray = [];
  const realStartingAmount = columns * (startingAmount - 1);

  console.log(realStartingAmount)

  for(let x = 1 ; x < columns + 1; x++){
    const imageNumber = realStartingAmount + x;
    if(imageNumber <= amountOfFiles){
      fileNameArray.push(`${prePath}/thumb-${imageNumber}.jpg`);
    }
  }

  return fileNameArray
}


// console.log(length);
//
//
// console.log(joinImages);
const rows = Math.ceil(amountOfFiles / columns);

// console.log(rows);
let doneImages = 0;
function createFullImage(rows){

  for(let x = 1; x < rows + 1; x++){

    const array = createArray(columns, x);
    const options = {
      direction: 'horizontal'
    }

    console.log(array);

    joinImages.joinImages(array, options).then((img) => {
      // Save image as file
      img.toFile(`./alltogether/${x}.jpg`).then(function(){
        // console.log('all done!');
        doneImages++
        console.log(doneImages);
        console.log(rows);
        if(doneImages == rows){
          console.log('all done!');
        }
      });
    });

  }
}

createFullImage(rows)


// const array = createArray(columns);
// console.log(array);
//
// joinImages.joinImages(array, options).then((img) => {
//   // Save image as file
//   img.toFile('out.jpg');
// });
