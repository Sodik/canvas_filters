require.config({
  paths: {
    'class': 'libs/class',
  },
  shim: {
    'class': {
      deps: [],
      exports: 'Class'
    }
  }
});

require(['app'], function (App) {
  App.init();
});