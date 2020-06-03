angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.views.maxCache(0);
  $stateProvider // $stateProvider is used to maintain state with each view
    .state('tabs', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })
	.state('tabs.login', {
      url: "/login",
      views: {
        'login-tab': {
          templateUrl: "templates/login.html",
          controller: 'loginCtrl'
        }
      }
    })
    .state('tabs.home', {
      url: "/home",
      views: {
        'home-tab': {
          templateUrl: "templates/home.html",
          controller: 'homeCtrl'
        }
      }
    })
    .state('tabs.citySelected', {
      url: "/city",
      params: {
        cityId: ''
      },
      views: {
        'city-tab': {
          templateUrl: "templates/toursListView.html",
          controller: "toursListView"
        }
      }
    })
    .state('tabs.reviews', {
      url: "/reviews",
      params: {
        'tourInfo': '',
        'city': '',
        'state': '',
        'cityId': ''
      },
      views: {
        'reviews-tab' : {
          templateUrl: "templates/reviewsView.html",
          controller: "reviewsViewCtrl"
        }
      }
    })
    .state('tabs.map', {
      url: "/map",
        params: {
            cityId: '', bannerName: '', city:''
        },
      views: {
        'map-tab' : {
          templateUrl: "templates/map.html",
          controller: "mapCtrl"
        }
      }
    })
	.state('tabs.tour', {
      url: "/tour",
	    params: {
	      cityId: '',
	      source: null,
			  destination: null,
			  waypoints: []
			},
      views: {
        'tour-tab' : {
          templateUrl: "templates/tour.html",
          controller: "tourCtrl"
        }
      }
    })
    .state('tabs.finalizeTour', {
      url: "/finalizeTour",
      params: {
        'sitesSelected': '',
        'center': ''
      },
      views: {
        'finalize-tour-tab' : {
          templateUrl: "templates/finalizeTourView.html",
          controller: "finalizeTourCtrl"
        }
      }
    });

  // The line below defines the starter view. Basically, when the app first opens, the root view is displayed.
  // $urlRouterProvider.otherwise is used to set the inital view upon launch. Thus, $urlRouterProvider.otherwise
  // sets the root view based on the URL parameter that is passed to it
  $urlRouterProvider.otherwise("/tab/login");
})