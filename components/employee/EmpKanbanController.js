/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */
'use strict';

angular
    .module('demoApp')  
    .config(function($mdDateLocaleProvider) {
      $mdDateLocaleProvider.formatDate = function(date) {
        return moment(date).format('ddd, DD MMM, YYYY');
      };
    })
    .controller(
        'EmpKanbanController', ['$http',
            '$scope', '$rootScope', '$mdDialog',
            '$filter', '$interval',
            'EmpBoardService',
            'BoardDataFactory', 'notifications', '$cookieStore', 'orderByFilter', 'ngProgressFactory', '$state', 
            '$localStorage', '$sessionStorage', '$log','randomString','progressBarManager',
            function($http, $scope, $rootScope, $mdDialog, $filter, $interval, EmpBoardService, BoardDataFactory,
                notifications, $cookieStore, orderBy, ngProgressFactory, $state, $localStorage, $sessionStorage, $log, randomString,progressBarManager) {
                


                $rootScope.materialPreloader = false;
                $rootScope.materialPreloadera = false;
                $rootScope.accessDeny=false;
                $scope.hidePage = false;

                //uploader progress
                var main = this;
                main.isBar = true;
                main.bar2ProgressVal = 0;
                main.bar2 = progressBarManager();

                $scope.lineItemShow0=true;
                $scope.switchLineShow = function(pos){                 
                  $scope.lineItemShow0=true;
                }


                $scope.randomGen = function () {
                    $scope.lineItem = [];
                    $scope.editedExpValue = [];
                    $scope.editedTimeValue = [];
                    $scope.upEditedExpValue = [];
                    console.log($scope.expensedDate);
                    $scope.editedNote = [];
                    $scope.isoUpdate = [];
                    $scope.updatedConvAmount = [];
                    $scope.randomNum = randomString();
                    $scope.showEntry = false;
                    $scope.fileAttach = [];  
                    $scope.fileIdObj = [];
                    $scope.myFile;    
                    $scope.upmyFile=[];
                    $scope.poss=0;     
                    main.bar2ProgressVal = 0;
                    $scope.fileSizeAlert=false;  
                    $scope.watchAttach = true; 

                }

                // $(function () {
                //     $('#datepicker').datepicker({
                //         dateFormat: 'yy-mm-dd',
                //         showButtonPanel: true,
                //         changeMonth: true,
                //         changeYear: true,
                // yearRange: '1999:2012',
                //         showOn: "button",
                //         buttonImage: "images/calendar.gif",
                //         buttonImageOnly: true,
                //         minDate: new Date(1999, 10 - 1, 25),
                //         maxDate: '+30Y',
                //         inline: true
                //     });
                // });

                $scope.passIndex = function(val){
                    $scope.tempIndex=val;
                }
                
                //close modal
                $scope.closeModal = function(val,position) {
                    $('#'+val+position).modal('hide'); 
                }

                $scope.closeUploadModal = function(position) {
                    $('#uploader'+position).modal('hide'); 
                }
                
                //multiple filter
                $scope.selectedUsers = [];
    
                // this method is for filtering places based on searchText
                $scope.querySearch = function(query) {
                    var results = [];
                    var places = [];
                    query = query.toLowerCase();
                    angular.forEach(empBoard.columns, function(column) {
                        angular.forEach(column.documents, function(card, key) {
                                if(places.indexOf(card.title.toLowerCase()) == -1 && card.title.toLowerCase().indexOf(query) > -1) {
                                    results.push(card); 
                                    places.push(card.title.toLowerCase())
                                }                            
                        });
                    });
                    return results;
                };

                // Display places as tags
                $scope.transformChip = function(chip) {
                      return chip.title;
                };

                var self = this;
                //multistep
                $scope.steps = [
                    {
                        template: '<div class="well">More docs available on Github</div>',
                        title: 'Read the docs'
                    },
                    {
                        templateUrl: 'lineEntryId',
                        controller:'EmpKanbanController',
                        title: 'Get the source'
                    }
                ];

                $scope.mondayFinder = [];
                function mondayFind(){
                  console.log("hhhh");
                  angular.forEach($scope.rangeDate, function(value, key){  
                      $scope.mondayFinder[key] = moment(value).format('ddd');
                  });
                }

                //CopyAll
                $scope.copyTextValue = function(indexVal)
                {
                    var iVal = indexVal;
                    var counterVal = parseInt($scope.rangeDate.length) - parseInt(iVal);
                    console.log(counterVal);
                    var keepGoing = true;
                        for (var i = iVal; i < $scope.rangeDate.length; i++) {
                          if(moment($scope.rangeDate[i]).format('ddd') == 'Sat' || moment($scope.rangeDate[i]).format('ddd') == 'Sun')
                          {
                              console.log(moment($scope.rangeDate).format('ddd'));
                              $scope.entryValue[i] = '00:00';
                          }else
                          {
                              // $scope.entryValue[key] = $scope.entryValue[0];
                                 var sVal2;
                                 var valAsString2 = $scope.entryValue[iVal].toString(); 
                                 if (valAsString2.length === 1) {                              
                                    sVal2 = "0"+$scope.entryValue[iVal] +":00";
                                }else if (valAsString2.length === 2) {                           
                                    sVal2 = $scope.entryValue[iVal] +":00";
                                }else {
                                    sVal2 = $scope.entryValue[iVal];
                                }
                                $scope.entryValue[i] = sVal2;
                          }
                        }
                    // angular.forEach(counterVal, function(value, key){  
                    // });      
                }

                //Summation of time entries
                $scope.totalTime = 0;
                $scope.sumTime = function(val) {                
                    var sVal;
                    var sec = 0;
                    for (var i = 0; i < val.length; i++) {
                        
                        //-------------------------------
                          if(val[i] == 'undefined' || val[i] == null)
                          val[i]="00:00"
                          console.log(val[i]);
                         var valAsString = val[i].toString();                    
                         
                         if(parseInt(valAsString) >= 24){
                                                      
                             $scope.entryValue[i] = "00:00";
                             sVal = "00:00";
                             sec += toSeconds(sVal);
                         }else{
                             if (valAsString.length === 1) {                              
                                  sVal = "0"+val[i] +":00";                         
                                  sec += toSeconds(sVal);
                              }else if (valAsString.length === 2) {                           
                                  sVal = val[i] +":00";                             
                                  sec += toSeconds(sVal);
                              }else{
                                  sec += toSeconds(val[i]);
                              }
                         }                  
                        
                        //---------------------------------                     
                    }
                    var result = fill(Math.floor(sec / 3600), 2) + ':' + fill(Math.floor(sec / 60) % 60, 2);
                    $scope.totalTime = result;
                  }

                  //Summation of edited time entries
                    $scope.editedTotalTime = 0;
                    $scope.editedSumTime = function(val, valLength) {  
                    
                    console.log(valLength);              
                        var sVal;
                        var sec = 0;
                        for (var i = 0; i < valLength; i++) {
                            
                            //-------------------------------
                            if ( val[i] != null ){
                              var valAsString = val[i].toString();
                            }
                                                 
                             
                             if(parseInt(valAsString) >= 24){
                                                          
                                 $scope.editedTimeValue[i] = "00:00";
                                 sVal = "00:00";
                                 sec += toSeconds(sVal);
                             }else{
                                 if (valAsString.length === 1) {                              
                                      sVal = "0"+val[i] +":00";                         
                                      sec += toSeconds(sVal);
                                  }else if (valAsString.length === 2) {                           
                                      sVal = val[i] +":00";                             
                                      sec += toSeconds(sVal);
                                  }else{
                                    if(val[i]){
                                      sec += toSeconds(val[i]);
                                    }
                                  }
                             }                  
                            
                            //---------------------------------                     
                            
                        }
                        var result = fill(Math.floor(sec / 3600), 2) + ':' + fill(Math.floor(sec / 60) % 60, 2);
                        console.log(result);
                        $scope.editedTotalTime = result;

                    }

                function toSeconds(s) {
                  // if ( s != '00:00'){                   
                    var p = s.split(':');
                  // }
                    
                    return parseInt(p[0], 10) * 3600 + parseInt(p[1], 10) * 60;
                }

                function fill(s, digits) {
                    s = s.toString();
                    while (s.length < digits) s = '0' + s;
                    return s;
                }

                $rootScope.$storage = $localStorage;
                $rootScope.delete = function() {
                    delete $rootScope.$storage.x;
                };

                var userId = $cookieStore.get('globals').currentUser.userId;
                var empId = $cookieStore.get('globals').currentUser.empId;

                $scope.convDate = function(val) {
                    var newdate = moment(val).format('YYYY-MM-DD');

                    return newdate;
                }

                $scope.open = function(ev) {
                    $mdDialog.show({
                        templateUrl: 'dialog-template.html',
                        scope: $scope,
                        preserveScope: true,
                        targetEvent: ev
                    });
                };
                
                this.settings = {
                  printLayout: true,
                  showRuler: true,
                  showSpellingSuggestions: true,
                  presentationMode: 'edit'
                };

                this.sampleAction = function(name, ev) {
                  $mdDialog.show($mdDialog.alert()
                    .title(name)
                    .textContent('You triggered the "' + name + '" action')
                    .ok('Great')
                    .targetEvent(ev)
                  );
                };

                $scope.close = function() {
                    $mdDialog.hide();
                };
                $scope.cancelSave = function() {

                    $mdDialog.cancel($scope.entryValue = [], $scope.entryExpValue = [],$scope.activityId = '', $scope.repCycId = '', 
                    $scope.projId = '',$scope.fileAttach = [],$scope.totalTime='00:00',$scope.myFile=[],$scope.fName =[],$scope.fNameClass = [],
                    $scope.editedTimeValue = [],$scope.editedExpValue = [], $scope.upEditedExpValue = [], $scope.isoUpdated = [], $scope.editedNote = [], $scope.lineItem=[], $scope.myFile='', $scope.fNameTest=''
                    ,$scope.amount = [], $scope.expensedDate = []);

                };
                $scope.answer = function(answer) {
                    $mdDialog.hide(answer);
                };

                $scope.entryValue = [];
                $scope.social = [];
                $scope.note = [];
                $scope.entryExpValue = [];
                var documents = [];
                var finalRequest = {};


                function timeFormat(timeVal){
               //   alert('sccuss : '+timeVal);
                    var valAsString = timeVal.toString();
                    var formattedTimeVal;
                    
                    if (valAsString.length === 1) {                           
                         formattedTimeVal = "0" + timeVal +":00";                            
                      }else if (valAsString.length === 2) {                           
                         formattedTimeVal= timeVal +":00";                            
                      }else{
                         formattedTimeVal = timeVal;                                
                      }  
                    
                    return formattedTimeVal;
                }



                //update timesheet documentlines
                $scope.updateTimesheet = function (val,docId,docType,position,status) {
                    console.log(val);
                    $scope.editedResult = val.map(function(e, i) {
                        return {
                             date:e.dateWorked,
                             docId: e.id,
                             value: timeFormat($scope.editedTimeValue[i]),
                             note: $scope.editedNote[i],
                             status: status,
                             billable: "Yes",
                         };
                    });
                    finalRequest.documentLines = $scope.editedResult;
                    console.log(finalRequest.documentLines);
                   
                    var docLinesResponse = BoardDataFactory.updateDocumentLines(docId,docType).update(finalRequest, function(response) {
                        $('#lineItems'+position).modal('hide');
                        $state.reload();
                        
                    }, function(errResponse) {
                        $rootScope.error = errResponse.status;
                    });

                }
                //update expense documentlines
                    $scope.updateExpense = function (val,docId,docType,position,status) {
                      console.log(val);
                    $scope.editedResult = val.map(function(e, i) {
                      // console.log($scope.isoUpdate[i].isoCode);
                      if(e.id != null){
                        for(var j=0; j<$scope.fileAttach.length;j++) {
                            if($scope.fileAttach[j].position === i) {  
                            return {
                             date: e.dateExpensed,
                             docId: e.id,
                             currencyId: $scope.isoUpdate[i].id,
                             currency: $scope.isoUpdate[i].isoCode,
                             value: $scope.editedExpValue[i],
                             convAmount : $scope.updatedConvAmount[i],
                             /*fileId: $scope.fileAttach[j].id,*/
                             fileIds:$scope.fileIdObj,
                             note: $scope.editedNote[i],
                             status: status,
                             billable: "Yes"
                                };
                            }
                        }
                        
                        return {
                             date: e.dateExpensed,
                             docId: e.id,
                             currencyId: $scope.isoUpdate[i].id,
                             currency: $scope.isoUpdate[i].isoCode,
                             value: $scope.editedExpValue[i],
                             convAmount : $scope.updatedConvAmount[i],
                             fileIds: null,
                             note: $scope.editedNote[i],
                             status: status,
                             billable: "Yes"
                        };
                      }else{
                        for(var j=0; j<$scope.fileAttach.length;j++) {
                            if($scope.fileAttach[j].position === i) {  
                            return {
                             date: e.dateExpensed,
                             docId: null,
                             currencyId: $scope.isoUpdate[i].id,
                             currency: $scope.isoUpdate[i].isoCode,
                             value: $scope.editedExpValue[i],
                             convAmount : $scope.updatedConvAmount[i],
                             /*fileId: $scope.fileAttach[j].id,*/
                             fileIds:$scope.fileIdObj,
                             note: $scope.editedNote[i],
                             status: status,
                             billable: "Yes"
                                };
                            }
                        }
                        
                        return {
                             date: e.dateExpensed,
                             docId: null,
                             currencyId: $scope.isoUpdate[i].id,
                             currency: $scope.isoUpdate[i].isoCode,
                             value: $scope.editedExpValue[i],
                             convAmount : $scope.updatedConvAmount[i],
                             fileIds: $scope.fileIdObj,
                             note: $scope.editedNote[i],
                             status: status,
                             billable: "Yes"
                        };
                      }
                    });

                    finalRequest.documentLines = $scope.editedResult;
                    console.log($scope.fileIdObj);
                    var docLinesResponse = BoardDataFactory.updateDocumentLines(docId,docType).update(finalRequest, function(response) {
                      console.log(response);
                      $('#lineItems'+position).modal('hide');
                        $state.reload();
                    }, function(errResponse) {
                        $rootScope.error = errResponse.status;
                       
                    });
                }
                
                /*
                 *  For Deleting Attachment from NOAH-TEX Bridge Server
                 */

                $scope.deleteAttachmentFromBrgServer = function(fileAttachmentId,pos,innerPos) {
                    BoardDataFactory.uploadAttachments().delete({id:fileAttachmentId},function(response) {
                      console.log(response);
                        $scope.fName[pos]=null;
                        $scope.myFile[pos]=null;
                        $scope.lineItem[pos].fileArray[innerPos] = null;
                        $scope.lineItem[pos].fileArray.splice(innerPos, 1);
                        $scope.lineItem[pos].fileAttachArray.splice(innerPos, 1);
                        $scope.lineItem[pos].fileIds.splice(innerPos, 1);
                        // for (var i = 0; i < $scope.lineItem[pos].fileArray.length; i++) {
                        //     if ($scope.lineItem[pos].fileArray[i].position === innerPos) {
                        //         $scope.lineItem[pos].fileArray.splice(i, 1);
                        //         break;
                        //     }
                        // }
                        
                        // for (var i = 0; i < $scope.fileAttach.length; i++) {
                        //     if ($scope.fileAttach[i].position === pos) {
                        //         $scope.fileAttach.splice(i, 1);
                        //         break;
                        //     }
                        // }
                        $scope.deleteSuccessMsg = response.fileName+" Deleted Successfully";
                    }, function(errResponse){
                        $scope.error = errResponse.status;
                    })
                }
                
               /*
                *  For Deleting Attachment from Openbravo Server
                */
               $scope.deleteAttachmentFromOBServer = function(fileAttachmentId, pos, innerPos) {
                console.log(fileAttachmentId, pos, innerPos);
                BoardDataFactory.deleteAttachmentFromOB(fileAttachmentId).delete(function(response) {
                        $scope.fName[pos]=null;
                        $scope.upmyFile[pos]=null;
                        $scope.lineItem[pos].attachmentArray.splice(innerPos, 1);

                        console.log($scope.lineItem);
                    $scope.deleteSuccessMsg = response.fileName+" Deleted Successfully";
                }, function(errResponse){
                    $scope.error = errResponse.status;
                })
               }

                $scope.cardCheck = function(project, activityId, repCycId, status){
                  console.log("project, activityId, repCycId, status");
                    var reCycVal = JSON.parse(repCycId);
                    var proj = JSON.parse(project);
                    $scope.CardExist($scope.allEmpBoard.columns[0], proj.projectId, activityId, reCycVal.startDate.slice(0, 19),
                    reCycVal.endDate.slice(0, 19), $scope.entryType);
                    
                } 

                $scope.entrytimObjFunc = function(project, activityId, repCycId, status) {

                    console.log(project);
                    $scope.result = $scope.rangeDate.map(function(e, i) {
                        return {
                             date: moment(e).format('YYYY-MM-DD'),
                             value: timeFormat($scope.entryValue[i]),
                             note: $scope.note[i],
                             status: status,
                             fileName: null,
                             billable: "Yes",
                             docId: null
                         };
                    });



                    var reCycVal = JSON.parse(repCycId);
                    var proj = JSON.parse(project);
                    console.log(proj);
                    var entryObj = {};
                    entryObj.randomNumber = $scope.randomNum;
                    entryObj.orgId = proj.orgId;
                    entryObj.projectId = proj.projectId;
                    entryObj.empId = empId;
                    entryObj.userId = userId;
                    entryObj.codeId = activityId;
                    entryObj.startDate = reCycVal.startDate.slice(0, 19);
                    entryObj.endDate = reCycVal.endDate.slice(0, 19);
                    entryObj.billable = 'Yes';
                    entryObj.docLine = $scope.result;
                    entryObj.type = $scope.entryType;
                    entryObj.value = 0;
                    entryObj.status = status;
                    documents.push(entryObj);
                    finalRequest.documents = documents;
                    $scope.processCard(finalRequest, $scope.entryType);

                }




                // $scope.lineItem = [];
                $scope.fNameTest='';

                $scope.getSelectedCurrency = function(val){
                  if(val=="USD"){
                     return true;
                  }
                }

                $scope.currencyConversion = function(){
                  var currencyConversionList = BoardDataFactory.fetchCurrencyExRate().query(function() {
                      $scope.currencyConvList = currencyConversionList.response.currencies;
                  });
                }


                $scope.lineItem = [];
                $scope.addRow = function(cardType){  

                $scope.disablePreview = true;
                console.log($scope.files); 
                  // currency conversion
                    angular.forEach($scope.currencyConvList,function(value,key){
                      if(value.isoCode == $scope.currency){

                          angular.forEach(value.rates,function(value,key){
                              $scope.convAmount = parseFloat($scope.amount) * parseFloat(value.multipleRateBy);  
                          });
                          $scope.symb = value.symbol;
                          $scope.symbPos = value.isCurrencySymbolAtTheRight;
                          $scope.cId = value.id;
                      }
                      console.log($scope.convAmount);
                    });
                   
                   if(cardType=='create'){
                      $scope.lineItem.push({ 'date':moment($scope.expensedDate).format('YYYY-MM-DD'),'currency':$scope.currency, 'convAmount':$scope.convAmount, 'symbol':$scope.symb, 'symbolPosition':$scope.symbPos, 'value': $scope.amount, 'currencyId':$scope.cId, 'note':$scope.expenseNote, 'fileIds':$scope.fileIdObj,'fileArray':$scope.fileAttach, 'fileAttachArray':$scope.files, 'billable':"yes", 'docId':null});
                      // $scope.lineItem.push({ 'date':moment($scope.expensedDate).format('YYYY-MM-DD'),'currency':$scope.currency, 'convAmount':$scope.convAmount, 'symbol':$scope.symb, 'symbolPosition':$scope.symbPos, 'value': $scope.amount, 'currencyId':$scope.cId, 'note':$scope.expenseNote, 'fileId':$scope.fIdTest, 'billable':"yes", 'docId':null, 'fileType': $scope.myFile.type, 'fileName': $scope.myFile.name, 'fileContent': $scope.fContent});
                   }else if($scope.upmyFiled != undefined){
                      $scope.lineItem.push({ 'dateExpensed':moment($scope.expensedDate).format('YYYY-MM-DD'),'currencyIsoCode':$scope.currency, 'amount':$scope.convAmount, 'symbol':$scope.symb, 'symbolPosition':$scope.symbPos, 'reportingAmount': $scope.amount, 'currencyId':$scope.cId, 'note':$scope.expenseNote, 'fileIds':$scope.fileIdObj, 'fileContent':$scope.fContent, 'fileName':$scope.fNameTest, 'billable':"yes", 'docId':null, 'fileType': $scope.upmyFiled.type, 'fileArray': $scope.fileAttach, 'fileAttachArray': $scope.upmyFiled });
                   }else{
                      $scope.lineItem.push({ 'dateExpensed':moment($scope.expensedDate).format('YYYY-MM-DD'),'currencyIsoCode':$scope.currency, 'amount':$scope.convAmount, 'symbol':$scope.symb, 'symbolPosition':$scope.symbPos, 'reportingAmount': $scope.amount, 'currencyId':$scope.cId, 'note':$scope.expenseNote, 'fileIds':$scope.fileIdObj, 'fileContent':$scope.fContent, 'fileName':$scope.fNameTest,  'billable':"yes", 'docId':null,'fileArray': $scope.fileAttach, 'fileAttachArray': $scope.upmyFile });
                   }
                  
                  console.log($scope.newRowAttch);
                  // $scope.expensedDate='';
                  $scope.amount='';    
                  $scope.fileAttach =[]; 
                  $scope.files = [];
                  $scope.fileAttach=[];
                  $scope.addFiles = [];
                  $scope.addFile = []; 
                  $scope.attachment='';
                  $scope.expenseNote='';
                  $scope.upmyFiled= null;
                  // $scope.currency='';
                  $scope.convAmount='';
                  $scope.fNameTest='';
                  $scope.fIdTest='';
                  $scope.fContent='';
                  $scope.fNameClass=[];
                  $scope.poss+=1;
                  $scope.expSumb();
                  main.bar2ProgressVal = 0;
                  $scope.fileSizeAlert=false;
                  console.log($scope.fileAttach);
                  console.log($scope.lineItem);

                };


                $scope.entryExpObjFunc = function(project, activityId, repCycId, status) {

                  angular.forEach($scope.rangeDate, function(value, key) {
                      if($scope.entryExpValue[key]==undefined){
                         $scope.entryExpValue[key] = 0;
                      }
                  });
            

                    // $scope.result = $scope.rangeDate.map(function(e, i) {
                        
                    //     for(var j=0; j<$scope.fileAttach.length;j++) {
                    //         if($scope.fileAttach[j].position === i) {                               
                    //             return {
                    //                 date: moment(e).format('YYYY-MM-DD'),
                    //                 value: $scope.entryExpValue[i],
                    //                 note: $scope.note[i],
                    //                 fileId: $scope.fileAttach[j].id,
                    //                 status: status,
                    //                 billable: "Yes",
                    //                 docId: null
                    //             };
                    //         }
                    //     }
                    //     return {
                    //         date: moment(e).format('YYYY-MM-DD'),
                    //         value: $scope.entryExpValue[i],
                    //         note: $scope.note[i],
                    //         fileId: null,
                    //         status: status,
                    //         billable: "Yes",
                    //         docId: null
                    //     };
                    // });

                    var reCycVal = JSON.parse(repCycId);
                    var proj = JSON.parse(project);
                    var entryObj = {};
                    entryObj.randomNumber = $scope.randomNum;
                    entryObj.orgId = proj.orgId;
                    entryObj.projectId = proj.projectId;
                    entryObj.empId = empId;
                    entryObj.userId = userId;
                    entryObj.codeId = activityId;
                    entryObj.startDate = reCycVal.startDate.slice(0, 19);
                    entryObj.endDate = reCycVal.endDate.slice(0, 19);
                    entryObj.billable = 'Yes';
                    entryObj.docLine = $scope.lineItem;
                    entryObj.type = $scope.entryType;
                    entryObj.value = 0;
                    entryObj.status = status;
                    documents.push(entryObj);
                    finalRequest.documents = documents;
                    console.log(finalRequest.documents);
                    $scope.processCard(finalRequest, $scope.entryType);

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

                $scope.editEntry = function(ev, pos, card, linedocs) {
                    $mdDialog.show({
                        controller: DialogController,
                        templateUrl: 'lineItems',
                        scope: $scope,
                        preserveScope: true,
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        escapeToClose: true,
                        locals:{dataToPass: pos,carddataToPass: card,linedocsTopass: linedocs}, 
                        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.

                    })

                };


                // $scope.warning = function(){    
                //   if($scope.lineItem.length > 0){
                //       $('#warning').modal({
                //               backdrop: 'static',
                //               keyboard: true, 
                //               show: true
                //       });
                //   }              
                // }

            
                function DialogController($scope, $mdDialog, dataToPass,carddataToPass,linedocsTopass) {
                    $scope.lineindex = dataToPass;
                    $scope.card = carddataToPass;
                    $scope.lineDocitem = linedocsTopass;

                    $scope.addRowTest = function(){
                      console.log($scope.currency);
                    }
                    

                    // $scope.$watch('myFile', function () {
                    //           console.log($scope.myFile);
                    //             $("#fileupload").change(function(){
                    //               if($scope.myFile != null){
                    //                 if($scope.myFile.size > 500000){
                    //                   $scope.fileSizeAlert=true;
                    //                 }                              
                    //                 else{
                    //                   $scope.fileSizeAlert=false;
                    //                   console.log($scope.fileSizeAlert);
                    //                   $scope.readURL(this);
                    //                   $scope.uploadFileToUrl($scope.myFile, $scope.randomNum);
 
                    //                 }
                    //               } $scope.$apply();  
                    //             });                                 

                    // });


                }
               

                $scope.timeEntry = function(ev, entryType) {
                    $mdDialog.show({
                        templateUrl: 'timeEntry',
                        scope: $scope,
                        preserveScope: true,
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        escapeToClose: true,
                        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                    })
                    $scope.entryType = entryType;
                };

                $scope.expEntry = function(ev, entryType) {
                    $mdDialog.show({
                        templateUrl: 'expEntry',
                        scope: $scope,
                        preserveScope: true,
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        escapeToClose: true,
                        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                    })
                    $scope.entryType = entryType;
                };

                // Date Local
                var myDate = new Date();
                var locale = window.navigator.userLanguage || window.navigator.language;
                $scope.myDate = myDate.toLocaleDateString([locale]);

                $scope.reset = function() {
                    $scope.selectData = "";
                    $scope.form.$setPristine();
                };

                var userId = $cookieStore.get('globals').currentUser.userId;

                var resourceDoc = BoardDataFactory.resourceDocuments().query(function() {
                    console.log(resourceDoc);
                    $scope.hidePage = true;
                    $rootScope.employee.complete();
                    $scope.empBoard = EmpBoardService.kanbanBoard(resourceDoc);
                    $scope.allEmpBoard = EmpBoardService.allKanbanBoard(resourceDoc);
                    $scope.allCards = EmpBoardService.allDocuments(resourceDoc);
                    ProjectListForResource(resourceDoc);
                    console.log($scope.allCards);

                //sort
                $scope.reverse=false;

                $scope.sortBy = function(propertyName,reverseTog,empBoard) {
                    angular.forEach(empBoard.columns, function(column) {
                        angular.forEach(column.documents, function(card) {
                            reverseTog=$scope.reverse;                                
                            column.documents = orderBy(column.documents, propertyName, reverseTog);
                        });
                    });
                    $scope.reverse=!$scope.reverse;
                }

                //Reporting Cycle Sort
                var reportingCycles1 = $scope.empBoard.columns[0].reportingCycles;                     

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

                    $scope.myFilter3='';$scope.myFilter4='';$scope.myFilter5='';
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

                    $scope.proBtn = false;
                    $scope.kanbanSortOptions = {
                        itemMoved: function(event) {

                            if (event.dest.sortableScope.$parent.column.name === "Submit") {
                                if ($scope.countCheck.timeSheet + 1 != 0 || $scope.countCheck.expense + 1 != 0)
                                    $scope.proBtn = true;
                            }
                            if (event.dest.sortableScope.$parent.column.name === "Draft") {
                                if (($scope.countCheck.timeSheet == 0 && $scope.countCheck.expense == 1) || ($scope.countCheck.timeSheet == 1 && $scope.countCheck.expense == 0))
                                    $scope.proBtn = false;
                            }
                        },
                        orderChanged: function(event) {},
                        dragEnd: function(event) {},
                        containment: '#board'
                    };

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
                        // var selectedEmployee = $scope.myFilter5;
                        var selectedRepCycle = $scope.myFilter5;

                        var isFilterApplied = false;

                        angular.forEach(column.documents, function(card) {

                            var isFilteredCard = true;

                            if (isFilteredCard) {
                                if (selectedProject != null && selectedProject != "") {
                                    isFilterApplied = true;
                                    isFilteredCard = getHdrRecordCardArrayCount(card.projectName, selectedProject);
                                }
                            }

                            if (isFilteredCard) {
                                if (selectedActOrExp != null && selectedActOrExp != "") {
                                    isFilterApplied = true;
                                    isFilteredCard = getHdrRecordCardArrayCount(card.title, selectedActOrExp);
                                }
                            }

                           

                            if (isFilteredCard) {
                                if (selectedRepCycle != null && selectedRepCycle != "") {
                                    isFilterApplied = true;
                                    isFilteredCard = getHdrRecordCardArrayCount(card.reportCycle, selectedRepCycle);
                                }
                            }

                            if (!isFilterApplied) {
                                if ((card.type == "timesheet" && card.status == "Saved") || (card.type == "timesheet" && card.status == "Rejected")) {
                                    docCount.timeSheet++;
                                } else if ((card.type == "expense" && card.status == "Saved") || (card.type == "expense" && card.status == "Rejected")) {
                                    docCount.expense++;
                                }
                            } else if (isFilteredCard) {
                                if ((card.type == "timesheet" && card.status == "Saved") || (card.type == "timesheet" && card.status == "Rejected")) {
                                    docCount.timeSheet++;
                                } else if ((card.type == "expense" && card.status == "Saved") || (card.type == "expense" && card.status == "Rejected")) {
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
                     
                     
                    /*
                     * It fetches all the document lineItems whenever an Employee / Approving Manager clicks on the header 
                     * of the card available in the swimlane for viewing the details of it.
                     */

                    $scope.lineItems = function(documentId, docType, card) {
                         $scope.lineItem = [];  
                         $scope.myFile=[];
                         $scope.upmyFiled = null;
                         // $scope.randomNum = randomString();
                         $scope.showTbody=false;
                         
                         var docLines = BoardDataFactory.fetchDocumentLineItems(documentId, docType).query(function() {
                             console.log(card);
                             $scope.showTbody=true;
                             // $scope.unfilledLineItems.push({'dateWorked':'2017-04-16', 'hoursWorked':'00:00', 'note':'null'});  
                             $scope.allDates=[]; 
                             var loopLength = moment(card.endDate).diff(moment(card.startDate), 'days') + 1;
                             for (var i = 0; i < loopLength; i++) {
                                $scope.allDates.push({
                                  'dateWorked':moment(card.startDate).add(i, 'days').format("YYYY-MM-DD"), 
                                  'activity':"",
                                  'activityCode':"",
                                  'activityName':"",
                                  'employeeProject':"",
                                  'employeeProjectName':"",
                                  'hoursWorked':"00:00",
                                  'id':null,
                                  'note':null});
                                }
                             $rootScope.approvalLineItems.complete();

                             if(docType === 'timesheet'){   
                                 
                                 $scope.lineItemArray = docLines.documentLines.sort(sortByProperty('dateWorked'));
                                 console.log(docLines.documentLines);
                                 $scope.tempLineItem = $scope.lineItemArray;

                                  for(var i = 0; i < $scope.allDates.length; i++){
                                      for(var j = 0; j < $scope.tempLineItem.length; j++){
                                          if($scope.allDates[i].dateWorked == $scope.tempLineItem[j].dateWorked){
                                              
                                              $scope.allDates[i].dateWorked = $scope.tempLineItem[j].dateWorked;
                                              $scope.allDates[i].hoursWorked = $scope.tempLineItem[j].hoursWorked;
                                              $scope.allDates[i].note = $scope.tempLineItem[j].note;
                                              $scope.allDates[i].id = $scope.tempLineItem[j].id;
                                              break;
                                          }
                                      }
                                  }
                                  $scope.lineItem = $scope.allDates;
                                  console.log($scope.lineItem) 
                             }
                             else{
                                 $scope.lineItem = docLines.documentLines.sort(sortByProperty('dateExpensed'));
                                 console.log($scope.lineItem);
                             }

                         })
                     }
                     
                     /*
                      * Sorting documents based on any property which the user want's to do it.
                      */
                     var sortByProperty = function (property) {
                         return function (x, y) {
                             return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
                         };
                     };

                    // $scope.lineItems = function(documentId, docType) {
                    //     $scope.showTbody=false;
                    //     var docLines = BoardDataFactory.fetchDocumentLineItems(documentId, docType).query(function() {
                    //         $scope.showTbody=true;
                    //         $rootScope.approvalLineItems.complete();
                    //         $scope.lineItem = docLines;
                    //         console.log($scope.lineItem);
                    //     })
                    // }
                    
                   // $scope.myFile=[];
                   $scope.fName =[];
                   $scope.fId =[];
                   $scope.fNameClass = [];




                    $scope.readURL = function (input) {
                      console.log(input);
                        if (input.files && input.files[0]) {
                            var reader = new FileReader();
                            
                            reader.onload = function (e) {
                              // if(input.files[0].type=='application/pdf'){
                              //   $scope.setInp=false;
                              // }
                                $('#imgId').attr('src', e.target.result);
                                $('#linkId').attr('href', e.target.result);

                            }
                            
                            reader.readAsDataURL(input.files[0]);
                        }
                    }
                    
                    $scope.updatedConvAmount = [];

                    $scope.getUSD = function(modelVal, cur, indexVal, vallength){
                      console.log(modelVal, cur, indexVal, vallength);
                      angular.forEach($scope.currencyConvList,function(value,key){
                        if(value.isoCode == cur.isoCode){
                            angular.forEach(value.rates,function(value,key){
                                $scope.updatedConvAmount[indexVal] = parseFloat(modelVal) * parseFloat(value.multipleRateBy);
                            });
                        }
                      });
                      console.log($scope.updatedConvAmount);

                      $scope.editedTotalExp = 0;
                       for (var i = 0; i < vallength; i++) {
                        console.log($scope.updatedConvAmount[i]);
                        $scope.editedTotalExp += parseFloat($scope.updatedConvAmount[i]);
                       }


                    }


                    // $scope.uploadFileToUrl = function (file,randomNumber) {
                    //     console.log(file);
                    //     var fd = new FormData();
                    //     fd.append('file', file);
                    //     fd.append('randomNumber', randomNumber);
                    //     fd.append('position', $scope.poss);

                    //     if(file != false ){
                             
 
                    //         $('#uploader').modal({
                    //                 backdrop: 'static',
                    //                 keyboard: true, 
                    //                 show: true
                    //         });
                    //         main.bar2ProgressVal = 0;
                    //         main.bar2.start();
                            
                            
                    //     }


                    //     BoardDataFactory.uploadAttachments().save(fd,function(response) {                         
                    //         main.bar2.done()
                    //         console.log(response); 
                    //         // $('#uploader').modal('hide');
                    //         main.bar2ProgressVal = 100;
                    //         var attachObj = {};
                    //         attachObj.position = response.position;
                    //         attachObj.fileName = response.fileName;
                    //         attachObj.id = response.id;                            
                    //         $scope.fileAttach.push(attachObj);
                    //         console.log($scope.fileAttach);
                    //         $scope.fNameTest = response.fileName;
                    //         $scope.fIdTest = response.id;
                    //         $scope.fContent = response.fileContent;
                    //         $scope.fName[response.position] = response.fileName;
                    //         $scope.fId[response.position] = response.id;
                            


                    //     });
                    // }

                     $scope.uploadFileToUrl = function (file,randomNumber) {
                     
                        $scope.watchAttach = true;
                        $scope.tempScope = $scope.entryFormB.$invalid;
                        console.log($scope.entryFormB.$invalid);
                        $scope.entryFormB.$invalid = true;
                        console.log($scope.entryFormB.$invalid);

                        var fd = [];
                        var fIds=[];

                        $scope.fileIdObj=[];
                        for(var i=0;i<file.length;i++){
                          fd[i] = new FormData();
                          fd[i].append('file', file[i].file);
                          fd[i].append('randomNumber', randomNumber);
                          fd[i].append('position', $scope.poss);
                          fd[i].append('type', file[i].file.type);

                          console.log(file[i].file.type);
                          BoardDataFactory.uploadAttachments().save(fd[i],function(response) {                         
                            main.bar2.done()                        
                            console.log(response); 
                            main.bar2ProgressVal = 100;
                            var attachObj = {};
                            attachObj.position = response.position;
                            attachObj.fileName = response.fileName;
                            attachObj.id = response.id;
                            attachObj.uploadedFile=(response.fileContent);
                            attachObj.type=response.type; 

                            fIds[i] = response.id;

                            $scope.fileAttach.push(attachObj);
                            $scope.fileIdObj.push(response.id);

                            console.log($scope.lineItem);

                            if($scope.fileAttach.length==file.length){
                                if($scope.tempScop){
                                  $scope.watchAttach = false;
                                  $scope.entryFormB.$invalid = false;
                                }else{
                                  $scope.watchAttach = true;
                                  $scope.entryFormB.$invalid = true;
                                }
                            }
                          });
                        }
                      
                       if(file.length > 0 ){
                            $('#uploader').modal({
                                    backdrop: 'static',
                                    keyboard: true, 
                                    show: true
                            });
                            main.bar2ProgressVal = 0;
                            main.bar2.start();    
                        }
                     
                    }

                    $scope.uploadAddFileToUrl = function (file,randomNumber,position) { 
                        $scope.watchAttach = true;
                        $scope.tempScope = $scope.entryFormB.$invalid;
                        $scope.entryFormB.$invalid = true;
                        console.log(file,randomNumber,position);

                        main.bar2.start()
                        var fd = [];
                        var fIds=[];

                        $scope.fileIdObj=[];
                        for(var i=0;i<file[0].length;i++){

                          fd[i] = new FormData();
                          fd[i].append('file', file[0][i].file);
                          fd[i].append('randomNumber', randomNumber);
                          fd[i].append('position', position);

                          $scope.lineItem[position].fileAttachArray.push({"file":file[0][i].file}); 
                          BoardDataFactory.uploadAttachments().save(fd[i],function(response) {                         
                            main.bar2.done()                        
                            console.log(response); 
                            main.bar2ProgressVal = 100;
                            var attachObj = {};
                            attachObj.position = response.position;
                            attachObj.fileName = response.fileName;
                            attachObj.id = response.id;
                            attachObj.uploadedFile=(response.fileContent);
                            attachObj.type=response.type; 
                            console.log($scope.lineItem);
                            $scope.lineItem[position].fileIds.push(response.id);
                            $scope.lineItem[position].fileArray.push({"fileName":response.fileName, "id":response.id, "position":response.position, "uploadedFile":response.fileContent});  

                            
                            // console.log($scope.lineItem);
                            // fIds[i] = response.id;

                            // $scope.fileAttach.push(attachObj);
                            // $scope.fileIdObj.push(response.id);

                            if($scope.fileAttach.length==file.length){
                                if($scope.tempScop){
                                  $scope.watchAttach = false;
                                  $scope.entryFormB.$invalid = false;
                                }else{
                                  $scope.watchAttach = true;
                                  $scope.entryFormB.$invalid = true;
                                }
                            }
                          });
                        }
                      
                       if(file.length > 0 ){
                            $('#uploader').modal({
                                    backdrop: 'static',
                                    keyboard: true, 
                                    show: true
                            });
                            main.bar2ProgressVal = 0;
                            main.bar2.start();    
                        }
                     
                    }

                    $scope.$watch('testModel', function(){
                      console.log($scope.testModel);
                    });

                    $scope.$watch('myFile', function () {
                              console.log($scope.myFile);
                                $("#fileupload").change(function(){
                                  if($scope.myFile != null){
                                    if($scope.myFile.size > 500000){
                                      $scope.fileSizeAlert=true;
                                    }                              
                                    else{
                                      $scope.fileSizeAlert=false;
                                      console.log($scope.fileSizeAlert);
                                      $scope.readURL(this);
                                      $scope.uploadFileToUrl($scope.myFile, $scope.randomNum); 
                                    }
                                  } $scope.$apply();  
                                });                                 

                    });

                    $scope.showPopover=false;
                    
                    $scope.popover = {
                        title: 'Title',
                        message: 'Message'
                    };  



                 /*Multiple attachment creating a expense*/

                    $scope.files = []; 
                    $scope.$watch('files', function () {
                         console.log($scope.files);
                         $scope.uploadFileToUrl($scope.files, $scope.randomNum);
                          $("#fileuploads").change(function(){
                                 console.log($scope.fileupload);
                           });  

                    });




                 /*Multiple attachment creating a expense add and delete */

                    $scope.addFiles = []; 
                    $scope.changedIndex = function(changedIndexVal){
                       $scope.changedIndexVal = changedIndexVal;
                       console.log($scope.changedIndexVal);
                    }


                    $scope.$watchCollection('addFiles', function () {
                          $scope.uploadAddFileToUrl($scope.addFiles, $scope.randomNum, $scope.changedIndexVal);
                          console.log($scope.addFiles);
                          $("#addfileuploads").change(function(){
                                 console.log($scope.fileupload);
                          }); 

                    });

                   $scope.addFile=[]; 
                    $scope.$watchCollection('addFile', function () {
                          $scope.uploadAddFilesToUrl($scope.addFile, $scope.randomNum, $scope.changedIndexVal);
                          console.log($scope.addFile);
                          $("#addfileuploads").change(function(){
                              console.log($scope.fileupload);
                          }); 

                    });


                 /*Multiple attachment adding  a expense row  */


                    $scope.uploadAddFilesToUrl = function (file,randomNumber,position) { 
                        console.log(file,randomNumber,position);

                        var fd = [];
                        var fIds=[];

                        $scope.fileIdObj=[];
                        for(var i=0;i<file[0].length;i++){

                          fd[i] = new FormData();
                          fd[i].append('file', file[0][i].file);
                          fd[i].append('randomNumber', randomNumber);
                          fd[i].append('position', position);

                            //$scope.lineItem[position].fileAttachArray.push({"file":file[0][i].file}); 
                            BoardDataFactory.uploadAttachments().save(fd[i],function(response) {                         
                            main.bar2.done()                        
                            console.log(response); 
                            main.bar2ProgressVal = 100;
                            var attachObj = {};
                            attachObj.position = response.position;
                            attachObj.fileName = response.fileName;
                            attachObj.id = response.id;
                            attachObj.uploadedFile=(response.fileContent);
                            attachObj.type=response.type; 

                            $scope.lineItem[position].attachmentArray.push({"fileName":response.fileName, "id":response.id});
                            // $scope.lineItem[position].fileIds.push(response.id); 

                            $scope.fileAttach.push(attachObj);
                            $scope.fileIdObj.push(response.id);
                            console.log($scope.fileIdObj);
                            /*if($scope.fileAttach.length==file.length){
                                if($scope.tempScop){
                                  $scope.watchAttach = false;
                                  $scope.entryFormB.$invalid = false;
                                }else{
                                  $scope.watchAttach = true;
                                  $scope.entryFormB.$invalid = true;
                                }
                            }*/
                          });
                        }
                      
                       if(file.length > 0 ){
                            $('#uploader').modal({
                                    backdrop: 'static',
                                    keyboard: true, 
                                    show: true
                            });
                            main.bar2ProgressVal = 0;
                            main.bar2.start();    
                        }
                     
                    }









/*
                    $scope.$watchCollection('upmyFiled', function (newValue, oldValue) {
                        if(newValue !== oldValue){
                            if($scope.upmyFiled.size > 500000){
                                   $scope.upfileSizeAlert[position]=true;
                                   $scope.upmyFiled=null;                  
                            }else{
                                $scope.newPosition = $scope.lineItem.length;
                                console.log($scope.lineItem.length);
                                uduploadFileToUrl($scope.upmyFiled, $scope.randomNum, $scope.newPosition);
                                $scope.upfileSizeAlert[$scope.newPosition]=false;
                            }
                        }
                    }, true);

                    $scope.$watchCollection('upmyFile', function (newValue, oldValue) {
                      console.log($scope.upmyFile);
                      if(newValue !== oldValue){
                       for(var i = 0; i < newValue.length; i++) {
                          if(newValue[i]!= oldValue[i])
                            var indexOfChangedItem = i;
                            console.log(indexOfChangedItem);
                            if($scope.upmyFile[indexOfChangedItem] != null)
                            $scope.uduploadFile(indexOfChangedItem);

                           } 
                       }
                    }, true);

                    $scope.upfileSizeAlert = [];
                    $scope.uduploadFile = function (position) {
                        // if($scope.myFile == null)
                        // {
                        //     $scope.myFile=[];
                        // }

                        main.bar2ProgressVal = 0;
                        console.log(position);   
                        if($scope.upmyFile[position].size > 500000){
                               $scope.upfileSizeAlert[position]=true;
                               $scope.upmyFile[position]=null;                  
                        }else{
                            console.log($scope.upmyFile);
                            uduploadFileToUrl($scope.upmyFile[position], $scope.randomNum, position);
                            $scope.upfileSizeAlert[position]=false;
                        }
                        
                    };


                    function uduploadFileToUrl(file,randomNumber,position) {
                      console.log(file);
                      console.log(randomNumber);
                      console.log(position);

                        var fd = new FormData();
                        fd.append('file', file);
                        fd.append('randomNumber', randomNumber);
                        fd.append('position', position);
                        console.log(fd);
                        if(file != false ){
                             
                            $('#uploader'+position).modal({
                                    backdrop: 'static',
                                    keyboard: true, 
                                    show: true
                            });

                            $('#uploader').modal({
                                    backdrop: 'static',
                                    keyboard: true, 
                                    show: true
                            });
                            main.bar2ProgressVal = 0;
                            main.bar2.start();
                            
                            
                        }


                        BoardDataFactory.uploadAttachments().save(fd,function(response) {
                            console.log(response);
                            main.bar2.done()
                            
                            // $('#uploader').modal('hide');
                            main.bar2ProgressVal = 100;
                            var attachObj = {};
                            attachObj.position = response.position;
                            attachObj.fileName = response.fileName;
                            attachObj.id = response.id;                            
                            $scope.fileAttach.push(attachObj);
                            $scope.fNameTest = response.fileName
                            $scope.fIdTest = response.id
                            $scope.fName[response.position] = response.fileName;
                            $scope.fContent = response.fileContent;
                            $scope.fId[response.position] = response.id;
                            console.log($scope.fName);

                        });
                    }
*/
                  /*creating new row in expense entry and adding multiple attachment*/


                    $scope.$watchCollection('upmyFiled', function (newValue, oldValue) {
                      console.log($scope.upmyFiled);
                        if(newValue !== oldValue){
                            if($scope.upmyFiled.size > 500000){
                                   $scope.upfileSizeAlert[position]=true;
                                   $scope.upmyFiled=null;                  
                            }else{
                                $scope.newPosition = $scope.lineItem.length;
                                console.log($scope.lineItem.length);
                                uduploadFileToUrl($scope.upmyFiled, $scope.randomNum, $scope.newPosition);
                                $scope.upfileSizeAlert[$scope.newPosition]=false;
                            }
                        }
                    }, true);





            /*  Adding multiple Attachment in existing records */


                    $scope.$watchCollection('upmyFile', function (newValue, oldValue) {
                      console.log($scope.upmyFile);
                      if(newValue !== oldValue){
                       for(var i = 0; i < newValue.length; i++) {
                          if(newValue[i]!= oldValue[i])
                            var indexOfChangedItem = i;
                            console.log(indexOfChangedItem);
                            if($scope.upmyFile[indexOfChangedItem] != null)
                            $scope.uduploadFile(indexOfChangedItem);

                           } 
                       }
                    }, true);

                    $scope.upfileSizeAlert = [];
                    $scope.uduploadFile = function (position) {
                      console.log(position);

                        main.bar2ProgressVal = 0;
                        console.log(position);   
                        if($scope.upmyFile[position].size > 500000){
                               $scope.upfileSizeAlert[position]=true;
                               $scope.upmyFile[position]=null;                  
                        }else{
                            console.log($scope.upmyFile);
                            console.log($scope.upmyFile[position]);
                            console.log(position);

                            uduploadFileToUrl($scope.upmyFile[position], $scope.randomNum, position);
                            $scope.upfileSizeAlert[position]=false;
                        }
                        
                    };


            /*creating new row in expense entry and adding multiple attachment*/

            /*  Adding multiple Attachment in existing records */

            /* both will call same Method */

                   function uduploadFileToUrl(file,randomNumber,position) {
                      console.log(file);
                      console.log(randomNumber);
                      console.log(position);

                        var fd = [];
                        var fIds=[];

                        $scope.fileIdObj=[];
                        for(var i=0;i<file.length;i++){
                          fd[i] = new FormData();
                          fd[i].append('file', file[i].file);
                          fd[i].append('randomNumber', randomNumber);
                          fd[i].append('position', position);
                          fd[i].append('type', file[i].file.type);
  
                          console.log(file[i].file.type);

                          BoardDataFactory.uploadAttachments().save(fd[i],function(response) {                         
                            main.bar2.done()
                            console.log(response); 
                            main.bar2ProgressVal = 100;
                            var attachObj = {};
                            attachObj.position = response.position;
                            attachObj.fileName = response.fileName;
                            attachObj.id = response.id;
                            attachObj.uploadedFile=(response.fileContent);
                            attachObj.type=response.type; 

                            fIds[i] = response.id;
                            console.log(" *****************" ,fIds[i]);

                            $scope.fileAttach.push(attachObj);
                            $scope.fileIdObj.push(response.id);
                            console.log($scope.fileAttach);
                            console.log($scope.fileIdObj);


                          });
                          

                        }


                    }


                    /*
                     * Fetching Project List For A Resource
                     */
                    function ProjectListForResource() {
                        BoardDataFactory.fetchProjects().query(function(projResponse) {
                            $scope.project = projResponse.projects;
                            console.log(projResponse.projects);
                        });
                    }

                    /*
                     * After the Employee process the cards available in 'Submit' swimlane it receives the response in the form
                     * of success array and failure array enclosed within document jsonObject... The success and failure array contains the id of the 
                     * card being processed along with the count of the success and failure cards.
                     * So., this function removes the cards available in 'Submit' swimlane when it gets proccessed successfully.
                     */
                    function deleteCardOnSuccess(hdrRecordCardId) {
                        angular.forEach($scope.empBoard.columns, function(column) {
                            for (var i = 0; i < column.documents.length; i++) {
                                if (column.name === "Submit" && column.documents[i].id === hdrRecordCardId) {
                                    column.documents.splice(i, 1);
                                    break;
                                }
                            }
                        })
                    }

                    /*
                     * After the Employee process the cards available in 'Submit' swimlane it receives the response in the form
                     * of success array and failure array enclosed within document jsonObject... The success and failure array contains the id of the 
                     * document being processed along with the count of the success and failure cards.
                     * So., this function removes the cards available in 'Submit' swimlane when it gets proccessed got failed and 
                     * adds to 'Draft' column.
                     */
                    function deleteCardOnFailure(hdrRecordCardId) {
                        angular.forEach($scope.empBoard.columns, function(column) {
                            for (var i = 0; i < column.documents.length; i++) {
                                if (column.name === "Submit" && column.documents[i].id === hdrRecordCardId) {
                                    hdrCard = column.documents[i];
                                    addCardToDraftColumn(column.documents[i]);
                                    column.documents.splice(i, 1);
                                    break;
                                }
                            }
                        })
                    }

                    /*
                     * This function is called within deleteCardOnFailure(docId) and it add the document / card to 'Draft' swimlane
                     */
                    function addCardToDraftColumn(cards) {
                        angular.forEach($scope.empBoard.columns, function(column) {
                            if (column.name === "Draft") {
                                column.documents.splice(1, 0, cards);
                            }
                        })
                    }

                    $scope.$watchCollection('[projId, entryType]', function(newValues) {
                        
                        if(newValues[0] != null && newValues[1] !=null) {
                            getActivityList(newValues[0], newValues[1]);
                            getReportCycle(newValues[0]);
                        }
                    });


                    $scope.testSum = function(list) {
                       
                        var total = 0;
                        angular.forEach(list, function(item) {
                            total += item;
                        });
                        return total;
                    }

                     $scope.expSumb = function() {
                        console.log("sum");
                        var total = 0;
                        angular.forEach($scope.lineItem, function(item) {
                            total += item.convAmount;
                            console.log(item);
                        });
                        
                        return total;
                    }

                    $scope.upEditSum = function(){
                        console.log($scope.updatedConvAmount);
                        var total = 0;
                        angular.forEach($scope.updatedConvAmount, function(item) {
                            total += item;
                        });
                        console.log(total);
                        return total;
                    }

                    $scope.expSum = function(list) {
                     
                        var total = 0;
                        angular.forEach(list, function(item) {
                            total += item;
                        });
                        return total;
                    }


                    $scope.checkBlank = function (position) {
                        if($scope.entryExpValue[position]==undefined){
                          $scope.entryExpValue[position] = 0;
                          $scope.expSum($scope.entryExpValue);
                        }
                    };

                    $scope.editCheckBlank = function (position) {
                        if($scope.editedExpValue[position]==undefined){
                          $scope.editedExpValue[position] = 0;
                          $scope.expSumb();
                        }else{
                          $scope.expSumb();
                        }
                    };



                    $scope.timSum = function(list) {
                        var total = 0;
                        angular.forEach(list, function(item) {
                            total += parseInt(item, 10);
                        });
                        return total;
                    }

                    $scope.hideEntry = function(){
                       
                        $scope.repCycId=false;
                        $scope.activityId=false;
                    }

                    $scope.hideExpEntry = function(){
                       
                        $scope.repCycId=false;
                        $scope.activityId=false;
                        $scope.entryValue = [];
                        $scope.entryExpValue = [];
                        $scope.fileAttach = [];
                        $scope.myFile=[];$scope.fName =[];$scope.fNameClass = [];

                    }

                    $scope.cancelUpdate = function (){
                        
                        $mdDialog.cancel($scope.myFile=[],$scope.fName =[],$scope.fNameClass = [], $scope.editedExpValue = [], $scope.editedTimeValue = [], $scope.lineItem = [], $scope.fNameTest='');
                        
                    }
                    /*
                     * Fetching Activity List For A Selected Project
                     */
                    function getActivityList(project, docType) {
                        var proj = JSON.parse(project);
                        var activityList = BoardDataFactory.fetchActivityForProject(proj.projectId, docType).query(function() {
                            $scope.activity = activityList.activities;
                        })
                    }

                    /*
                     * Fetching Report Cycle List For A Selected Project And Resource
                     */
                    function getReportCycle(project) {
                     
                        var proj = JSON.parse(project);
                        var reportCycleList = BoardDataFactory.fetchReportCycleForProject(proj.projectId).query(function() {
                            $scope.reportCycle = reportCycleList.reportCycles;
                        })
                    }

                    $scope.getDateFormat = function(startVal, endVal){    
                        console.log(startVal, endVal);      
                        $scope.upStartDate = new Date(startVal);
                        $scope.upEndDate = new Date(endVal);
                        console.log($scope.upStartDate, $scope.upEndDate);
                    }

                    $scope.passDates = function(passDate) {
                      console.log(passDate);
                        if (passDate) {
                            var recDates = JSON.parse(passDate);
                            $scope.startRepDate = new Date(recDates.startDate);
                            $scope.endRepDate = new Date(recDates.endDate);
                            var itr = moment.twix(recDates.startDate, recDates.endDate).iterate("days");
                            var range = [];
                            while (itr.hasNext()) {
                                range.push(itr.next().toDate());
                            }
                            $scope.rangeDate = range;
                        }
                        mondayFind();
                        $scope.expensedDate = $scope.startRepDate;


                    }


                    //sum of timesheets hours and expenses amounts for employee
                    $scope.getEmpTotal = function(column) {
                                                    
                        var docCount = {
                            totalTimeSheetHours: 0,
                            totalExpenseAmount: 0
                        };
                        var sec = 0;
                        var selectedProject = $scope.myFilter3;
                        var selectedActOrExp = $scope.myFilter4;
                        var selectedRepCycle = $scope.myFilter5;
                        
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
                    
                    //Hours conversion
                    $scope.convertToHHMM = function (decVal){
                        return $scope.result = moment.duration(parseFloat(decVal) ,'hours').format("HH:mm", {trim: false});
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
                            if ((card.type == "timesheet" && card.status == "Saved") || (card.type == "timesheet" && card.status == "Rejected")) {
                                docCount.timeSheet++;
                            } else if ((card.type == "expense" && card.status == "Saved") || (card.type == "expense" && card.status == "Rejected")) {
                                docCount.expense++;
                            }
                        });
                        $scope.countCheck = docCount;
                        return docCount;
                    };


                    // history
                    
                    $scope.countHistory = function(column) {

                        var docCount = {
                            timeSheet: 0,
                            expense: 0
                        };

                        var selectedProject = $scope.myFilter3;
                        var selectedActOrExp = $scope.myFilter4;
                        // var selectedEmployee = $scope.myFilter5;
                        var selectedRepCycle = $scope.myFilter5;

                        var isFilterApplied = false;

                        angular.forEach(column.documents, function(card) {

                            var isFilteredCard = true;

                            if (isFilteredCard) {
                                if (selectedProject != null && selectedProject != "") {
                                    isFilterApplied = true;
                                    isFilteredCard = getHdrRecordCardArrayCount(card.projectName, selectedProject);
                                }
                            }

                            if (isFilteredCard) {
                                if (selectedActOrExp != null && selectedActOrExp != "") {
                                    isFilterApplied = true;
                                    isFilteredCard = getHdrRecordCardArrayCount(card.title, selectedActOrExp);
                                }
                            }

                           

                            if (isFilteredCard) {
                                if (selectedRepCycle != null && selectedRepCycle != "") {
                                    isFilterApplied = true;
                                    isFilteredCard = getHdrRecordCardArrayCount(card.reportCycle, selectedRepCycle);
                                }
                            }


                            if (!isFilterApplied) {
                                if ((card.type == "timesheet" && card.status == "Approved_Int") || (card.type == "timesheet" && card.status == "Approved_Final") || (card.type == "timesheet" && card.status == "Submitted")) {
                                docCount.timeSheet++;
                                } else if ((card.type == "expense" && card.status == "Approved_Int") || (card.type == "expense" && card.status == "Approved_Final")  || (card.type == "expense" && card.status == "Submitted")) {
                                docCount.expense++;
                                }
                            } else if (isFilteredCard) {
                                if ((card.type == "timesheet" && card.status == "Approved_Int") || (card.type == "timesheet" && card.status == "Approved_Final") || (card.type == "timesheet" && card.status == "Submitted")) {
                                docCount.timeSheet++;
                            } else if ((card.type == "expense" && card.status == "Approved_Int") || (card.type == "expense" && card.status == "Approved_Final")  || (card.type == "expense" && card.status == "Submitted")) {
                                docCount.expense++;
                            }
                            }
                        });
                        return docCount;
                    };


                                        /*
                     * It gives the total count of available timesheet or an expense documents available in their respective swimlanes 
                     */
                    $scope.totalcountHistory = function(column) {
                      console.log(column)
                        var docCount = {
                            timeSheet: 0,
                            expense: 0
                        };

                        angular.forEach(column.documents, function(card) {
                            if ((card.type == "timesheet" && card.status == "Approved_Int") || (card.type == "timesheet" && card.status == "Approved_Final") || (card.type == "timesheet" && card.status == "Submitted")) {
                                docCount.timeSheet++;
                            } else if ((card.type == "expense" && card.status == "Approved_Int") || (card.type == "expense" && card.status == "Approved_Final")  || (card.type == "expense" && card.status == "Submitted")) {
                                docCount.expense++;
                            }
                        });
                        $scope.countCheck = docCount;
                        return docCount;
                    };
                    
                    //name
                    $scope.getName = function(column) {
                        angular.forEach(column.documents, function(card) {
                            name = card.empName;
                        });
                        return name;
                    };

                    
                    /*
                     * Post function for creating new timesheet or expense after 'Save' or 'Save & Submit' button is clicked on 
                     * the modal window
                     */
                    $scope.processCard = function(finalRequest, type) {
                        console.log(finalRequest);
                        $scope.saving=true;
                        var newDocCreation = BoardDataFactory.resourceDocuments().save(finalRequest, function(response) {
                            console.log(newDocCreation);
                            $scope.saving=true;
                            if (type === "timesheet")
                                $mdDialog.cancel($scope.entryValue = {}, $scope.repCycId = {});
                            else
                                $mdDialog.cancel($scope.entryExpValue = {}, $scope.repCycId = {});
                            $state.reload();
                            processNotification(newDocCreation, false);
                        });
                    }

                    /*
                     * Delete function for deleting the timesheet or expense from the draft swim lane
                     */
                    $scope.deleteDocument = function(docId, docType) {
                       var deleteDocument = BoardDataFactory.deleteDocument(docId,docType).remove(function(){
                          
                           $state.reload();
                           
                       });
             
                    }



                    /*
                     * For getting the current timestamp in the form of milliseconds
                     */
                    function getTimestamp() {
                        var time = new Date().getTime();
                        return time;
                    }

                    $scope.fetchRCforCopy = function(projId){
                        console.log(projId);
                        var reportCycleList = BoardDataFactory.fetchReportCycleForProject(projId).query(function() {
                            $scope.reportCycle = reportCycleList.reportCycles;
                            console.log($scope.reportCycle);
                        })
                    }


                    // Copy To RC
                    $scope.copyToRC = function(card, lineItems, destRC){  
                        console.log(lineItems);
                        $scope.randomNum = randomString();
                        var reCycVal = JSON.parse(destRC);

                        $scope.copyDoclines = [];
                        angular.forEach(lineItems, function(value, key){
                            $scope.copyDoclines.push({"billable":"Yes",
                                        // "date":reCycVal.startDate.slice(0, 10),
                                        "date":moment(reCycVal.startDate.slice(0, 10)).add('days', key).format('YYYY-MM-DD'),
                                        "docId":null,
                                        "fileName":null,
                                        "note":value.note,
                                        "status":"PHRM_SD",
                                        "value":value.hoursWorked})
                        });
 
                        // console.log(proj);
                        var entryObj = {};
                        entryObj.randomNumber = $scope.randomNum;
                        entryObj.orgId = card.orgId;
                        entryObj.projectId = card.projectId;
                        entryObj.empId = card.empId;
                        entryObj.userId = card.userId;
                        entryObj.codeId = card.codeId;
                        entryObj.startDate = reCycVal.startDate.slice(0, 19);
                        entryObj.endDate = reCycVal.endDate.slice(0, 19);
                        entryObj.billable = 'Yes';
                        entryObj.docLine = $scope.copyDoclines;
                        entryObj.type = card.type;
                        entryObj.value = 0;
                        entryObj.status = 'PHRM_SD';
                        documents.push(entryObj);
                        finalRequest.documents = documents;
                        console.log(finalRequest.documents);
                        $scope.processCard(finalRequest, card.type);
                    }



                    /*
                     * Checking whether card exists or not in Draft Column
                     */
                    $scope.CardExist = function(column, projectId, categoryId, startDate, endDate, type) {
                        console.log(categoryId);
                        var sDate = null;var eDate = null;var isCardExists = false;
                        sDate = startDate.slice(0, 10);
                        eDate = endDate.slice(0, 10);
                        if (column.documents.length >= 0) {
                            loop: for (var i = 0; i < column.documents.length; i++) {
                                if (column.documents[i].type === type) {
                                    if (column.documents[i].projectId === projectId && column.documents[i].codeId === categoryId &&
                                        column.documents[i].startDate === sDate && column.documents[i].endDate === eDate) {
                                        console.log("condition satisfied");
                                        isCardExists = true;
                                        break loop;
                                    }
                                }
                            }
                            if (isCardExists){
                                $('#alrdyExi').modal('show'); 
                                $scope.showEntry = false;
                            }
                            else {
                                console.log("condition unsatisfied");
                                $scope.showEntry = true;
                            }
                        }

                    }


                    //check
                    // $scope.testFunction = function(){
                    //   $state.reload();
                    // }

                    /*
                     * This function enables the process function on the new card creation whether timesheet or expense.
                     */
                    $scope.CheckProcess = function(boolean, type) {

                        if (boolean) {
                            $('#alrdyExi').modal('show'); 
                            $scope.cardCreationError = "Document Already Exists";
                         } else
                             $scope.processCard(finalRequest, type);
                    }

                    /*
                     * This function changes the status value from the requestbody created after process button is clicked 
                     * available in 'Submit' swimlane and sends the modified request to the bridge server for processing.
                     */
                    $scope.process = function(empBoard) {
                     
                        $rootScope.materialPreloader = true;
                        var finalRequest = {};
                        angular.forEach(empBoard.columns, function(column) {
                            if (column.name === "Submit") {
                                finalRequest.documents = column.documents;
                            }
                        });
                         
                        for (var i = 0; i < finalRequest.documents.length; i++) {
                            if (finalRequest.documents[i].status == "Saved")
                                finalRequest.documents[i].status = "PHRM_SB";

                            if (finalRequest.documents[i].status == "Rejected")
                                finalRequest.documents[i].status = "PHRM_SB";
                        }
                        

                        /*
                         * This function processes the request created after the process button is clicked 
                         * and returns the response from the bridge server 
                         */
                        var responseAfterProcessing = BoardDataFactory.resourceDocuments().save(finalRequest, function() {
                            $rootScope.materialPreloader = false;
                            
                            $rootScope.employee.complete();
                            $state.reload();
                            processNotification(responseAfterProcessing, true);
                        });

                    }

                    /*
                     * This function is used for parsing the response recieved after processing the document and creating 
                     * the notification objects which needs to be displayed in the notification tray icon for an user.
                     */
                    function processNotification(serverResponse, boolean) {

                        var messages = {
                            timestamp: getTimestamp()
                        };

                        angular.forEach(serverResponse.documents.success, function(success) {

                            if (boolean)
                                deleteCardOnSuccess(success.id);
                        })

                        angular.forEach(serverResponse.documents.failure, function(failure) {

                            if (boolean)
                                deleteCardOnFailure(failure.id);
                        })

                        if (serverResponse.documents.failureMessage !== null && serverResponse.documents.successMessage === null) {
                            messages.type = "resourceDocument";
                            messages.failure = serverResponse.documents.failureMessage;
                            messages.success = null;
                            EmpBoardService.createNotifications($scope.empBoard, messages);
                        } else if (serverResponse.documents.successMessage !== null && serverResponse.documents.failureMessage === null) {
                            messages.type = "resourceDocument";
                            messages.success = serverResponse.documents.successMessage;
                            messages.failure = null;
                            EmpBoardService.createNotifications($scope.empBoard, messages);
                        } else if (serverResponse.documents.failureMessage !== null && serverResponse.documents.successMessage !== null) {
                            messages.type = "resourceDocument";
                            messages.success = serverResponse.documents.successMessage;
                            messages.failure = serverResponse.documents.failureMessage;
                            EmpBoardService.createNotifications($scope.empBoard, messages);
                        }
                        $rootScope.$storage.x = $scope.empBoard;
                    }
                },
                function(errResponse){
                    if(errResponse.status == 403)
                    {
                        $rootScope.accessDeny=true;
                         $rootScope.employee.complete();
                    }
                    
                });
            }
        ]);