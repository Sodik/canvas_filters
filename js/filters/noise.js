onmessage = function(event){
  var imageData = event.data.imageData;
  var data = imageData.data;
  var noise = event.data.value;
  var rand;

  for (var i = 0, len = data.length; i < len; i += 4) {
    rand = (0.5 - Math.random()) * noise;
    data[i] += rand;
    data[i + 1] += rand;
    data[i + 2] += rand;
  }
  postMessage({status: 'complete', imageData: imageData});
}