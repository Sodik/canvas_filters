define(['class'], function(Class){
  var BaseFilter = Class.extend({
    name: 'base',
    findControls: function(){
      this.rangeInput = document.getElementById(this.options.input);
      this.row = this.rangeInput.parentNode;
      this.rangeLabel = document.querySelector('[for="'+this.rangeInput.id+'"]');
      this.displayValue = this.row.querySelector('span');
    },
    displayCurrentValue: function(){
      this.displayValue.innerText = this.rangeInput.value;
    },
    attachEvents: function(){
      this.rangeInput.addEventListener('change', function(){

        this.displayCurrentValue();
      }.bind(this));
      this.displayCurrentValue();
    },
    createWorker: function(){
      this.worker = new Worker(this.options.src);
    },
    apply: function(){

    }
  });
  var FiltersApp = {
    init: function(){
      this.findElements();
      this.attachEvents();
      this.initDefaultFilters();
    },
    findElements: function(){
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.fileInput = document.getElementById('file');
      this.controls = document.getElementById('controls');
    },
    attachEvents: function(){
      var self = this;

      this.fileInput.addEventListener('change', function(){
        if(this.files && this.files[0]){
          var fileReader = new FileReader();
          fileReader.onload = function(event){
            self.drawImage(event.target.result);
          }
          fileReader.readAsDataURL(this.files[0]);
        }
      }, false);
    },
    drawImage: function(data){
      var self = this;
      var newImage = new Image();

      newImage.onload = function(){
        var imageObj = self.getProportion(this);
        self.ctx.drawImage(this, imageObj.left, imageObj.top, imageObj.width, imageObj.height);
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
    applyFilters: function(name, options){

      var filter = new this.filters[name](options);
      worker.postMessage(filter.getPostData());
      worker.onmessage = function(event){
        if (event.data.status == 'complite'){
          this.ctx.putImageData(event.data.imageData,0,0); 
        }
      }.bind(this);
    },
    initDefaultFilters: function(){
      var self = this;
      this.filters = {};
      var NoiseFilter = BaseFilter.extend({
        name: 'noise',
        init: function(options){
          this.options = {
            noise: 100,
            src: 'js/filters/noise.js',
            min: 50,
            max: 200,
            step: 10,
            input: 'noise'
          };
          for(var key in options){
            this.options[key] = options[key];
          }
          this.findControls();
          this.attachEvents();
        },
        getPostData: function(){
          return {
            imageData: self.ctx.getImageData(0, 0, self.canvas.width, self.canvas.height), 
            noise: this.options.noise
          }
        }
      });
      this.filters['noise'] = new NoiseFilter();
      this.filters['blur'] = BaseFilter.extend({
        name: 'blur',
        init: function(options){
          this.options = {
            radius: 3,
            src: 'js/filters/blur.js'
          };
          for(var key in options){
            this.options[key] = options[key];
          }
          self.controls.appendChild(this.createControls());
        },
        getPostData: function(){
          return {
            imageData: self.ctx.getImageData(0, 0, self.canvas.width, self.canvas.height), 
            radius: this.options.radius
          }
        }
      });
    }
  };
  return FiltersApp;
});