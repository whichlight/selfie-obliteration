var canvas, ctx, width, height;
var imageData;
var gif;
var colArray = new Array();
var img = new Image();
img.src = "lenna.png";
canvas = document.createElement('canvas');
ctx = canvas.getContext('2d');

img.onload = function(){
  width = canvas.width = img.naturalWidth;
  height = canvas.height = img.naturalHeight;
  $("body").append(canvas);

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
  setup_img();
}

var setup_img = function(){
  ctx.drawImage(img, 0, 0);
  imageData = ctx.getImageData(0, 0, width, height);
  for(var i=0; i<(imageData.data.length/4); i++){
    colArray[i] = imageData.data.subarray(4*i, (4*i)+4);
  }
  gif.addFrame(ctx, {copy: true, delay:150});
}

var sortPixels = function(){
  //sort fxn on colorarray, do it by row
  for(var j=0; j<height; j++){
    for(var i=Math.round(Math.random()); i<width-1; i+=2){
      sortFxn(j*width+i,j*width+i+1,brightSort);
    }
  }

  //color array to data
  for(var i=0; i<(imageData.data.length/4); i++){
    imageData.data[4*i]=colArray[i][0];
    imageData.data[4*i+1]=colArray[i][1];
    imageData.data[4*i+2]=colArray[i][2];
    imageData.data[4*i+3]=colArray[i][3];
  }
}

//comparing 4 val colors
var sortFxn = function(a,b,fx){
  if(fx(colArray[a],colArray[b])){
    var c = new Uint8ClampedArray(4);
    c.set(colArray[a]);
    colArray[a] = colArray[b];
    colArray[b]=c;
  }
}

var brightness = function(R,G,B){
    return (0.299*R + 0.587*G + 0.114*B)
}

var redSort = function(colA,colB){
  if(colA[0]>colB[0]){
    return true;
    }
  return false;
}

var brightSort = function(colA,colB){
  var ba = brightness(colA[0],colA[1], colA[2]);
  var bb = brightness(colB[0],colB[1], colB[2]);
  if(ba>bb){
    return true;
    }
  return false;
}


var sortIteration = 0;
var sortProcess = setInterval(function(){
  sortPixels();
  sortIteration++;

  if(sortIteration%10==0){
   ctx.putImageData(imageData,0,0);
  }

  if(sortIteration%20==0){
   addGifFrame();
  }

},1);

var num_frames = 30;
var frame =0;

var addGifFrame = function(){
  frame++;
  if(frame < num_frames){
    gif.addFrame(ctx, {copy: true, delay:150});
  }
  else{
    gif.render();
    clearInterval(sortProcess);
  }
}




