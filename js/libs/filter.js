define(['class', 'q'], function(Class, Q){
  /*
    @constructor
    @param {object} options
  */
  var Filter = Class.extend({
    init: function(options){
      this.options = {
        min: 0,
        max: 10,
        step: 1,
        value: 0
      }
      for(var key in options){
        if(options.hasOwnProperty(key)){
          this.options[key] = options[key];
        }
      }
      this.subscribers = [];
      this.createControls();
      this.attachEvents();
    },
    createControls: function(){
      this.holder = document.createElement('div');
      this.holder.className = 'row';

      this.rangeLable = document.createElement('label');
      this.rangeLable.setAttribute('for', this.options.name);
      this.rangeLable.innerText = this.options.name;
      this.holder.appendChild(this.rangeLable);

      this.rangeInput = document.createElement('input');
      this.rangeInput.type = 'range';
      this.rangeInput.id = this.options.name;
      this.rangeInput.min = this.options.min;
      this.rangeInput.max = this.options.max;
      this.rangeInput.step = this.options.step;
      this.rangeInput.value = this.options.value;
      this.holder.appendChild(this.rangeInput);

      this.displayValue = document.createElement('span');
      this.holder.appendChild(this.displayValue);
      
      this.options.parent.appendChild(this.holder);
    },
    displayCurrentValue: function(){
      if(typeof this.options.onChange === 'function'){
        this.options.onChange(this.options.value);
      }
      this.displayValue.innerText = this.getValue();
    },
    attachEvents: function(){
      this.rangeInput.addEventListener('change', function(){
        this.options.value = this.rangeInput.value;
        this.displayCurrentValue();
        this.change(this.getValue());
      }.bind(this));
      this.displayCurrentValue();
    },
    getValue: function(){
      return parseFloat(this.options.value);
    },
    subscribe: function(data){
      this.subscribers.push(data);
    },
    change: function(value){
      this.subscribers.forEach(function(fn){
        fn(value);
      });
    },
    reset: function(){
      this.rangeInput.value = 0;
      this.options.value = this.rangeInput.value;
      this.displayCurrentValue();
    },
    apply: function(imageData){
      var deferred = Q.defer();
      if(this.worker){
        this.worker.terminate();
      }
      this.worker = new Worker(this.options.filterUrl);
      this.worker.addEventListener('message', function(event){
        if(event.data.status === 'complete'){
          this.worker.terminate();
          this.worker = null;
          deferred.resolve(event.data.imageData);
        }
      }.bind(this), false);
      this.worker.postMessage({
        imageData: imageData,
        value: this.getValue()
      });
      return deferred.promise;
    }
  });

  return Filter;
});