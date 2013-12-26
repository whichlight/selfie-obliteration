var canvas, ctx, width, height;
var imageData;
var gif;
var colArray = new Array();
var img = new Image();
img.src = "bird.jpg";
canvas = document.createElement('canvas');
ctx = canvas.getContext('2d');

img.onload = function(){
  width = canvas.width = img.naturalWidth;
  height = canvas.height = img.naturalHeight;
  $("body").append(canvas);
  setup_img();
}

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
      $("canvas").remove();
      $("body").append(gifimg);
  });

  ctx.drawImage(img, 0, 0);
  imageData = ctx.getImageData(0, 0, width, height);
  for(var i=0; i<(imageData.data.length/4); i++){
    colArray[i] = imageData.data.subarray(4*i, (4*i)+4);
  }
  gif.addFrame(ctx, {copy: true, delay:150});
  sortPixels();
}

var sortPixels = function(){
  var workersCount = 4;
  var finished = 0;
  var blockSize = height/workersCount;
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
    console.log(segmentBlock.length);
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

/**
var sortProcess = setInterval(function(){
  sortPixels();
  sortIteration++;

  if(sortIteration%10==0){
   ctx.putImageData(imageData,0,0);
  }

  if(sortIteration%20==0){
   addGifFrame();
  }

},10);
**/

var num_frames = 30;
var frame =0;
var addGifFrame = function(){
  frame++;
  if(frame < num_frames){
    gif.addFrame(ctx, {copy: true, delay:150});
    sortPixels();
  }
  else{
    gif.render();
  }
}




