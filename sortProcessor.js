importScripts("sort.js");

self.onmessage = function(e){
  var colorBlock = e.data.data;
  var index = e.data.index;
  var height= e.data.height;
  var width = e.data.width;
  var cycles = e.data.cycles;

  for(var c=0; c<cycles; c++){
    for(var j=0; j<height; j++){
      for(var i=Math.round(Math.random()); i<width-1; i+=2){

        if(typeof(colorBlock[j*width+i])=="undefined"){
          console.log(height);
          console.log(index);
          console.log("undefine check");
          console.log(j*width+i);
          console.log(colorBlock[j*width+i]);
        }
        sortFxn(j*width+i,j*width+i+1, brightSort, colorBlock);
      }
    }
  }

  self.postMessage({result:colorBlock, index: index});
}
