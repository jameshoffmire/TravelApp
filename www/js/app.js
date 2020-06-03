var app = angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives',
  'ionic.contrib.ui.hscrollcards', 'ngCordova', 'ionic.rating'])
.config(function($ionicConfigProvider) {
    //Added config
    //$ionicConfigProvider.views.maxCache(5);
    //$ionicConfigProvider.scrolling.jsScrolling(false);
    //$ionicConfigProvider.tabs.position('bottom'); // other values: top
})
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});