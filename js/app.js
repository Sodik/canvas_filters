define(['filter', 'q'], function(Filter, Q){
  var FiltersApp = {
    init: function(){
      this.findElements();
      this.createFakeCanvas();
      this.attachEvents();
    },
    createFakeCanvas: function(){
      this.fakeCanvas = document.createElement('canvas');
      this.fakeCanvas.width = this.canvas.width;
      this.fakeCanvas.height = this.canvas.height;
      this.fakeCtx = this.fakeCanvas.getContext('2d');
    },
    findElements: function(){
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.fileInput = document.getElementById('file');
      this.controls = document.getElementById('controls');
      this.filters = [];
      this.worker = null;
      this.imageDrawed = false;
      this.reRendering = false;
    },
    attachEvents: function(){
      var self = this;

      this.fileInput.addEventListener('change', function(){
        self.canvas.width = self.canvas.width;
        self.reRendering = false;
        if(this.files && this.files[0]){
          var fileReader = new FileReader();
          fileReader.onload = function(event){
            self.renderImage(event.target.result, function(){ self.applyFilters(true) });
            self.imageDrawed = true;
          }
          fileReader.onerror = function(){
            self.imageDrawed = false;
          }
          fileReader.readAsDataURL(this.files[0]);
        }
      }, false);
    },
    renderImage: function(data, callback){
      var self = this;
      var newImage = new Image();
      if(!this.reRendering){
        this.resetFilters();
      }

      newImage.onload = function(){
        var imageObj = this.getProportion(newImage);
        this.ctx.drawImage(newImage, imageObj.left, imageObj.top, imageObj.width, imageObj.height);
        this.originalImage = {image: newImage, obj: imageObj};
        this.renderFakeImage();
        if(callback && typeof callback === 'function'){
          callback();
        }
      }.bind(this)
      newImage.src = data;
    },
    renderFakeImage: function(){
      this.fakeCanvas.width = this.fakeCanvas.width;
      var imageObj = this.originalImage.obj;
      this.fakeCtx.drawImage(this.originalImage.image, imageObj.left, imageObj.top, imageObj.width, imageObj.height);
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
    applyFilters: function(drawed){
      if(!this.imageDrawed) return;
      this.filterIndex = 0;
      this.filters.forEach(function(filter){
        if(filter.worker){
          filter.worker.terminate();
        }
      });
      var imageData = this.fakeCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.nextFilter(imageData);
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
      var filter = new Filter(this.extend(options, {parent: this.controls}));
      filter.subscribe(function(){
        this.applyFilters();
      }.bind(this));
      this.filters.push(filter);
    },
    resetFilters: function(){
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