/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */
'use strict'; 

angular
    .module('demoApp') 

    .controller(
        'dashController', ['$http',
            '$scope','$element','$timeout','$rootScope','$location','$mdDialog',
            '$filter','$interval','$state',
            'BoardService',
            'BoardDataFactory', 'notifications','$cookieStore','ngProgressFactory','orderByFilter','$localStorage', '$sessionStorage',
            function($http, $scope, $element, $timeout, $rootScope,$location,$mdDialog, $filter, $interval, $state, BoardService, BoardDataFactory, notifications,
            		$cookieStore,ngProgressFactory,orderBy,$localStorage, $sessionStorage) {
            $scope.activeActIndex = 1;
            $scope.activeInvIndex = 1;

        $rootScope.organization = $rootScope.org;
        $rootScope.businessPartner = $rootScope.busiPartner;
        
        console.log($rootScope.organization,$scope.businessPartner);
        $scope.callState = function(){
            $rootScope.currentState =  $state.current;  
        }
              
        $rootScope.accessDeny=false;
        // Dash Js         
        var userId = $cookieStore.get('globals').currentUser.userId;
        $scope.approverUserId = userId;


        $(document).on('click', '.dropdown-menu', function (e) {
          e.stopPropagation();
        });

        // Default Columns
        $scope.apH = true;
        $scope.rjH = true;
        $scope.inH = true;
        $scope.inHA = true;

        //DateRange Picker
        $scope.selectedRes = {
            set : { 
                       }
        };

        $scope.daterange = {
            range : { 
                        startDate: moment().format('YYYY-MM-DD'),
                        endDate: moment().format('YYYY-MM-DD')
                    }
        };
      
        $scope.SimplePickerChange = function(){
          alert('hi');
            $scope.date = {        
              endDate: $scope.date.startDate.add(30, "days")
            }
            alert(JSON.stringify($scope.date));
        };

        $scope.singleDate = moment().add(30, "days");

        $scope.opts = {
            locale: {
                applyClass: 'btn-green',
                applyLabel: "Apply",
                fromLabel: "From",
                format: "YYYY-MM-DD",
                toLabel: "To",
                cancelLabel: 'Cancel',
                customRangeLabel: 'Custom range'
            },
            ranges: {
                'Last 60 Days': [moment().subtract(60, 'days'), moment()],
                'Last 90 Days': [moment().subtract(90, 'days'), moment()],
                'This month': [moment().startOf('month'), moment().endOf('month')],
                'Last month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        $scope.setStartDate = function () {
            $scope.date.startDate = moment().subtract(4, "days").toDate();
        };

        $scope.setRange = function () {
            $scope.date = {
                startDate: moment().subtract(5, "days"),
                endDate: moment()
            };
        };

       
      $scope.selected = [];

      $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
          list.splice(idx, 1);
        }
        else {
          list.push(item);
        }
      };

      $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
      };

      $scope.isIndeterminate = function() {
        return ($scope.selected.length !== 0 &&
            $scope.selected.length !== $scope.items.length);
      };

      $scope.isChecked = function() {
        return $scope.selected.length === $scope.items.length;
      };

      $scope.toggleAll = function() {
        if ($scope.selected.length === $scope.items.length) {
          $scope.selected = [];
        } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
          $scope.selected = $scope.items.slice(0);
        }
      };

        $scope.resfilter = {
            personnelId:[]
        };

        $rootScope.resFilterChip = [];

        $scope.convertToHHMM = function (decVal){
              // console.log(decVal);
              return $scope.result = moment.duration(parseFloat(decVal) ,'hours').format("HH:mm", {trim: false});
              // console.log($scope.result);
        }


        resourceList();
        //chips - Resource Filter
        function resourceList (){
            var empData = BoardDataFactory.fetchResourceList(userId).query(function() {
                $rootScope.resFilList=empData.resourceList;
                 console.log($rootScope.resFilList);
                 $rootScope.dataHasLoaded=true;
            })
        }

        console.log($scope.resFilterChip);


        $scope.resChipFiltered = [];
        console.log($scope.resFilterChip);
        $scope.$watch('resFilterChip', function(newValue,oldValue) {
            if(newValue !== oldValue){
                $scope.resChipFiltered = [];
             console.log( $rootScope.mdChipItems);

             angular.forEach(newValue, function(value,key){
                $scope.resChipFiltered.push(value.personnelId)
             });
             console.log($scope.resChipFiltered);
             $scope.resourceFilter($scope.resChipFiltered, $scope.changedStartDate, $scope.changedEndDate); 
             } 
        }, true);

        
        $scope.resfilterChecks = function (){    
             console.log($scope.selected);
             $scope.resourceFilter($scope.resChipFiltered, $scope.changedStartDate, $scope.changedEndDate);  

        }

        //Watch for date changes
        $scope.$watch('daterange.range', function(newDateRange,oldDateRange) {
            if(newDateRange !== oldDateRange){
                $scope.changedStartDate = moment(newDateRange.startDate).format('MMM DD, YYYY');
                $scope.changedEndDate = moment(newDateRange.endDate).format('MMM DD, YYYY');
                console.log($scope.resfilter)
                if($scope.resChipFiltered){
                    console.log("ResFilCall");
                    $scope.resourceFilter($scope.resChipFiltered, $scope.changedStartDate, $scope.changedEndDate);

                }

                if($scope.resChipFiltered.length == 0){
                    console.log("DashCall");
                    $scope.getDashTile(newDateRange.startDate, $scope.changedEndDate);

   
                }

            }

        }, true);

        // $scope.$watch('resfilter.personnelId', function(newVal, oldVal) {
        //     console.log($scope.selected);
        //     if(newVal !== oldVal){
        //         $scope.resourceFilter($scope.resfilter.personnelId, $scope.changedStartDate, $scope.changedEndDate);
        //     }
        // }, true);


        $scope.resourceFilter = function(resId, changedStartDate, changedEndDate){
            $scope.sDateResFil = moment(changedStartDate).format('YYYY-MM-DD');
            $scope.eDateResFil = moment(changedEndDate).format('YYYY-MM-DD');
            $scope.resourceFilterSummary (resId, $scope.sDateResFil, $scope.eDateResFil)
            var empData = BoardDataFactory.fetchResourceFilterTile(userId, $scope.sDateResFil, $scope.eDateResFil, resId).query(function() {
                $scope.dashTile=empData.response.activity.tile;
            })
        }

        $scope.resourceFilterSummary = function(resId, changedStartDate, changedEndDate){
             var empData = BoardDataFactory.fetchResourceFilterSummary(userId, changedStartDate, changedEndDate, resId).query(function() {
                $scope.ResNames=empData.response;
                console.log($scope.ResNames);
            })
        }

 

        $scope.lastThDays = moment().subtract(90, 'days').format('YYYY-MM-DD');
        $scope.today = moment().format('YYYY-MM-DD');

        $scope.changedStartDate = moment($scope.lastThDays).format('MMM DD, YYYY');
        $scope.changedEndDate = moment($scope.today).format('MMM DD, YYYY');
        $scope.viewType="Consolidated"
        $scope.downloadType="csv"
          $scope.downloadReport = function(reportCat,viewType,format){
              console.log(reportCat,viewType);
               var empData = BoardDataFactory.fetchReport(userId, moment($scope.changedStartDate).format('YYYY-MM-DD'), moment($scope.changedEndDate).format('YYYY-MM-DD'), $scope.resChipFiltered, reportCat,viewType,format).query(function() {                   
                  location.href = $rootScope.reportUrl;            
              })            
          }



          // $scope.reportType = 'timeSheet';

            $scope.tasks = [{
                name: 'foo'
            }, {
                name: 'bar'
            }];

            $scope.enableEdit = function (item) {
                item.editable = true;
            };

            $scope.disableEdit = function (item) {
                item.editable = false;
            };

      $scope.events = [{
        badgeClass: 'info',
        badgeIconClass: 'glyphicon-check',
        title: 'First heading',
        content: 'Some awesome content.'
      }, {
        badgeClass: 'warning',
        badgeIconClass: 'glyphicon-credit-card',
        title: 'Second heading',
        content: 'More awesome content.'
      }];
      
    
    $scope.modelwee = {};
    $scope.steps = [
        {
            templateUrl: 'activitySummaryTile',
            title: 'Read the docs'
        },
        {
            templateUrl: 'activitySummaryTable',
            title: 'Read the docs'
        },
        {
            templateUrl: 'detailedSummaryTable',
            title: 'Get the source'
            
        },
        {
            templateUrl: 'detailedModal',
            title: 'Get the source'
        }
    ];

    $scope.invoiceSteps = [
            {
                templateUrl: 'salesInvoiceSummaryTile',
                hasForm: true,
                IsolatedStepCtrl: true,
                title: 'Read the docs'
            },
            /*{
                templateUrl: 'salesInvoiceSummary',
                hasForm: true,
                IsolatedStepCtrl: true,
                title: 'Read the docs'
            },*/
            {
                templateUrl: 'salesInvoiceSummaryTable',
                hasForm: true,
                IsolatedStepCtrl: true,
                title: 'Read the docs'
            },
            {
                templateUrl: 'salesInvoiceLineSummaryTable',
                hasForm: true,
                IsolatedStepCtrl: true,
                title: 'Read the docs'
            }
        ];

    $scope.sendActIndex = function (activeIndex) {
            $scope.activeActIndex = activeIndex;
    };

    $scope.sendInvIndex = function (activeIndex) {
            $scope.activeInvIndex = activeIndex;
    };


    // $scope.hideInvoiceSummary = function(){
    //    $scope.activityCheck = true;
    //    $scope.invoiceCheck =false;
    // }

    // $scope.showInvoiceSummary = function(){
    //    $scope.activityCheck = true;
    //    $scope.invoiceCheck = true;
    // }




    $scope.getMoment = function(val){
        return moment(val).format("ddd, MMMM DD, YYYY");
    }

    //totalHours
    $scope.totHours = function(array){
        $scope.val=0;
        angular.forEach(array,function(value,key){       
            $scope.val=$scope.val+parseFloat(value.totalHourWorked);
        });
        return $scope.val;
    }

    //totalExpAMount
    $scope.totExpAmount = function(array){
        $scope.val=0;
        angular.forEach(array,function(value,key){       
            $scope.val=$scope.val+parseFloat(value.amount);
        });
        return $scope.val;
    }

    $scope.setArrowDisable = function(time, exp){
        console.log(time, exp);
        if(time == 0.0 && exp ==0.0){
            return false;
        }else{
            return true;
        }
    }

    $scope.trueVar = true;

    $scope.getStatus = function(array){
        console.log(array);
        $scope.rejCount = 0;
        $scope.inPCount = 0;
        $scope.appCount = 0;
        $scope.rejExpCount = 0;
        $scope.inPExpCount = 0;
        $scope.appExpCount = 0;
        $scope.totalTsCount = 0;
        $scope.totalExpCount = 0;
        $scope.totalTsVal = 0;
        $scope.totalExpVal = 0;

        angular.forEach(array, function(value, key){
            if(value.links[0].rel=='timeSheet'){
                $scope.totalTsCount = $scope.totalTsCount + 1;
                $scope.totalTsVal = parseFloat(value.totalHourWorked) + $scope.totalTsVal;
            }else{
                $scope.totalExpCount = $scope.totalExpCount + 1;
                $scope.totalExpVal = parseFloat(value.amount) + $scope.totalExpVal;
            }           

            // Ts Count
            if(value.timesheetStatus=='Rejected'){
                $scope.rejCount = $scope.rejCount +1;
            }else if(value.timesheetStatus=='Approved Intermediate' || value.timesheetStatus=='Submitted' || value.timesheetStatus=='In Progress'){
                $scope.inPCount = $scope.inPCount +1;
            }else if(value.timesheetStatus=='Approved'){
                $scope.appCount = $scope.appCount +1;
            }

            // Exp Count
            if(value.expenseStatus=='Rejected'){
                $scope.rejExpCount = $scope.rejExpCount +1;
            }else if(value.expenseStatus=='Approved Intermediate' || value.expenseStatus=='Submitted' || value.expenseStatus=='In Progress'){
                $scope.inPExpCount = $scope.inPExpCount +1;
            }else if(value.expenseStatus=='Approved'){
                $scope.appExpCount = $scope.appExpCount +1;
            }
        });

        console.log($scope.totalTsCount, $scope.totalExpCount);
    }

    $scope.getExpStatus = function(array){
        $scope.rejExpCount = 0;
        $scope.inPExpCount = 0;
        $scope.appExpCount = 0;
        // $scope.saveCount = 0;
        angular.forEach(array,function(value,key){       
            if(value.expenseStatus=='Rejected'){
                $scope.rejCount = $scope.rejCount +1;
            }else if(value.expenseStatus=='Approved Intermediate' || value.expenseStatus=='Submitted' || value.expenseStatus=='In Progress'){
                $scope.inPCount = $scope.inPCount +1;
            }else if(value.expenseStatus=='Approved'){
                $scope.appCount = $scope.appCount +1;
            }
        });   
    }

    // csv export
        $scope.filename = "test";
        $scope.getArray = [{a: 1, b:2}, {a:3, b:4}];

      $scope.addRandomRow = function() {
        $scope.getArray.push({a: Math.floor((Math.random()*10)+1), b: Math.floor((Math.random()*10)+1)});
      };

      $scope.getHeader = function () {return ["A", "B"]};





      $scope.searchTerm;
      $scope.clearSearchTerm = function() {
        $scope.searchTerm = '';
      };
      // The md-select directive eats keydown events for some quick select
      // logic. Since we have a search input here, we don't need that logic.
      $element.find('input').on('keydown', function(ev) {
          ev.stopPropagation();
      });

    $scope.passResRef = function(obj){
        console.log(obj);
        $scope.totObj = obj;
        
        $scope.tExArray = obj.timesheets;
        $scope.tExArray = $scope.tExArray.concat(obj.expenses);
        $scope.tExArrayCopy = $scope.tExArray;
        console.log($scope.tExArray);

        $scope.resObjTime =obj.timesheets;
        $scope.resObjTimeCopy = $scope.resObjTime;

        $scope.resObjExp =obj.expenses;
        $scope.resObjExpCopy = $scope.resObj;

    }

    $scope.families = [{
        name: '1st Family',
        persons: ['person 1.1', 'person 1.2']
    }, {
        name: '2nd Family',
        persons: ['person 2.1', 'person 2.2']
    }, {
        name: '3rd Family',
        persons: ['person 3.1', 'person 3.2']
    }, {
        name: '4th Family',
        persons: ['person 4.1', 'person 4.2']
    }, {
        name: '5th Family',
        persons: ['person 5.1', 'person 5.2']
    }];

    $scope.countt = 0; 
    $scope.someMethod = function(val){
        console.log(val);
        $scope.som = val;
        // angular.forEach(val,function(value, key){
        //     if(value.links[0].rel == 'timeSheet'){
        //           $scope.countt = $scope.countt + 1;
        //     }
        // })            
    }
    $scope.someMethod2 = function(val){
        console.log(val);
        $scope.some = val;
        // angular.forEach(val,function(value, key){
        //     if(value.links[0].rel == 'timeSheet'){
        //           $scope.countt = $scope.countt + 1;
        //     }
        // })            
    }
    
    $scope.activityFilterId = {selectedId:null};
    $scope.passRecordDetails = function(indexVal,val, type){
        $scope.showDayBreakUp = false;
        if(type=='expense'){
            $scope.currentCategoryId= val[indexVal].categoryId;
            $scope.fileredIdforNgSelected = val[indexVal].expenseId;
        }else if(type == 'timesheet'){
            $scope.currentActivityId= val[indexVal].activityId;
            $scope.fileredIdforNgSelected = val[indexVal].timesheetId;
        }
   
        $scope.detailType = type;
        $scope.fullDetailList = val;

        $scope.currentRecordDetail = val[indexVal];

        var timesheetWorkflow,expenseWorkflow;
        if(type == 'timesheet'){
            var fullRecordDetail = BoardDataFactory.fetchTimeRecordDetails(val[indexVal].timesheetId).query(function() {
                $scope.detailedTimeTable = fullRecordDetail.timesheetRecord;
                
            }),
                timesheetWorkflow = BoardDataFactory.fetchTimeAuditDetails(val[indexVal].timesheetId).query(function() {
                $scope.timesheetWorkflow = timesheetWorkflow.response;

            })
        }else if(type == 'expense'){
            var fullRecordDetail = BoardDataFactory.fetchExpRecordDetails(val[indexVal].expenseId).query(function() {
                $scope.detailedTimeTable = fullRecordDetail.expenseRecord;
            }),
                expenseWorkflow = BoardDataFactory.fetchExpenseAuditDetails(val[indexVal].expenseId).query(function() {
                $scope.expenseWorkflow = expenseWorkflow.response;

            })
        }

    }

    $scope.$watch('activityFilterId.selectedId', function(newValue, oldValue) {
      
      $scope.showDayBreakUp = false;
      var filtId = JSON.parse(newValue);
      console.log(filtId);

      if (newValue !== oldValue) {

        if(filtId.links[0].rel == 'timeSheet'){
             var fullRecordDetail = BoardDataFactory.fetchTimeRecordDetails(filtId.timesheetId).query(function() {
                $scope.detailedTimeTable = fullRecordDetail.timesheetRecord;  
                $scope.showDayBreakUp = true;              
            }),
                timesheetWorkflow = BoardDataFactory.fetchTimeAuditDetails(filtId.timesheetId).query(function() {
                $scope.timesheetWorkflow = timesheetWorkflow.response;
            })
            $scope.detailType = 'timesheet';

        }else if(filtId.links[0].rel == 'expense'){
            var fullRecordDetail = BoardDataFactory.fetchExpRecordDetails(filtId.expenseId).query(function() {
                $scope.detailedTimeTable = fullRecordDetail.expenseRecord;
                $scope.showDayBreakUp = true;
            }),
                expenseWorkflow = BoardDataFactory.fetchExpenseAuditDetails(filtId.expenseId).query(function() {
                $scope.expenseWorkflow = expenseWorkflow.response;
            })
            $scope.detailType = 'expense';
        }
      }

      $scope.currentRecordDetail = filtId;
      console.log($scope.currentRecordDetail);
    },true);


    $scope.passIdforPrevNav = function(currentId, fullDetailList, type){
            console.log(currentId);
            $scope.activityFilter = currentId;
            angular.forEach(fullDetailList, function(value, key){
                if(type=='expense' && value.categoryId == currentId){  
                console.log(key); 
                    $scope.currentCategoryId = $scope.fullDetailList[key-1].categoryId;
                    $scope.currentExpenseId = $scope.fullDetailList[key-1].expenseId;
                    $scope.currentRecordDetail = $scope.fullDetailList[key-1];
                    console.log($scope.currentRecordDetail.links[0].rel);
                    if($scope.currentRecordDetail.links[0].rel == 'timeSheet'){
                        $scope.detailType = 'timesheet';
                    }else{
                        $scope.detailType = 'expense';
                    }
                    
                }

                if(type=='timesheet' && value.activityId == currentId){
                    console.log(key);
                    $scope.currentActivityId = $scope.fullDetailList[key-1].activityId;
                    $scope.currentTimesheetId = $scope.fullDetailList[key-1].timesheetId;
                    $scope.currentRecordDetail = $scope.fullDetailList[key-1];

                    if($scope.currentRecordDetail.links[0].rel == 'timeSheet'){
                        $scope.detailType = 'timesheet';
                    }else{
                        $scope.detailType = 'expense';
                    }
                    
                }
            });

            if(type == 'timesheet'){
                var fullRecordDetail = BoardDataFactory.fetchTimeRecordDetails($scope.currentTimesheetId).query(function() {
                    $scope.detailedTimeTable = fullRecordDetail.timesheetRecord;
                    
                }),
                    timesheetWorkflow = BoardDataFactory.fetchTimeAuditDetails($scope.currentTimesheetId).query(function() {
                    $scope.timesheetWorkflow = timesheetWorkflow.response;

                })
            }else if(type == 'expense'){
                var fullRecordDetail = BoardDataFactory.fetchExpRecordDetails($scope.currentExpenseId).query(function() {
                    $scope.detailedTimeTable = fullRecordDetail.expenseRecord;
                }),
                    expenseWorkflow = BoardDataFactory.fetchExpenseAuditDetails($scope.currentExpenseId).query(function() {
                    $scope.expenseWorkflow = expenseWorkflow.response;

                })
            }
    }

    $scope.passIdforNextNav = function(currentId, fullDetailList, type){
            console.log(currentId);

            angular.forEach(fullDetailList, function(value, key){
                if(type=='expense' && value.categoryId == currentId){   
                    $scope.currentCategoryId = $scope.fullDetailList[key+1].categoryId;
                    $scope.currentExpenseId = $scope.fullDetailList[key+1].expenseId;
                    $scope.currentRecordDetail = $scope.fullDetailList[key+1];
                    if($scope.currentRecordDetail.links[0].rel == 'timeSheet'){
                        $scope.detailType = 'timesheet';
                    }else{
                        $scope.detailType = 'expense';
                    }
                }

                if(type=='timesheet' && value.activityId == currentId){
                    $scope.currentActivityId = $scope.fullDetailList[key+1].activityId;
                    $scope.currentTimesheetId = $scope.fullDetailList[key+1].timesheetId;
                    $scope.currentRecordDetail = $scope.fullDetailList[key+1];
                    if($scope.currentRecordDetail.links[0].rel == 'timeSheet'){
                        $scope.detailType = 'timesheet';
                    }else{
                        $scope.detailType = 'expense';
                    }
                }
            });

            if(type == 'timesheet'){
                var fullRecordDetail = BoardDataFactory.fetchTimeRecordDetails($scope.currentTimesheetId).query(function() {
                    $scope.detailedTimeTable = fullRecordDetail.timesheetRecord;
                    
                }),
                    timesheetWorkflow = BoardDataFactory.fetchTimeAuditDetails($scope.currentTimesheetId).query(function() {
                    $scope.timesheetWorkflow = timesheetWorkflow.response;

                })
            }else if(type == 'expense'){
                var fullRecordDetail = BoardDataFactory.fetchExpRecordDetails($scope.currentExpenseId).query(function() {
                    $scope.detailedTimeTable = fullRecordDetail.expenseRecord;
                }),
                    expenseWorkflow = BoardDataFactory.fetchExpenseAuditDetails($scope.currentExpenseId).query(function() {
                    $scope.expenseWorkflow = expenseWorkflow.response;

                })
            }
    }

    



    var self = this;
    self.show= function(ev){
      $mdDialog.show({
        templateUrl: 'temps.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        fullscreen: false
      });
    }

    var originatorEv;

    $scope.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    this.notificationsEnabled = true;
    this.toggleNotifications = function() {
      this.notificationsEnabled = !this.notificationsEnabled;
    };
 
    this.redial = function() {
      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Suddenly, a redial')
          .textContent('You just called a friend; who told you the most amazing story. Have a cookie!')
          .ok('That was easy')
      );

      originatorEv = null;
    };

    this.checkVoicemail = function() {
      // This never happens.
    };

        // var self = this;
        // self.dealers = Dealers.query();

        self.expandAll = function (expanded) {
            // $scope is required here, hence the injection above, even though we're using "controller as" syntax
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        

        $scope.getempdetails = function (userId, defSDate, defEDate) {

            $scope.dashEmpShow = false;
            var empData = BoardDataFactory.fetchAllEmployeeDetails(userId, defSDate, defEDate).query(function() {
                  $scope.ResNames=empData.response;
                  console.log(empData.response);
                  $scope.dashEmpShow = true;
            })
        }

        /*$scope.getDashTile = function (sDate,eDate) {

            $scope.chStrDate = moment(sDate).format('YYYY-MM-DD');
            $scope.chEndDate = moment(eDate).format('YYYY-MM-DD');
            $scope.getempdetails(userId, $scope.chStrDate,  $scope.chEndDate);
            // alert($scope.chStrDate);
            $scope.dashTileShow = false;
            var empData = BoardDataFactory.fetchDashTiles(userId,$scope.chStrDate,$scope.chEndDate).query(function() {
                    console.log(empData);
                  $scope.dashTile=empData.response.activity.tile;
                  $scope.dashTileShow = true;
            })
        }
*/




 $scope.getDashTile = function (sDate,eDate) {

            $scope.chStrDate = moment(sDate).format('YYYY-MM-DD');
            $scope.chEndDate = moment(eDate).format('YYYY-MM-DD');
            $scope.getempdetails(userId, $scope.chStrDate,  $scope.chEndDate);
            // alert($scope.chStrDate);
            $scope.dashTileShow = false;
                  var empData = BoardDataFactory.fetchDashTiles(userId,$scope.chStrDate,$scope.chEndDate).query(function() {
                  console.log(empData);
                  $scope.dashTile=empData.response.activity.tile;
                  $scope.dashTileShow = true;


                    /*salesInvoiceSummaryTile*/

                    var salesInvoiceSummaryTile = BoardDataFactory.fetchSalesInvoiceSummaryTile(userId,'Customer_Approving_Manager',$scope.chStrDate,$scope.chEndDate).query(function() {

                    console.log(salesInvoiceSummaryTile);

                    $scope.salesInvoiceSummaryTileData = salesInvoiceSummaryTile.response;
                    console.log($scope.salesInvoiceSummaryTileData); 

                    $scope.summarytotalAmount = $scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.summarytotalAmount;
                    $scope.summaryOutstandingAmount = $scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.summaryOutstandingAmount;
                    $scope.summaryPaid = $scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.summaryPaid;
                    $scope.summaryDueAmount = $scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.summaryOverDueAmount;
                    $scope.summaryCurrentDueAmount = $scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.summaryCurrentDueAmount;

                    $scope.currency = $scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.currency;

                    console.log($scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.summarytotalAmount);
                  $scope.dashTileShow = true;
            })
            })
                  
         }

        /*salesInvoiceSummaryTile*/

         $scope.getSalesInvoiceSummaryTile = function(sDate,eDate) {
                var varUserId = $cookieStore.get('globals').currentUser.userId; 
                $scope.chStrDate = moment(sDate).format('YYYY-MM-DD');
                $scope.chEndDate = moment(eDate).format('YYYY-MM-DD');
                  var salesInvoiceSummaryTile = BoardDataFactory.fetchSalesInvoiceSummaryTile(varUserId,'Customer_Approving_Manager',$scope.chStrDate,$scope.chEndDate).query(function() {
                    $scope.salesInvoiceSummaryTileData = salesInvoiceSummaryTile.response;
                    console.log($scope.salesInvoiceSummaryTileData); 

                    $scope.summarytotalAmount = $scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.summarytotalAmount;
                    $scope.summaryOutstandingAmount = $scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.summaryOutstandingAmount;
                    $scope.summaryPaid = $scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.summaryPaid;
                    $scope.summaryDueAmount = $scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.summaryDueAmount;
                    $scope.currency = $scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.currency;

                    console.log($scope.salesInvoiceSummaryTileData.salesInvoiceSummary.tile.summarytotalAmount);


                })
            }


            //getting sales invoice summary response data            
            $scope.getSalesInvoiceSummary = function(sDate,eDate) {
                var varUserId = $cookieStore.get('globals').currentUser.userId; 
                $scope.chStrDate = moment(sDate).format('YYYY-MM-DD');
                $scope.chEndDate = moment(eDate).format('YYYY-MM-DD');
                var salesInvoiceSummary = BoardDataFactory.getSalesInvoiceSummary(varUserId,'Customer_Approving_Manager',$scope.chStrDate,$scope.chEndDate).query(function() {
                    $scope.salesInvoiceSummaryData = salesInvoiceSummary.response;
                     console.log($scope.salesInvoiceSummaryData); 

                    // $scope.salesInvoiceSummaryDataLine = salesInvoiceSummary.response.invoiceSummary;

                })
            }




            //Sales invoice lines Array (sorted by lineNumber)
            $scope.getSalesInvoiceLines = function(obj){
                    console.log(obj);
                    $scope.totalinvoice=obj;
                    console.log($scope.totalinvoice);              
                    $scope.invoiceLinesArr = obj.invoiceLines;
                    console.log($scope.invoiceLinesArr);
                    $scope.invoiceLines = {};
                    for (var i = 0; i < $scope.invoiceLinesArr.length; i++) {
                        var item = $scope.invoiceLinesArr[i];
                        $scope.invoiceLines[ item.lineNumber ] = item;
                    }
            }


        $scope.getemprojdetails = function(resId) {

            var empData = BoardDataFactory.fetchDashBoardProjects(userId,resId).query(function() {
                  $scope.ProjNames=empData.response;
                  console.log($scope.ProjNames);
            })
         }
        $scope.getprojrepdetails = function(resId,projId) {

            var empData = BoardDataFactory.fetchDashReportingCycle(userId,resId,projId).query(function() {
                  $scope.RepCyc=empData.response;
                  console.log($scope.RepCyc);
            })
         }

        $scope.switch = 'time';

        $scope.repCycDialog = function(ev) {
            $mdDialog.show({
                templateUrl: 'projRepCycle',
                scope: $scope,
                preserveScope: true,
                parent: angular.element(document.body),
                targetEvent: ev,
                escapeToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            })
        };

        $scope.changeDateFormat = function(dateVal){
            var dateFortmatted = moment(dateVal, "YYYY-MM-DD").format("MMM DD, YYYY");
            return dateFortmatted;
        }

        $scope.passResProj = function(resName, projName){
            $scope.resName=resName;
            $scope.projName=projName;
        }


        // Table Acordion 
    $scope.tableRowExpanded = false;
    $scope.tableRowIndexExpandedCurr = "";
    $scope.tableRowIndexExpandedPrev = "";
    $scope.storeIdExpanded = "";
    
    $scope.dayDataCollapseFn = function () {
        $scope.dayDataCollapse = [];
        for (var i = 0; i < $scope.storeDataModel.storedata.length; i += 1) {
            $scope.dayDataCollapse.push(false);
        }
    };
    
       
    $scope.selectTableRow = function (index, storeId) {
        if (typeof $scope.dayDataCollapse === 'undefined') {
            $scope.dayDataCollapseFn();
        }

        if ($scope.tableRowExpanded === false && $scope.tableRowIndexExpandedCurr === "" && $scope.storeIdExpanded === "") {
            $scope.tableRowIndexExpandedPrev = "";
            $scope.tableRowExpanded = true;
            $scope.tableRowIndexExpandedCurr = index;
            $scope.storeIdExpanded = storeId;
            $scope.dayDataCollapse[index] = true;
        } else if ($scope.tableRowExpanded === true) {
            if ($scope.tableRowIndexExpandedCurr === index && $scope.storeIdExpanded === storeId) {
                $scope.tableRowExpanded = false;
                $scope.tableRowIndexExpandedCurr = "";
                $scope.storeIdExpanded = "";
                $scope.dayDataCollapse[index] = false;
            } else {
                $scope.tableRowIndexExpandedPrev = $scope.tableRowIndexExpandedCurr;
                $scope.tableRowIndexExpandedCurr = index;
                $scope.storeIdExpanded = storeId;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedPrev] = false;
                $scope.dayDataCollapse[$scope.tableRowIndexExpandedCurr] = true;
            }
        }

    };

    $scope.storeDataModel = {
        "metadata": {
            "storesInTotal": "25",
            "storesInRepresentation": "6"
        },
        "storedata": [{
            "store": {
                "storeId": "1000",
                    "storeName": "Store 1",
                    "storePhone": "+46 31 1234567",
                    "storeAddress": "Avenyn 1",
                    "storeCity": "Gothenburg"
            },
            "data": {
                "startDate": "2013-07-01",
                "endDate": "2013-07-02",
                "costTotal": "100000",
                "salesTotal": "150000",
                "revenueTotal": "50000",
                "averageEmployees": "3.5",
                "averageEmployeesHours": "26.5",
                "dayData": [{
                    "date": "2013-07-01",
                    "cost": "50000",
                    "sales": "71000",
                    "revenue": "21000",
                    "employees": "3",
                    "employeesHoursSum": "24"
                }, {
                    "date": "2013-07-02",
                    "cost": "50000",
                    "sales": "79000",
                    "revenue": "29000",
                    "employees": "4",
                    "employeesHoursSum": "29"
                }]
            }
        }, {
            "store": {
                "storeId": "2000",
                "storeName": "Store 2",
                "storePhone": "+46 8 9876543",
                "storeAddress": "Drottninggatan 100",
                "storeCity": "Stockholm"
            },
            "data": {
                "startDate": "2013-07-01",
                "endDate": "2013-07-02",
                "costTotal": "170000",
                "salesTotal": "250000",
                "revenueTotal": "80000",
                "averageEmployees": "4.5",
                "averageEmployeesHours": "35",
                "dayData": [{
                    "date": "2013-07-01",
                    "cost": "85000",
                    "sales": "120000",
                    "revenue": "35000",
                    "employees": "5",
                    "employeesHoursSum": "38"
                }, {
                    "date": "2013-07-02",
                    "cost": "85000",
                    "sales": "130000",
                    "revenue": "45000",
                    "employees": "4",
                    "employeesHoursSum": "32"
                }]
            }
        }, {
            "store": {
                "storeId": "3000",
                "storeName": "Store 3",
                "storePhone": "+1 99 555-1234567",
                "storeAddress": "Elm Street",
                "storeCity": "New York"
            },
            "data": {
                "startDate": "2013-07-01",
                "endDate": "2013-07-02",
                "costTotal": "2400000",
                "salesTotal": "3800000",
                "revenueTotal": "1400000",
                "averageEmployees": "25.5",
                "averageEmployeesHours": "42",
                "dayData": [{
                    "date": "2013-07-01",
                    "cost": "1200000",
                    "sales": "1600000",
                    "revenue": "400000",
                    "employees": "23",
                    "employeesHoursSum": "41"
                }, {
                    "date": "2013-07-02",
                    "cost": "1200000",
                    "sales": "2200000",
                    "revenue": "1000000",
                    "employees": "28",
                    "employeesHoursSum": "43"
                }]
            }
        }, {
            "store": {
                "storeId": "4000",
                "storeName": "Store 4",
                "storePhone": "0044 34 123-45678",
                "storeAddress": "Churchill avenue",
                "storeCity": "London"
            },
            "data": {
                "startDate": "2013-07-01",
                "endDate": "2013-07-02",
                "costTotal": "1700000",
                "salesTotal": "2300000",
                "revenueTotal": "600000",
                "averageEmployees": "13.0",
                "averageEmployeesHours": "39",
                "dayData": [{
                    "date": "2013-07-01",
                    "cost": "850000",
                    "sales": "1170000",
                    "revenue": "320000",
                    "employees": "14",
                    "employeesHoursSum": "39"
                }, {
                    "date": "2013-07-02",
                    "cost": "850000",
                    "sales": "1130000",
                    "revenue": "280000",
                    "employees": "12",
                    "employeesHoursSum": "39"
                }]
            }
        }, {
            "store": {
                "storeId": "5000",
                "storeName": "Store 5",
                "storePhone": "+33 78 432-98765",
                "storeAddress": "Le Big Mac Rue",
                "storeCity": "Paris"
            },
            "data": {
                "startDate": "2013-07-01",
                "endDate": "2013-07-02",
                "costTotal": "1900000",
                "salesTotal": "2500000",
                "revenueTotal": "600000",
                "averageEmployees": "16.0",
                "averageEmployeesHours": "37",
                "dayData": [{
                    "date": "2013-07-01",
                    "cost": "950000",
                    "sales": "1280000",
                    "revenue": "330000",
                    "employees": "16",
                    "employeesHoursSum": "37"
                }, {
                    "date": "2013-07-02",
                    "cost": "950000",
                    "sales": "1220000",
                    "revenue": "270000",
                    "employees": "16",
                    "employeesHoursSum": "37"
                }]
            }
        }, {
            "store": {
                "storeId": "6000",
                "storeName": "Store 6",
                "storePhone": "+49 54 7624214",
                "storeAddress": "Bier strasse",
                "storeCity": "Berlin"
            },
            "data": {
                "startDate": "2013-07-01",
                "endDate": "2013-07-02",
                "costTotal": "1800000",
                "salesTotal": "2200000",
                "revenueTotal": "400000",
                "averageEmployees": "11.0",
                "averageEmployeesHours": "39",
                "dayData": [{
                    "date": "2013-07-01",
                    "cost": "900000",
                    "sales": "1100000",
                    "revenue": "200000",
                    "employees": "12",
                    "employeesHoursSum": "39"
                }, {
                    "date": "2013-07-02",
                    "cost": "900000",
                    "sales": "1100000",
                    "revenue": "200000",
                    "employees": "10",
                    "employeesHoursSum": "39"
                }]
            }
        }],
            "_links": {
            "self": {
                "href": "/storedata/between/2013-07-01/2013-07-02"
            }
        }
    };



      /* This function for getting openbravo alerts for employee */ 
          
          var varUserId = $cookieStore.get('globals').currentUser.userId; 
              var alerts = BoardDataFactory.fetchAlerts(varUserId).query(function() {               
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
                  $rootScope.alertArr = finalAlertsArray;

              })
            
              //-------------------------------------------------------------



            $rootScope.materialPreloader = false;

            $scope.hidePage = false;
            $scope.convDate = function (val){
              var date=val;
              var newdate = moment(date).format('YYYY-MM-DD'); ;
              return newdate;
            }

             $scope.viewEntry = function(ev, pos, card, linedocs) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'viewLineItems',
                    scope: $scope,
                    preserveScope: true,
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    escapeToClose: true,
                    locals:{dataToPass: pos,carddataToPass: card,linedocsTopass: linedocs}, 
                    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.

                })

            };

            function DialogController($scope, $mdDialog, dataToPass,carddataToPass,linedocsTopass) {
                $scope.lineindex = dataToPass;
                $scope.card = carddataToPass;
                $scope.lineDocitem = linedocsTopass;
            }

            $scope.cancelView = function (){
   
                $mdDialog.cancel();

            }

        	$rootScope.processArray = [];

            $rootScope.$storage = $localStorage;
            $rootScope.delete = function() {
                delete $rootScope.$storage.x;
            };
        	
        	$scope.open = function(ev) {
        		$mdDialog.show({
                  templateUrl: 'dialog-template.html',
                  scope: $scope,
                  preserveScope: true,
                  targetEvent: ev
        		});
        	};
        	
        	$scope.close = function() {
                $mdDialog.hide();
              };

            // Date Local
            var myDate= new Date();
			var locale = window.navigator.userLanguage || window.navigator.language;	
			$scope.myDate = myDate.toLocaleDateString([locale]);


		    $scope.reset = function() {
                $scope.selectData="";
                $scope.form.$setPristine();
		    };
		    
		    var userId = $cookieStore.get('globals').currentUser.userId;
		    
		    var approvalDocuments = BoardDataFactory.approvalDocs().query(function() {
                $scope.hidePage = true;
		    	$rootScope.approval.complete();
		    	$scope.kanbanBoard = BoardService.kanbanBoard(approvalDocuments);
    		                        
            addRejectReasonToArray($scope.kanbanBoard);
            
            //sorting the reporting cycles        
            var reportingCycles1 = $scope.kanbanBoard.columns[0].reportingCycles;                     
            var arrResult = {};
            for (var i = 0; i < reportingCycles1.length; i++) {
                var item = reportingCycles1[i];
                arrResult[ item.reportCycle ] = item;
            }
                                    
            var i = 0;
            var nonDuplicatedreportingCyclesArray = [];    
            for(var item in arrResult) {
             nonDuplicatedreportingCyclesArray[i++] = arrResult[item];
            }                        
            
            $scope.nonDuplicatedreportingCyclesArray = nonDuplicatedreportingCyclesArray;
            $scope.sortrepCycDateArray = $filter('orderBy')($scope.nonDuplicatedreportingCyclesArray, 'reportCycle');
        
            $scope.clearFilter = function()
                {

                    $scope.myFilter3='';$scope.myFilter4='';$scope.myFilter5='';$scope.myFilter6='';
                }
            //myFilter1
            $scope.myFilter1 = "";
            $scope.mF1style="off";
            $scope.etoggleButton = function() {
                if($scope.myFilter1 == "")
                {
                    $scope.myFilter1 = {"type":"expense"};
                    $scope.mF1style="on";
                }else
                {
                    $scope.myFilter1 = "";
                    $scope.mF1style="off";
                }
                
            }  

            //myFilter2
            $scope.myFilter2 = "";
            $scope.mF2style="off";
            $scope.ttoggleButton = function() {
                if($scope.myFilter2 == "")
                {
                    $scope.myFilter2 = {"type":"timesheet"};
                    $scope.mF2style="on";
                }else
                {
                    $scope.myFilter2 = "";
                    $scope.mF2style="off";
                }
                
            } 

            //sorting the reporting cycles ends
	    	
            $scope.proBtn=false;
            $scope.kanbanSortOptions = {

            	itemMoved: function(event) {
                    $scope.kanbanBoard.columns.documents=$filter

                   if (event.dest.sortableScope.$parent.column.name === "Reject") {
                        $scope.open();
                   }

                   //  if (event.dest.sortableScope.$parent.column.name === "Reject" || event.dest.sortableScope.$parent.column.name === "Approve") {
                   //      console.log(event.dest.sortableScope.$parent.column.documents.length)
                   //      if(event.dest.sortableScope.$parent.column.documents.length > 0)
                   //        $scope.proBtn=true;
                   // }
                   if ( $scope.kanbanBoard.columns[1].documents.length > 0 || $scope.kanbanBoard.columns[2].documents.length > 0)
                   {
                    $scope.proBtn=true;
                   }else{
                    $scope.proBtn=false;
                   }
                    
                },

                orderChanged: function(event) {

                },
                dragEnd: function(event){
                       angular.forEach(event.dest.sortableScope.$parent.column.documents, function (value, key) {
							var rejectArray = [];
							var rejectSel={};

							rejectSel.projectId=value.projectId;
							rejectSel.type=value.type;

							rejectArray.push(rejectSel);

							$scope.rejectTest=rejectSel;

                            /*
                             * Selected Reject Reason available for the card being dragged to 'Reject' column
                             */
                            $scope.sendData = function(selectRejectReason) {
                            $scope.rejectId = selectRejectReason;
                            updatingCard(selectRejectReason, value);
                        }

					   })  
                },

                containment: '#board'
            };

            //sum of timesheets hours and expenses amounts
            $scope.getTotal = function(column) {
                                            
                var docCount = {
                    totalTimeSheetHours: 0,
                    totalExpenseAmount: 0
                };
                var sec = 0;
                var selectedProject = $scope.myFilter3;
                var selectedActOrExp = $scope.myFilter4;
                var selectedEmployee = $scope.myFilter5;
                var selectedRepCycle = $scope.myFilter6;
                
                var isFilterApplied = false;
                
                angular.forEach(column.documents, function(card) {
                    
                    var isFilteredCard = true;
                    
                    if(isFilteredCard){
                        if(selectedProject != null && selectedProject != ""){
                            isFilterApplied = true;
                            isFilteredCard = getHdrRecordCardArray(card.projectName, selectedProject);
                        } 
                    }
                    
                    if(isFilteredCard){
                        if (selectedActOrExp != null && selectedActOrExp != ""){
                            isFilterApplied = true;
                            isFilteredCard = getHdrRecordCardArray(card.title, selectedActOrExp);
                        } 
                    }
                    
                    if(isFilteredCard){
                        if(selectedEmployee != null && selectedEmployee != ""){
                            isFilterApplied = true;
                            isFilteredCard = getHdrRecordCardArray(card.empName, selectedEmployee);
                        }
                    }
                    
                    if(isFilteredCard){
                        if(selectedRepCycle != null && selectedRepCycle != ""){
                            isFilterApplied = true;
                            isFilteredCard = getHdrRecordCardArray(card.reportCycle, selectedRepCycle);
                        }
                    }
                        
                    if(!isFilterApplied){                                   
                        if (card.type == "timesheet") {     
                             sec+= toSeconds(card.value);                           
                        } else if (card.type == "expense") {                        
                            docCount.totalExpenseAmount+=parseFloat(card.value);
                        }
                    } else if(isFilteredCard){
                        if (card.type == "timesheet") {                       
                            sec+= toSeconds(card.value);                            
                        } else if (card.type == "expense") {                        
                            docCount.totalExpenseAmount+=parseFloat(card.value);
                        }
                    } 
                });
                
                var result = fill(Math.floor(sec / 3600), 2);
                docCount.totalTimeSheetHours = result;
                
                return docCount;
            };
            
            function getHdrRecordCardArray(cardElement, filterName){
                if (cardElement === filterName) {
                    return true;
                }
                return false;
            }
            
            function toSeconds(s) {
                var p = s.split(':');
                return parseInt(p[0], 10) * 3600 + parseInt(p[1], 10) * 60;
            }
            
            function fill(s, digits) {
                s = s.toString();
                while (s.length < digits) s = '0' + s;
                return s;
            }

            $scope.getTime = function(val) {
                var hrs = parseInt(val, 10);
                var min = Math.round((val - hrs) * 60);
                if (min < 10) {
                    return hrs + ':' + "0" + min;
                } else {
                    return hrs + ':' + min;
                }

            }


            $scope.tag = function(message) {
                if ($scope.tags) {
                    return $scope.tags
                        .replace(/\s*,\s*/g,
                            ',')
                        .split(',')
                        .every(
                            function(tag) {
                                return message.tags
                                    .some(function(
                                        objTag) {
                                        return objTag
                                            .indexOf(tag) !== -1;
                                    });
                            });
                } else {
                    return true;
                }
            };


            /*
             * It gives the count of available timesheet or an expense documents available in their respective swimlanes after 
             * filter is applied. 
             */
            $scope.count = function(column) {
                                            
                var docCount = {
                    timeSheet: 0,
                    expense: 0
                };

                var selectedProject = $scope.myFilter3;
                var selectedActOrExp = $scope.myFilter4;
                var selectedEmployee = $scope.myFilter5;
                var selectedRepCycle = $scope.myFilter6;
                
                var isFilterApplied = false;
                
                angular.forEach(column.documents, function(card) {
                    
                    var isFilteredCard = true;
                    
                    if(isFilteredCard){
                        if(selectedProject != null && selectedProject != ""){
                            isFilterApplied = true;
                            isFilteredCard = getHdrRecordCardArrayCount(card.projectName, selectedProject);
                        } 
                    }
                    
                    if(isFilteredCard){
                        if (selectedActOrExp != null && selectedActOrExp != ""){
                            isFilterApplied = true;
                            isFilteredCard = getHdrRecordCardArrayCount(card.title, selectedActOrExp);
                        } 
                    }
                    
                    if(isFilteredCard){
                        if(selectedEmployee != null && selectedEmployee != ""){
                            isFilterApplied = true;
                            isFilteredCard = getHdrRecordCardArrayCount(card.empName, selectedEmployee);
                        }
                    }
                    
                    if(isFilteredCard){
                        if(selectedRepCycle != null && selectedRepCycle != ""){
                            isFilterApplied = true;
                            isFilteredCard = getHdrRecordCardArrayCount(card.reportCycle, selectedRepCycle);
                        }
                    }
                        
                    if(!isFilterApplied){                                   
                        if (card.type == "timesheet") {
                            docCount.timeSheet++;
                        } else if (card.type == "expense") {
                            docCount.expense++;
                        }
                    } else if(isFilteredCard){
                        if (card.type == "timesheet") {
                            docCount.timeSheet++;
                        } else if (card.type == "expense") {
                            docCount.expense++;
                        }
                    } 
                });
                return docCount;
            };
            
            function getHdrRecordCardArrayCount(cardElement, filterName){
                if (cardElement === filterName) {
                    return true;
                }
                return false;
            }

            //process button 										
            function array(column) {
                var jArray = [];
                angular.forEach(column.documents, function(card) {
                     var processObj = {};
                     processObj.id = card.id;
                     processObj.rejectReason=card.rejectReason;
                     processObj.type = card.type;
                    jArray.push(processObj);
                });
                return jArray;
            }

            /*
             * After the Approving Manager process the cards available in 'Approve' or 'Reject' swimlane it receives the response in the form
             * of success array and failure array enclosed within document jsonObject... The success and failure array contains the id of the 
             * card being processed along with the count of the success and failure cards.
             * So., this function removes the cards available in 'Approve' or 'Reject' swimlane when it gets proccessed successfully.
             */
            function deleteCardOnSuccess(hdrRecordCardId) {
                angular.forEach($scope.kanbanBoard.columns, function(column) {
                    for (var i = 0; i < column.documents.length; i++) {
                        if (column.name === "Approve" && column.documents[i].id === hdrRecordCardId) {
                            column.documents.splice(i, 1);
                            break;
                        } else if (column.name === "Reject" && column.documents[i].id === hdrRecordCardId) {
                            column.documents.splice(i, 1);
                            break;
                        }
                    }
                })
            }

            /*
             * After the Approving Manager process the cards available in 'Approve' or 'Reject' swimlane it receives the response in the form
             * of success array and failure array enclosed within document jsonObject... The success and failure array contains the id of the 
             * document being processed along with the count of the success and failure cards.
             * So., this function removes the cards available in 'Approve' or 'Reject' swimlane when it gets proccessed got failed and 
             * adds to 'Pending' column.
             */
            function deleteCardOnFailure(hdrRecordCardId) {
                angular.forEach($scope.kanbanBoard.columns, function(column) {
	
                    for (var i = 0; i < column.documents.length; i++) {
                        if (column.name === "Approve" && column.documents[i].id === hdrRecordCardId) {
                            hdrCard = column.documents[i];
                            addCardToPendingColumn(column.documents[i]);
                            column.documents.splice(i, 1);
                            break;
                        } else if (column.name === "Reject" && column.documents[i].id === hdrRecordCardId) {
                            hdrCard = column.documents[i];
                            addCardToPendingColumn(column.documents[i]);
                            column.documents.splice(i, 1);
                            break;
                        }
                    }
                })
            }
            
            
            /*
             * For getting the current timestamp in the form of milliseconds
             */
            function getTimestamp(){
            	var time = new Date().getTime();
                return time;
            }

            /*
             * This function is called within deleteCardOnFailure(docId) and it add the document / card to 'Pending' swimlane
             */
            function addCardToPendingColumn(cards) {
                angular.forEach($scope.kanbanBoard.columns, function(column) {
                    if (column.name === "Pending") {
                        column.documents.splice(1, 0, cards);
                    }
                })
            }

             /*
             * It fetches all the reject reason for the projects in the form of cards to which Approving Manager is assigned too.
             */           
            function addRejectReasonToArray(kanbanBoard) {
            	angular.forEach(kanbanBoard.columns, function(column) {
            		angular.forEach(column.projectsforRejectReason, function(project) {
            			BoardService.rejectReason(kanbanBoard,project.Id);
            			var rejectReasonList = BoardDataFactory.fetchRejectReasonForProject(project.Id).query(function() {
            				$scope.data = BoardService.rejectCards(kanbanBoard,project.Id,rejectReasonList);
            			})
            		})
            	})
            }

            /*
             * It fetches all the document lineItems whenever an Employee / Approving Manager clicks on the header of the card available in
             * the swimlane for viewing the details of it.
             */
            $scope.lineItems = function(documentId,docType) {
                 $scope.showTbody=false;
            	var docLines = BoardDataFactory.fetchDocumentLineItems(documentId, docType).query(function() {
                    $scope.showTbody=true;
            		$rootScope.approvalLineItems.complete();
        			$scope.lineItem=docLines.documentLines;
            	})
            }

            /*
             * Once the card is being dragged form 'Pending' or 'Approve' swimlane to 'Reject' swimlane by an Approving Manager. As soon as
             * it drop the card in the 'Reject' swimlane a modal window pops-up and it asks for the reject reason why the document is being 
             * rejected. This function adds a parameter in the document jsonobject for processing. 
             */
            function updatingCard(rejectId,card) {
                card.rejectReason = rejectId;                           
            }

            /*
             * It gives the total count of available timesheet or an expense documents available in their respective swimlanes 
             */
            $scope.totalcount = function(column) {
                var docCount = {
                    timeSheet: 0,
                    expense: 0
                };

                angular.forEach(column.documents, function(card) {
                    if (card.type == "timesheet") {
                        docCount.timeSheet++;
                    } else if (card.type == "expense") {
                        docCount.expense++;
                    }
                });
                $scope.countCheck=docCount;
                return docCount;
            };

            /*
             *  This function creates the request from the cards available in 'Reject' or 'Approve' swimlane in the form 
             *  which bridge server understands after the user clicks on the process button.
             */
            $scope.process = function(kanbanBoard) {
                
                $rootScope.materialPreloader = true;
                var data = {};
                var finalRequest = {};
                angular.forEach(kanbanBoard.columns, function(column) {
                    if (column.name === "Approve") {
                        data.approve = array(column);
                    } else if (column.name === "Reject") {

                        data.reject = array(column);
                    }
                });
                finalRequest.documents = data;
               
                
                /*
                 * This function processes the request created after the process button is clicked and returns the response from the 
                 * bridge server 
                 */
                var respAfterProcessing = BoardDataFactory.approvalDocs().save(finalRequest, function() {
                	$rootScope.materialPreloader = false;
                    $rootScope.approval.complete();
                	processNotification(respAfterProcessing);
                });
            }
            
            $scope.reverse=false;

            $scope.sortBy = function(propertyName,reverseTog,kanbanBoard) {
            	angular.forEach(kanbanBoard.columns, function(column) {
            		angular.forEach(column.documents, function(card) {
            			reverseTog=$scope.reverse;                                
            			column.documents = orderBy(column.documents, propertyName, reverseTog);
            		});
            	});
            	$scope.reverse=!$scope.reverse;
            }

            /*
             * This function is used for parsing the response recieved after processing the document and creating the notification objects
             * which needs to be displayed in the notification tray icon for an user.
             */          
            function processNotification(serverResponse) {
                
                var messages = {
                timestamp: getTimestamp()
                };

                angular.forEach(serverResponse.documents.success, function(success) {
                    deleteCardOnSuccess(success.id);
                });

                angular.forEach(serverResponse.documents.failure, function(failure) {
                    deleteCardOnFailure(failure.id);
                });
                
                if(serverResponse.documents.failureMessage !== null && serverResponse.documents.successMessage === null) {
                    messages.type = "approvalDocument";
                    messages.failure = serverResponse.documents.failureMessage;
                    messages.success = null;
                    BoardService.createNotifications($scope.kanbanBoard, messages);
                }
                else if(serverResponse.documents.successMessage !== null && serverResponse.documents.failureMessage === null) {
                    messages.type = "approvalDocument";
                    messages.success = serverResponse.documents.successMessage;
                    messages.failure = null;
                    BoardService.createNotifications($scope.kanbanBoard, messages);
                }
                else if(serverResponse.documents.failureMessage !== null && serverResponse.documents.successMessage !== null) {
                    messages.type = "approvalDocument";
                    messages.success = serverResponse.documents.successMessage;
                    messages.failure = serverResponse.documents.failureMessage;
                    BoardService.createNotifications($scope.kanbanBoard, messages);
                }
                $rootScope.$storage.x=$scope.kanbanBoard;
            }


            
		    },function(errResponse){
                if(errResponse.status == 403)
                {
                    $rootScope.accessDeny=true;
                    $rootScope.approval.complete();
                }
                
                
            });


        } 
        ])

    .controller('IsolatedStepCtrl', [
        '$scope',
        'multiStepFormInstance',
        function ($scope, multiStepFormInstance) {

        }
    ]);