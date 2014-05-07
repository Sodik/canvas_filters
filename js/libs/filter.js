define(['class'], function(Class){
  var Filter = Class.extend({
    init: function(options){
      this.options = {
        min: 0,
        max: 10,
        step: 1,
        value: 0,
        filterUrl: 'filtre.js'
      }
      for(var key in options){
        if(options.hasOwnProperty(key)){
          this.options[key] = options[key];
        }
      }
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
      if(!this.options.parent){
        throw new Error (
          'You have to set a parent element'
        )
      }else{
        this.options.parent.appendChild(this.holder);
      }
    },
    displayCurrentValue: function(){
      if(typeof this.options.onChange === 'function'){
        this.options.onChange(this.options.value);
      }
      this.displayValue.innerText = this.rangeInput.value;
    },
    attachEvents: function(){
      this.rangeInput.addEventListener('change', function(){
        this.options.value = this.rangeInput.value;
        this.displayCurrentValue();
      }.bind(this));
      this.displayCurrentValue();
    },
    getCurrentValue: function(){
      return this.options.value;
    },
    getData: function(){
      return {
        url: this.options.filterUrl,
        name: this.options.name,
        value: this.options.value
      }
    }
  });

  return Filter;
});