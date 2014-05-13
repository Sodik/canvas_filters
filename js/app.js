define(['filter', 'q'], function(Filter, Q){
  var FiltersApp = {
    init: function(){
      this.findElements();
      this.attachEvents();
    },
    findElements: function(){
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.fileInput = document.getElementById('file');
      this.controls = document.getElementById('controls');
      this.filters = [];
      this.worker = null;
      this.imageDrawed = false;
    },
    attachEvents: function(){
      var self = this;

      this.fileInput.addEventListener('change', function(){
        self.canvas.width = self.canvas.width;
        if(this.files && this.files[0]){
          var fileReader = new FileReader();
          fileReader.onload = function(event){
            self.drawImage(event.target.result, function(){ this.applyFilters() }.bind(self));
            self.imageDrawed = true;
          }
          fileReader.onerror = function(){
            self.imageDrawed = false;
          }
          fileReader.readAsDataURL(this.files[0]);
        }
      }, false);
    },
    drawImage: function(data, callback){
      var self = this;
      var newImage = new Image();
      this.resetFiters();

      newImage.onload = function(){
        var imageObj = self.getProportion(this);
        self.ctx.drawImage(this, imageObj.left, imageObj.top, imageObj.width, imageObj.height);
        if(callback && typeof callback === 'function'){
          callback();
        }
      }
      newImage.src = data;
    },
    getProportion: function(image){
      var ratio = image.width / image.height;
      var slideWidth = image.width;
      var slideHeight = slideWidth / ratio;
      var maskHeight = this.canvas.height;
      var maskWidth = this.canvas.width;

      if(slideHeight < maskHeight) {
        slideHeight = maskHeight;
        slideWidth = slideHeight * ratio;
      }

      return {
        width: slideWidth,
        height: slideHeight,
        top: (maskHeight - slideHeight) / 2,
        left: (maskWidth - slideWidth) / 2
      }
    },
    nextFilter: function(imageData){
      if(this.filterIndex >= this.filters.length){
        this.ctx.putImageData(imageData, 0 ,0);
      }
      return this.filters[this.filterIndex].apply.call(this.filters[this.filterIndex], imageData).then(function(data){
        this.filterIndex++;
        this.nextFilter(data);
      }.bind(this));
    },
    applyFilters: function(){
      if(!this.imageDrawed) return;
      this.filterIndex = 0;
      this.filters.forEach(function(filter){
        if(filter.worker){
          filter.worker.terminate();
        }
      });
      var imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.filters.forEach(function(filter){
        filter.apply(imageData)
      });
      //this.nextFilter(imageData);
      /*var result = Q(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
      console.log(result)
      this.filters.forEach(function(filter){
        result = result.then(filter.apply);
      });
      result.done(function(){
        console.log(arguments)
      });*/
      //this.ctx.putImageData(result, 0, 0);

      /*this.filters.forEach(function(filter){
        var worker = new Worker(filter.options.filterUrl);
        worker.addEventListener('message', function(event){
          if(event.data.status === 'complete'){
            
            this.ctx.putImageData(event.data.imageData, 0, 0);
            worker.terminate();
          }
        }.bind(this));
        worker.postMessage({
          imageData: this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height),
          value: filter.getValue()
        });
      }.bind(this));*/
    },
    /*
      @param {object} have to contain {string} filter name,
        {function} apply which accept a canvas element,
        {string} url for filter's js file
      @example App.addFilter({
        min: 0,
        max: 200,
        step: 10,
        value: 0,
        name: 'Noise',
        filterUrl: 'js/filters/noise.js'
      });
    */
    addFilter: function(options){
      var filter = new Filter(this.extend(options, {app: this}));
      filter.subscribe(function(){
        this.applyFilters();
      }.bind(this));
      this.filters.push(filter);
    },
    resetFiters: function(){
      this.filters.forEach(function(filter){
        filter.reset();
      });
    },
    extend: function(firstObject, secondObject){
      for(var key in secondObject){
        if(secondObject.hasOwnProperty(key)){
          firstObject[key] = secondObject[key];
        }
      }
      return firstObject;
    }
  };
  return FiltersApp;
});