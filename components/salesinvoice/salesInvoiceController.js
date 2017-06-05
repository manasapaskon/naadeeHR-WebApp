/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */
'use strict'; 

angular
    .module('demoApp') 

    .controller(
        'salesInvoiceController', ['$http',
            '$scope','$element','$timeout','$rootScope','$location','$mdDialog',
            '$filter','$interval','$state',
            'BoardService',
            'BoardDataFactory', 'notifications','$cookieStore','ngProgressFactory','orderByFilter','$localStorage', '$sessionStorage',
            function($http, $scope, $element, $timeout, $rootScope,$location,$mdDialog, $filter, $interval, $state, BoardService, BoardDataFactory, notifications,
            		$cookieStore,ngProgressFactory,orderBy,$localStorage, $sessionStorage) {

         
        $scope.getMoment = function(val){
               return moment(val).format("ddd, MMMM DD, YYYY");
        }

        $scope.lastThDays = moment().subtract(90, 'days').format('YYYY-MM-DD');
        $scope.today = moment().format('YYYY-MM-DD');

        $scope.changedStartDate = moment($scope.lastThDays).format('MMM DD, YYYY');
        $scope.changedEndDate = moment($scope.today).format('MMM DD, YYYY');

        console.log('changedStartDate : '+$scope.changedStartDate);
        console.log('changedEndDate : '+$scope.changedEndDate);


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
       

        $scope.changeDateFormat = function(dateVal){
            var dateFortmatted = moment(dateVal, "YYYY-MM-DD").format("MMM DD, YYYY");
            return dateFortmatted;
        }

        $scope.convertToHHMM = function (decVal){
              return $scope.result = moment.duration(parseFloat(decVal) ,'hours').format("HH:mm", {trim: false});
        }

        $scope.resChipFiltered = [];
        //Watch for date changes
        $scope.$watch('daterange.range', function(newDateRange,oldDateRange) {
            if(newDateRange !== oldDateRange){
                $scope.changedStartDate = moment(newDateRange.startDate).format('MMM DD, YYYY');
                $scope.changedEndDate = moment(newDateRange.endDate).format('MMM DD, YYYY');

                if($scope.resChipFiltered){
                    $scope.getSalesInvoiceSummary($scope.changedStartDate, $scope.changedEndDate);
                }
               
                if($scope.resChipFiltered.length == 0){
                    $scope.getSalesInvoiceSummaryTile(newDateRange.startDate, $scope.changedEndDate);   
                }
            }
        }, true);

      $scope.steps = [
            {
                templateUrl: 'salesInvoiceSummaryTile',
                hasForm: true,
                IsolatedStepCtrl: true,
                title: 'Read the docs'
            },
            {
                templateUrl: 'salesInvoiceSummary',
                hasForm: true,
                IsolatedStepCtrl: true,
                title: 'Read the docs'
            },
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
      

            //Sales invoice lines Array (sorted by lineNumber)
            $scope.getSalesInvoiceLines = function(obj){               
                    $scope.invoiceLinesArr = obj.invoiceLines;
                    $scope.invoiceLines = {};
                    for (var i = 0; i < $scope.invoiceLinesArr.length; i++) {
                        var item = $scope.invoiceLinesArr[i];
                        $scope.invoiceLines[ item.lineNumber ] = item;
                    }
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


            //getting sales invoice summary Tile response data            
            $scope.getSalesInvoiceSummaryTile = function(sDate,eDate) {
                var varUserId = $cookieStore.get('globals').currentUser.userId; 
                $scope.chStrDate = moment(sDate).format('YYYY-MM-DD');
                $scope.chEndDate = moment(eDate).format('YYYY-MM-DD');
                var salesInvoiceSummaryTile = BoardDataFactory.getSalesInvoiceSummaryTile(varUserId,'Customer_Approving_Manager',$scope.chStrDate,$scope.chEndDate).query(function() {
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


        } 
        ])

    .controller('IsolatedStepCtrl', [
        '$scope',
        'multiStepFormScope',
        function ($scope, multiStepFormScope) {
            // $scope.model = angular.copy(multiStepFormScope.model);
            // alert($scope.model);
            // $scope.$on('$destroy', function () {
            //     multiStepFormScope.model = angular.copy($scope.model);
            // });
        }
    ]);