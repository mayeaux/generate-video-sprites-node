# generate-video-sprites-node
Node package for generating preview sprites for videos

Install: $ `npm i generate-video-sprites-node`

# Docs

Install python 3.9 and the install requirements.txt, runs as `$ python`

From project root, run `$ node examples/example.js` and then check the `output` folder

####Then:
Test on a new video: drop a new video in the `videos` folder

Then you can run
`~ cd videos`
`$  ffmpeg -ss 00:00:00 -i newVideo.mp4 -to 00:00:30 -c copy newVideoTrimmed.mp4
`

You will need to serve the .vtt file from a path that your video player can access. Also, you will need to serve the sprite from a place that will be referenced in the vtt file.  

Uses this Python library for generating the sprite from the video: https://github.com/flavioribeiro/video-thumbnail-generator



// ffmpeg -i extrawelt.mp4 -vf fps=1/2 -f image2 -s 140x79 out%d.jpg
