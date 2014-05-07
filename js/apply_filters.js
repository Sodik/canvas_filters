onmessage = function(event){
  var imageData = event.data.imageData;
  var busy = false;
  event.data.filters.forEach(function(filter){
    importScripts(filter.url);
    if(applyNoiseFilter && !busy){
      busy = true;
      postMessage({status: 'complete', imageData: applyNoiseFilter(imageData, filter)});
    }
  });
}