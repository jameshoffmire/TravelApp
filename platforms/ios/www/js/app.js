// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

// for SQLite persistence
// https://www.thepolyglotdeveloper.com/2014/11/use-sqlite-instead-local-storage-ionic-framework/
// http://nextflow.in.th/en/2015/easy-way-to-work-with-sqlite-database-in-ionic-framework/
// http://ngcordova.com/docs/install/
var db;
var starter = angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite) {
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
    var db = window.sqlitePlugin.openDatabase({ name: 'my.db', location: 'default' }, function (db) {

      // Here, you might create or open the table.

    }, function (error) {
      console.log('Open database ERROR: ' + JSON.stringify(error));
    });
    // --- LAB 3 ----
    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS People (id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'firstName TEXT, lastName TEXT, phoneNumber TEXT, email TEXT)');
    // Initialization of localStorage
    var permanentStorage = window.localStorage;
    // Setting of key/value pair
    window.localStorage.setItem("key", "value");
    // Retrieval of Value
    var value = window.localStorage.getItem("key");
    // Removal of Value
    window.localStorage.removeItem("key");

  });
})

starter.controller('mainCtrl', function($scope, $ionicModal, $ionicLoading) {
  $scope.firstName = "";
  $scope.lastName = "";
  $scope.phoneNumber = "";
  $scope.email = "";
  $scope.listOfPeople = {};

  $scope.onSubmit = function () {
    var person = {};
    person.id = $scope.firstName+$scope.lastName+$scope.phoneNumber+$scope.email;
    person.firstName = $scope.firstName;
    person.lastName = $scope.lastName;
    person.phoneNumber = $scope.phoneNumber;
    person.email = $scope.email;
    $scope.listOfPeople[$scope.firstName+$scope.lastName+$scope.phoneNumber+$scope.email] = person;
    $ionicLoading.show({ template: 'Person Added!', noBackdrop: true, duration: 1000 });
  };

  $scope.deletePerson = function(person) {
    var toRemove = [];
    angular.forEach($scope.listOfPeople, function(value, key) {
      if (angular.equals(key,person.id)) {
        this.push(key);
      }
    }, toRemove);
    delete $scope.listOfPeople[toRemove[0]];
    $ionicLoading.show({ template: 'Person Deleted!', noBackdrop: true, duration: 1000 });
  };

})
