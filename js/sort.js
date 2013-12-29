//comparing 4 val colors
var sortFxn = function(a,b,fx, arr){
  if(typeof(arr[a])=="undefined"){console.log(a);}
  if(fx(arr[a],arr[b])){
    var c = new Uint8ClampedArray(4);
    c.set(arr[a]);
    arr[a] = arr[b];
    arr[b]=c;
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
