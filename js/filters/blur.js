onmessage = function(event){
  var imageData = event.data.imageData;
  var width = imageData.width;
  var height = imageData.height;
  var radius = event.data.value;
  
  var sumR, sumG, sumB, sumA;
  var scale = (radius * 2 + 1) * (radius * 2 + 1);
  
  function getPixel(x, y) {
    if(x < 0){
      x = 0;
    }else if(x >= width){
      x = width - 1;
    }
    if(y < 0){
      y = 0;
    }else if(y >= height){
      y = height - 1;
    }
    var index = (y * width + x) * 4;
    return [
      imageData.data[index + 0],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3],
    ];
  };
  
  function setPixel(x, y, r, g, b, a) {
    var index = (y * width + x) * 4;
    imageData.data[index + 0] = Math.round(r);
    imageData.data[index + 1] = Math.round(g);
    imageData.data[index + 2] = Math.round(b);
    imageData.data[index + 3] = Math.round(a);
  };
  
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      
    
      sumR = 0;
      sumG = 0;
      sumB = 0;
      sumA = 0;
      
      for (var dy = -radius; dy <= radius; dy++) {
        for (var dx = -radius; dx <= radius; dx++) {
          var pixeldata = getPixel(x + dx, y + dy);
          sumR += pixeldata[0];
          sumG += pixeldata[1];
          sumB += pixeldata[2];
          sumA += pixeldata[3];
        }
      }

      setPixel(x, y, sumR / scale, sumG / scale, sumB / scale, sumA / scale);
    }
  }
  postMessage({status: 'complete', imageData: imageData});
}