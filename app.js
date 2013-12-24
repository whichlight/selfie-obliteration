var canvas, ctx, width, height;
var img = new Image();
img.src = "bird.jpg";
var imageData;
canvas = document.createElement('canvas');
var colArray = new Array();

ctx = canvas.getContext('2d');

img.onload = function(){
  width = canvas.width = img.naturalWidth;
  height = canvas.height = img.naturalHeight;
  $("body").append(canvas);

  process_img();
}

var process_img = function(){
  ctx.drawImage(img, 0, 0);
  imageData = ctx.getImageData(0, 0, width, height);
  for(var i=0; i<(imageData.data.length/4); i++){
    colArray[i] = imageData.data.subarray(4*i, (4*i)+4);
  }
  sortPixels();
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

  //draw

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

setInterval(function(){
  sortPixels();
},1);

setInterval(function(){
  ctx.putImageData(imageData,0,0);
},2000);
