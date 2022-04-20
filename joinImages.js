const joinImages = require('join-images');
const fs = require('fs')
const randomstring = require("randomstring");

let dirCont = fs.readdirSync( './output1' );
let files = dirCont.filter( function( elm ) {return elm.match(/.*\.(png?)/ig);});


const amountOfFiles = files.length

const columns = 9;

const prePath = './output1'

function createArray(columns, startingAmount){
  const fileNameArray = [];
  const realStartingAmount = columns * (startingAmount - 1);

  console.log(realStartingAmount)

  for(let x = 1 ; x < columns + 1; x++){
    const imageNumber = realStartingAmount + x;
    if(imageNumber <= amountOfFiles){
      fileNameArray.push(`${prePath}/thumb-${imageNumber}.png`);
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
function createFullImage({ columns, existingPath }){
  console.log(rows);
  console.log('amount of rows');


  for(let x = 1; x < rows + 1; x++){

    const array = createArray(columns, x);
    const options = {
      direction: 'horizontal'
    }

    console.log('array here');
    console.log(array);

    joinImages.joinImages(array, options).then((img) => {
      // TODO: refactor to async/await
      // Save image as file
      img.toFile(`./alltogether/${x}.png`).then(function(){
        // console.log('all done!');
        doneImages++
        console.log(doneImages);
        console.log(rows);
        if(doneImages == rows){
          const dirCont = fs.readdirSync('./alltogether')

          let amountOfImages = dirCont.filter( function( elm ) {return elm.match(/.*\.(png?)/ig);}).length;


          console.log('running now');

          let arrays = [];

          for(let x = 1 ; x < amountOfImages + 1; x++){
            arrays.push(`./alltogether/${x}.png`);
          }

          console.log(arrays);

          joinImages.joinImages(arrays, { direction: 'vertical'}).then((img1) => {
            img1.toFile(`./alltogether/done.webp`).then(function(){
              console.log('ALL DONE');
            })
          })

          console.log('all done!');
        }
      }).catch(function(err){
        console.log('err1');
        console.log(err);
      });
    }).catch(function(err){
      console.log(array);
      console.log('err2');
      console.log(err);
    });

  }
}
module.exports = createFullImage;


// const array = createArray(columns);
// console.log(array);
//
// joinImages.joinImages(array, options).then((img) => {
//   // Save image as file
//   img.toFile('out.jpg');
// });
