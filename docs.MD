# Docs

Install python 3.9 and the install requirements.txt, runs as `$ python`

From project root, run `$ node examples/example.js` and then check the `output` folder

####Then:
Test on a new video: drop a new video in the `videos` folder

Then you can run 
`~ cd videos`
`$  ffmpeg -ss 00:00:00 -i newVideo.mp4 -to 00:00:30 -c copy newVideoTrimmed.mp4
`
