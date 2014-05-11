require.config({
  paths: {
    'class': 'libs/class',
    'filter': 'libs/filter',
    'q': 'libs/q.min'
  }
});

require(['app'], function (App) {
  App.init();
  App.addFilter({
    min: 0,
    max: 200,
    step: 10,
    value: 0,
    name: 'Noise',
    filterUrl: 'js/filters/noise.js'
  });
  /*App.addFilter({
    name: 'Blur',
    filterUrl: 'js/filters/blur.js'
  });*/
});