/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */
'use strict';

angular
    .module('demoApp')
    .controller(
        'KanbanController', ['$http',
            '$scope','$rootScope','$mdDialog',
            '$filter','$interval',
            'BoardService',
            'BoardDataFactory', 'notifications','$cookieStore','ngProgressFactory','orderByFilter','$localStorage', '$sessionStorage', '$state',
            function($http, $scope, $rootScope,$mdDialog, $filter, $interval, BoardService, BoardDataFactory, notifications,
            		$cookieStore,ngProgressFactory,orderBy,$localStorage, $sessionStorage,  $state) {
	        
            $rootScope.materialPreloader = false;
            $rootScope.accessDeny=false;
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

            $scope.cancelUpdate = function (){            
               $mdDialog.cancel();                       
            }

            

            function DialogController($scope, $mdDialog, dataToPass,carddataToPass,linedocsTopass) {
                $scope.lineindex = dataToPass;
                $scope.card = carddataToPass;
                $scope.lineDocitem = linedocsTopass;
            }
            
            $scope.convertToHHMM = function (decVal){
                  // console.log(decVal);
                  return $scope.result = moment.duration(parseFloat(decVal) ,'hours').format("HH:mm", {trim: false});
                  // console.log($scope.result);
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

            $scope.resetColumns = function(){
                if (confirm('This will reset all the filters and columns. Are you sure you want to reload the Approval Page?')) {
                    $state.reload();
                } else {
                    // Do nothing!
                }
                                
            }

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


                   if (event.source.sortableScope.$parent.column.name === "Reject" && event.dest.sortableScope.$parent.column.name === "Pending") {
                        angular.forEach(event.dest.sortableScope.$parent.column.documents, function (value, key) {
                            $scope.clearRejectReason(value);
                       })  
                        
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

                    console.log($scope.kanbanBoard);
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
                            $scope.sendData = function(selectRejectReason,rejectNote) {
                            var rejData = JSON.parse(selectRejectReason);
                            console.log(rejData);
                            $scope.rejectId = rejData.rejectReasonId;
                            $scope.rejectNote = rejectNote;
                            updatingCard(rejData.rejectReason,rejData.rejectReasonId,rejectNote, value);
                        }

					   })  
                },

                containment: '#board'
            };


            $scope.clearColumn = function(indexVal){
                console.log(indexVal);
                angular.forEach($scope.kanbanBoard.columns[indexVal].documents,function(value,key){
                        $scope.kanbanBoard.columns[0].documents.unshift($scope.kanbanBoard.columns[indexVal].documents[key]);
                        $scope.clearRejectReason(value);
                });
                $scope.kanbanBoard.columns[indexVal].documents = [];

            }


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
                     processObj.rejectNote=card.rejectNote;
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
            function updatingCard(rejName, rejectId,rejectNote,card) {
                card.rejectReasonName = rejName;
                card.rejectReason = rejectId;
                card.rejectNote = rejectNote;  
            }

            $scope.clearRejectReason = function (card) {
                card.rejectReasonName = null;
                card.rejectReason = null;
                card.rejectNote = null;  
                card.rejectReasonNote = null;
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
                console.log(finalRequest.documents);
                
                /*
                 * This function processes the request created after the process button is clicked and returns the response from the 
                 * bridge server 
                 */
                var respAfterProcessing = BoardDataFactory.approvalDocs().save(finalRequest, function() {
                    console.log("response got");
                	$rootScope.materialPreloader = false;
                    $rootScope.approval.complete();
                	processNotification(respAfterProcessing);
                    $state.reload();
                });
            }
            
            $scope.reverse=false;

            $scope.sortBy = function(propertyName,reverseTog,kanbanBoard) {
                console.log(propertyName,reverseTog,kanbanBoard);
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
        ]);
