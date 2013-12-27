var canvas, ctx, width, height;
var imageData;
var gif;
var colArray = new Array();
var img = new Image();
img.src = "cat.gif";
$("#image").append(img);
img.width=440;
img.height=440/1.333;

var video  = document.createElement('video');
video.id="video";
var gifblob;

var streaming = false;
width = 220;
height = Math.floor(width/1.33);
canvas = document.createElement('canvas');
ctx = canvas.getContext('2d');
canvas.width = width;
canvas.height = height;
$(canvas).css("width",width*2);
$(canvas).css("height",height*2);


var setup_img = function(){
  gif = new GIF({
    workers: 4,
      quality: 10,
      width: width,
      height: height,
      workerScript: 'libs/gif.worker.js'
  });

  gif.on('finished', function(blob){
    var gifimg = document.createElement('img');
    gifimg.id = 'result';
    gifimg.src = URL.createObjectURL(blob);
    gifimg.width=width*2;
    gifimg.height=height*2;
    gifblob = blob;
    $("canvas").remove();
    $("#image").append(gifimg);
    $( "#progressbar" ).remove();
    $("#image").append(save);
    $("#description").text("You can keep this if you like. Happy new year.");
  });
  imageData = ctx.getImageData(0, 0, width, height);
  for(var i=0; i<(imageData.data.length/4); i++){
    colArray[i] = imageData.data.subarray(4*i, (4*i)+4);
  }

  $("#description").text("");
  addGifFrame();



}

var sortPixels = function(){
  var workersCount = 4;
  var finished = 0;
  var blockSize = Math.floor(height/workersCount);
  var cycles = 20;

  //get finished ones
  var onWorkEnded = function(e){
    var blockResult = e.data.result;
    var index = e.data.index;
    var start = index*(blockSize);
    var end = start+(blockSize);

    for(var j=start; j<end; j++){
      for(var i=0; i<width; i++){
        colArray[j*width+i] = blockResult[(j-start)*width+i];
      }
    }
    finished++;

    if(finished == workersCount){
      writeToCanvas();
      addGifFrame();
    }
  };

  for (var index = 0; index < workersCount; index++){
    var worker = new Worker('sortProcessor.js');
    worker.onmessage = onWorkEnded;
    var start = index*(blockSize);
    var end = start+(blockSize);
    var segmentBlock = colArray.slice(start*width, start*width+ blockSize*width);
    worker.postMessage({
      data: segmentBlock,
      index:index,
      height:blockSize,
      width:width,
      cycles:cycles
    });
  }
}

//canvas data , index, length(height interval)
var parallelSort = function (start, end){
  for(var j=start; j<end; j++){
    for(var i=Math.round(Math.random()); i<width-1; i+=2){
      sortFxn(j*width+i,j*width+i+1, brightSort, colArray);
    }
  }
}

var writeToCanvas = function(){
  for(var i=0; i<(imageData.data.length/4); i++){
    imageData.data[4*i]=colArray[i][0];
    imageData.data[4*i+1]=colArray[i][1];
    imageData.data[4*i+2]=colArray[i][2];
    imageData.data[4*i+3]=colArray[i][3];
  }
  ctx.putImageData(imageData,0,0);
  }

var sortIteration = 0;
var num_frames = 30;
var frame =0;

var addGifFrame = function(){
  if(frame < num_frames){
    ctx.fillStyle = "yellow";
    ctx.font = "8px Helvetica";
    ctx.globalAlpha = 0.2;
    ctx.fillText("WHICHLIGHT",165, 161);


    ctx.fillStyle = "yellow";
    ctx.font = "8px Helvetica";
    ctx.globalAlpha = 0.5;
    ctx.fillText("SELFIE OBLITERATION",3, 161);



    gif.addFrame(ctx, {copy: true, delay:150});
    sortPixels();
  }
  else{
    gif.render();
  }

$( "#progressbar" ).progressbar({
      value: Math.round(frame/num_frames * 100)
    });


  frame++;
}

var initCam = function(){
  $(img).remove();
  navigator.getMedia = ( navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);

  if(navigator.getMedia == "undefined"){
     alert("webrtc is not supported on this browser. try chrome or firefox.");
  }

  navigator.getMedia(
    {
      video: true,
      audio: false
    },
      function(stream) {

   $("#image").append(canvas);
        $("#description").text("This one will disintegrate.");
        $("#container").append(snap);
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
        }

        video.style.width = width*2 + 'px';
        video.style.height = height*2 + 'px';
        video.play();

        (function draw() {
            ctx.save();
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            drawVideo();
            ctx.restore();
            drawing = requestAnimationFrame(draw);
        })();


      },
      function(err) {
        console.log("An error occured! " + err);
        alert("Oops! Some sort of error occured, refresh and try again.");
      }
      );

}

//because of weird ffx bug
var drawVideo = function(){
  try {
    ctx.drawImage(video, 0, 0, width, height);
  } catch (e) {
    if (e.name == "NS_ERROR_NOT_AVAILABLE") {
      setTimeout(drawVideo, 0);
    } else {
      throw e;
    }
  }
}


takepicture = function() {
   cancelAnimationFrame(drawing);
   $(video).remove();
   $("#image").append(canvas);
   setup_img();
  }


$("#startCam").click(function(){
  initCam();
  $("#startCam").remove();
  $("#description").text("Allow access to the webcam to take the selfie.");
});

var snap = document.createElement('a');
snap.href="#";
$(snap).addClass("button");
$(snap).text("capture photo");
$(snap).click(function(){
  takepicture();
  $(snap).remove();
})

var save = document.createElement('a');
save.href="#";
$(save).addClass("button");
$(save).text("save this gif");
$(save).click(function(){
  saveAs(gifblob, 'selfie-obliteration.gif');
});


