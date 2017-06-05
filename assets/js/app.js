/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

 
'use strict';
angular.module('Authentication', []);
// Declare app level module which depends on other modules
(function(ng) {
angular.module('demoApp', [
    'Authentication','ui.router','as.sortable','ui.bootstrap', 'angular.filter', 'checklist-model',
    'ngCookies', 'angularjs-dropdown-multiselect','ngMaterial', 'ngMessages','ngNotificationsBar',
    'ngProgress','ngResource','ui.bootstrap.dropdown','ngStorage','multiStepForm','angularMaterialPreloader',
    'Tek.progressBar','smart-table','angular-timeline','daterangepicker','ngSanitize', 'ngCsv', 'ngAnimate', 'md.chips.select']).

  // config(['$compileProvider', function ($compileProvider) {
  //   $compileProvider.debugInfoEnabled(false); // testing issue #144
  // $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|tel):/);
  // }]).

  config(['$compileProvider',
        function ($compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|local|data):/);
   }]).

  config(function($mdThemingProvider){
    $mdThemingProvider.theme('default')
    .primaryPalette('deep-orange')
      .backgroundPalette('grey');
  }).



  factory(
  'randomString',
  ['$window',
    function randomStringFactory(w){

      var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      var Math = w.Math;

      return function randomString(length) {
        length = length || 10;
        var string = '', rnd;
        while (length > 0) {
          rnd = Math.floor(Math.random() * chars.length);
          string += chars.charAt(rnd);
          length--;
        }
        return string;
      };
    }
  ]
).

  directive('miniCont', function() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
      $(".header").click(function () {
            console.log(element.next());
            //getting the next element
            var content = element.next();
            //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
            content.slideToggle(500, function () {
              console.log("miniContAfter");
            });

        });
      }
    };
  }).

    directive('expand', function () {
        return {
            restrict: 'A',
            controller: ['$scope', function ($scope) {
                $scope.$on('onExpandAll', function (event, args) {
                    $scope.expanded = args.expanded;
                });
            }]
        };
    }).

    directive('datepick', function() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
                  alert("alerted");

      }
    };
  }).

    directive('collapsecall', function() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        console.log("trig");
        $('.collapse').on('show.bs.collapse', function (e) {
            $('.collapse').not(e.target).removeClass('in');
        })
      }
    };
  }).


  directive('attachview', function() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
      function readURL(input,val) {
            console.log(input);
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                
                reader.onload = function (e) {
                    $('#img'+val).attr('src', e.target.result);
                    $('#link'+val).attr('href', e.target.result);
                    $('#udimg'+val).attr('src', e.target.result);
                    $('#udlink'+val).attr('href', e.target.result);
                }
                
                reader.readAsDataURL(input.files[0]);
            }
        }
        
        $(".imgInp").change(function(){
            readURL(this,this.id);
        });
      }
    };
  }).

  directive('ngFileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.ngFileModel);
            var isMultiple = attrs.multiple;
            var modelSetter = model.assign;
            element.bind('change', function () {
                var values = [];
                angular.forEach(element[0].files, function (item) {
                    var value = {
                       // File Name 
                        name: item.name,
                        //File Size 
                        size: item.size,
                        // File Input Value 
                        file: item
                    };
                    values.push(value);
                });
                scope.$apply(function () {
                    if (isMultiple) {
                        modelSetter(scope, values);
                    } else {
                        modelSetter(scope, values[0]);
                    }
                });
            });
        }
    };
  }]).

  directive('customOnChange', function() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var onChangeFunc = scope.$eval(attrs.customOnChange);
        element.bind('change', onChangeFunc);
        scope.uploadFile();
      }
    };
  }).

  directive('imgModal', [ '$parse', function($parse) {
    return {
      restrict : 'A',
      link : function(scope, element, attrs) {
        $('.pop').on('click', function() {
          $('.imagepreview').attr('src', $(this).find('img').attr('src'));
          $('#imagemodal').modal('show');   
        }); 
      }
    };
  } ]).





directive('fileModel', [ '$parse', function($parse) {
  return {
    restrict : 'A',
    link : function(scope, element, attrs) {
      
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function() {

        scope.$apply(function() {
          modelSetter(scope, element[0].files[0]);
          console.log(element[0].files[0]);
        });
      });
    }
  };
} ]).


directive('tp', [function() {
  return {
    restrict: 'A',
    scope: {
      'model': '='
    },
    link: function(scope, elem, attrs) {
      console.log("called");
      $('.ttp').timepicker({ 'step': 15 });

    }
  }
}]).





  directive("jed", function() {
        
        return {
        restrict : 'E',
        template : '<div class="edit" >Dolor</div>',
        replace: true,
        link : function(scope, element, attrs) {
           $(document).ready(function() {
               $('.edit').editable('http://www.example.com/save.php');
           });
        }
  };
  }).




  config(['$stateProvider', '$urlRouterProvider','$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
      $urlRouterProvider.otherwise("/login")
      $stateProvider
         .state('main', {
             url: "/main",
             templateUrl: "shared/main/main.html"
         })
         .state('main.dashboard', {
             cache: false,
             url: "/dashboard",
             templateUrl: "components/dashboard/view.html",
             controller:"dashController as vm"
         })
        .state('main.employee', {
             url: "/employee",
             templateUrl: "components/employee/views/view.html",
             controller:"EmpKanbanController as main"
         })
         .state('main.approval', {
             cache: false,
             url: "/approval",
             templateUrl: "components/main_comp/approval/views/approval.html",
             controller:"KanbanController"
         })
         /*.state('main.invoice', {
            cache: false,
             url: "/salesinvoice",
             templateUrl: "components/salesinvoice/view.html",
             controller:"salesInvoiceController"
         })*/
         .state('login', {
             url: "/login",
             templateUrl: "components/authentication/views/login.html",
             controller: "LoginController"
         })
         .state('register', {
             url: "/register",
             templateUrl: "components/authentication/views/register.html"
         })



  }])


  .controller('DemoController', ['$scope','$rootScope','$http','$state','$mdDialog', '$location', '$timeout', '$mdSidenav', '$log', '$filter','$window', function ($scope,$rootScope, $http,$state,$mdDialog, $location, $timeout, $mdSidenav, $log, $filter,$window) {
    

    $rootScope.userName = $rootScope.name;
    $rootScope.alertUserId = $rootScope.userid;

    /* This function for getting openbravo alerts for employee */ 
    $scope.getAlerts = function(userID) {
      alert("hei");
      var alerts = BoardDataFactory.fetchAlerts(userID).query(function() {
        //  $state.reload();  
        var alertsArray = [];
        var finalAlertsArray = [];
          for(var i = 0;i < alerts.alertsList.length;i++){
            var alertsData = alerts.alertsList[i];
            alertsArray.push(alertsData.alertName);
          }
          var counts = {};
          alertsArray.forEach(function(element) {
            counts[element] = (counts[element] || 0) + 1;
          });

          for (var element in counts) {
            finalAlertsArray.push(element + '(' + counts[element]+')');
          } 
          console.log(finalAlertsArray);
          alert(finalAlertsArray);
      })
    }

    $scope.toggle = true;
    $scope.toggle2 = true;
    $rootScope.logout = function(){
       $location.path('/login');
       // $window.location.reload(true);

    }


    $scope.isActive = function (viewLocation) {
      var active = false;
      if ($location.$$path.lastIndexOf(viewLocation, 0) != -1) {
        active = true;
      }
      return active;

    };
          $scope.items = [
            {"category":"category1","name":"bullhorn",active:true}, 
            {"category":"category2","name":"car","active":false}, 
            {"category":"category3","name":"star","active":false}
          ];

    $scope.toggleRight = buildToggler('right');
    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };
    $scope.close = function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('right').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };

    function buildToggler(navID) {
      return function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }
    }


  }])

    // .filter('selectedTags', function() {
    //     return function(users, tags) {
    //         return users.filter(function(user) {
    //             if (tags.indexOf(user.projectName) != -1) {
    //                 return true;
    //             } else if(tags.length == 0) {
    //               return true;
    //             }
    //             return false;

    //         });
    //     };
    // })


    .filter('selectedActs', function() {
    return function(title, tags) {
        return title.filter(function(user) {
            if (tags.indexOf(user.title) != -1) {
                return true;
            } else if(tags.length == 0) {
              return true;
            }
            return false;

        });
    };
    })
    


   .controller('AppCtrl', ['$scope', '$interval', function($scope, $interval) {
    var self = this, j= 0, counter = 0;

    self.determinateValue = 0;

    $interval(function() {
      self.determinateValue += 1;
      if (self.determinateValue > 100) self.determinateValue = 0;
    }, 100, 0, true);
  }])


  .controller('notiCtrl', function () {
      var originatorEv;

    this.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };
          ev.stopPropagation();

  })
  .controller('DropdownCtrl',[ '$scope','$log', function($scope,$log)
  {

   $scope.items = [
    "The first choice!",
    "And another choice for you.",
    "but wait! A third!"
  ];



      
  $scope.toggled = function(open) {
 
    var now = new Date();
    $log.info('i was opened...',open,now);
    if (open) {
      $scope.items.push("last opened at " + now);
    }
  };
  }])

.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        });
    }])

  .run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.states = {};
    function updateStates() {
      // Creates a flat object for each state name and whether it is currently
      // active, based on $state.includes
      angular.forEach($state.get(), function (state) {
        $rootScope.states[state.name] = $state.includes(state.name)
      });
    }
    updateStates();
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      updateStates();
    })
  }])

   .directive('stSelectDistinct', [function() {
      return {
        restrict: 'E',
        require: '^stTable',
        scope: {
          collection: '=', 
          predicate: '@',
          predicateExpression: '='
        },
        template: '<select ng-model="selectedOption" ng-change="optionChanged(selectedOption)" ng-options="opt for opt in distinctItems"></select>',
        link: function(scope, element, attr, table) {
          var getPredicate = function() {
            var predicate = scope.predicate;
            if (!predicate && scope.predicateExpression) {
              predicate = scope.predicateExpression;
            }
            return predicate;
          }

          scope.$watch('collection', function(newValue) {
            var predicate = getPredicate();

            if (newValue) {
              var temp = [];
              scope.distinctItems = ['All'];

              angular.forEach(scope.collection, function(item) {
                var value = item[predicate];

                if (value && value.trim().length > 0 && temp.indexOf(value) === -1) {
                  temp.push(value);
                }
              });
              temp.sort();

              scope.distinctItems = scope.distinctItems.concat(temp);
              scope.selectedOption = scope.distinctItems[0];
              scope.optionChanged(scope.selectedOption);
            }
          }, true);

          scope.optionChanged = function(selectedOption) {
            var predicate = getPredicate();

            var query = {};

            query.distinct = selectedOption;

            if (query.distinct === 'All') {
              query.distinct = '';
            }

            table.search(query, predicate);
          };
        }
      }
    }])

    .directive('stSelectMultiple', [function() {
      return {
        restrict: 'E',
        require: '^stTable',
        scope: {
          collection: '=',
          predicate: '@',
          predicateExpression: '='
        },
        templateUrl: 'components/dashboard/partial/selectMultiple.html',
        link: function(scope, element, attr, table) {
          scope.dropdownLabel = '';
          scope.filterChanged = filterChanged;

          initialize();

          function initialize() {
            bindCollection(scope.collection);
          }

          function getPredicate() {
            var predicate = scope.predicate;
            if (!predicate && scope.predicateExpression) {
              predicate = scope.predicateExpression;
            }
            return predicate;
          }

          function getDropdownLabel() {
            var allCount = scope.distinctItems.length;

            var selected = getSelectedOptions();

            if (allCount === selected.length || selected.length === 0) {
              return 'All';
            }

            if (selected.length === 1) {
              return selected[0];
            }

            return selected.length + ' items';
          }

          function getSelectedOptions() {
            var selectedOptions = [];

            angular.forEach(scope.distinctItems, function(item) {
              if (item.selected) {
                selectedOptions.push(item.value);
              }
            });

            return selectedOptions;
          }

          function bindCollection(collection) {
            var predicate = getPredicate();
            var distinctItems = [];

            angular.forEach(collection, function(item) {
              var value = item[predicate];
              fillDistinctItems(value, distinctItems);
            });

            distinctItems.sort(function(obj, other) {
              if (obj.value > other.value) {
                return 1;
              } else if (obj.value < other.value) {
                return -1;
              }
              return 0;
            });

            scope.distinctItems = distinctItems;

            filterChanged();
          }

          function filterChanged() {

            scope.dropdownLabel = getDropdownLabel();

            var predicate = getPredicate();

            var query = {
              matchAny: {}
            };

            query.matchAny.items = getSelectedOptions();
            var numberOfItems = query.matchAny.items.length;
            if (numberOfItems === 0 || numberOfItems === scope.distinctItems.length) {
              query.matchAny.all = true;
            } else {
              query.matchAny.all = false;
            }

            table.search(query, predicate);
          }

          function fillDistinctItems(value, distinctItems) {
            if (value && value.trim().length > 0 && !findItemWithValue(distinctItems, value)) {
              distinctItems.push({
                value: value,
                selected: true
              });
            }
          }

          function findItemWithValue(collection, value) {
            var found = _.find(collection, function(item) {
              return item.value === value;
            });

            return found;
          }
        }
      }
    }])

    .filter('numberFixedLen', function () {
        return function (n, len) {
            var num = parseInt(n, 10);
            len = parseInt(len, 10);
            if (isNaN(num) || isNaN(len)) {
                return n;
            }
            num = ''+num;
            while (num.length < len) {
                num = '0'+num;
            }
            return num;
        };
      })
    .filter('customFilter', ['$filter', function($filter) {
      var filterFilter = $filter('filter');
      var standardComparator = function standardComparator(obj, text) {
        text = ('' + text).toLowerCase();
        return ('' + obj).toLowerCase().indexOf(text) > -1;
      };

      return function customFilter(array, expression) {
        function customComparator(actual, expected) {

          var isBeforeActivated = expected.before;
          var isAfterActivated = expected.after;
          var isLower = expected.lower;
          var isHigher = expected.higher;
          var higherLimit;
          var lowerLimit;
          var itemDate;
          var queryDate;

          if (ng.isObject(expected)) {
            //exact match
            if (expected.distinct) {
              if (!actual || actual.toLowerCase() !== expected.distinct.toLowerCase()) {
                return false;
              }

              return true;
            }

            //matchAny
            if (expected.matchAny) {
              if (expected.matchAny.all) {
                return true;
              }

              if (!actual) {
                return false;
              }

              for (var i = 0; i < expected.matchAny.items.length; i++) {
                if (actual.toLowerCase() === expected.matchAny.items[i].toLowerCase()) {
                  return true;
                }
              }

              return false;
            }

            //date range
            if (expected.before || expected.after) {
              try {
                if (isBeforeActivated) {
                  higherLimit = expected.before;

                  itemDate = new Date(actual);
                  queryDate = new Date(higherLimit);

                  if (itemDate > queryDate) {
                    return false;
                  }
                }

                if (isAfterActivated) {
                  lowerLimit = expected.after;


                  itemDate = new Date(actual);
                  queryDate = new Date(lowerLimit);

                  if (itemDate < queryDate) {
                    return false;
                  }
                }

                return true;
              } catch (e) {
                return false;
              }

            } else if (isLower || isHigher) {
              //number range
              if (isLower) {
                higherLimit = expected.lower;

                if (actual > higherLimit) {
                  return false;
                }
              }

              if (isHigher) {
                lowerLimit = expected.higher;
                if (actual < lowerLimit) {
                  return false;
                }
              }

              return true;
            }
            //etc

            return true;

          }
          return standardComparator(actual, expected);
        }

        var output = filterFilter(array, expression, customComparator);
        return output;
      };
    }]);
})(angular);

// $routeProvider .when('/customers', { templateUrl: '/app/views/customers.html', 
//   resolve: resolveController('/app/controllers/customersController.js') });