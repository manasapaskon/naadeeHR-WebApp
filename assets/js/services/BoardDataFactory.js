

'use strict';

angular.module('demoApp') 

/*
 * This class implements the service method which inturn returns a $resource object. This class is accesssed in KanbanBoard.js and 
 * EmpKanbanBoard.js when an Approving Manager or an Employee wants to view their respective Dashboard nad try to process some cards.
 */
.service(
    'BoardDataFactory', ['$rootScope', '$cookieStore', '$timeout', '$q','ngProgressFactory','$resource', function($rootScope, $cookieStore, 
    		$timeout, $q, ngProgressFactory,$resource) {

        $rootScope.approval = ngProgressFactory.createInstance();
        $rootScope.approvalLineItems = ngProgressFactory.createInstance();
        $rootScope.employee = ngProgressFactory.createInstance();
        $rootScope.empProc = ngProgressFactory.createInstance();
        $rootScope.apprProc = ngProgressFactory.createInstance();
        $rootScope.upload = ngProgressFactory.createInstance();

        var userId = $cookieStore.get('globals').currentUser.userId;
        var empId = $cookieStore.get('globals').currentUser.empId;
        

        var hostName = 'http://dev.app-hr.paskon.com:8080/dev-naadee-hr-tex/';
        // http://192.168.1.37:8080/naadee-hr-tex -
        // 'http://dev.app-hr.paskon.com:8080/dev-naadee-hr-tex/'
        // 'http://test.app-hr.paskon.com:8080/test-naadee-hr-tex/'
         // 'http://pilot.app-hr.paskon.com:8080/pilot-naadee-hr-tex/'
        
        var approvalDocuments = hostName + 'users/' + userId + '/approval-documents';

        return {
            /* 
             * This function is called 2 times.,
             * 1. When an Approving Manager clicks on Approvals in Navigation pane after successful 
             * login for fetching all the ‘Submitted’ documents and display in the ‘Pending’ swimlane.
             * 
             * 2. When an Approving Manager wants to perform any actions on the submitted cards available in ‘Pending’ swimlane, 
             * he drags the card to ‘Reject’ or ‘Approve’ swimlane and click on process at that moment it’s a POST call and 
             * the cards are processed available in ‘Reject’ or ‘Approve’ swimlane. 
             */
            approvalDocs: function() {
            	$rootScope.approval.start();
              $rootScope.approval.setColor('#187dbd');
              // var fetchApprovalDocuments = hostName + 'users/' + userId + '/approval-documents';
	            return $resource(approvalDocuments,{},{
	        		query: { method:'GET', isArray:false }
	        	});
            },

            /* 
             * This function is called when as soon as Approving Manager login to the web-app and clicks on Manage Approvals 
             * it fetches all the reject reason configured for the entire project for which the Approving Manager is assigned.
             */
            fetchRejectReasonForProject: function(projectId) {
                var projRejectReason = hostName + 'users/' + userId + '/project/' + projectId + '/reject-reasons';
                return $resource(projRejectReason,{},{                    
            		query: { method:'GET', isArray:false}
            	});
            },

            /* 
             * The function is called when an Approving Manager or an Employee/Resource, clicks on the header of any 
             * card available in any swimlanes for displaying the details of it.
             */
            fetchDocumentLineItems: function(documentId,docType) {

                $rootScope.approvalLineItems.start();
                $rootScope.approvalLineItems.setColor('#187dbd');
                var lineItemsUrl = hostName + 'users/' + userId + '/documents/' + documentId + '/lines?' + 'docType=' + docType;
                console.log(lineItemsUrl);
                return $resource(lineItemsUrl,{},{
            		query: { method:'GET', isArray:false }
            	});
            },

            /* 
             * This function is called when an employee logs in[This function returns the openbravo alerts for corresponding employee].
             */
            fetchAlerts: function(userId){
                var getAlertsUrl = hostName + 'users/' + userId + '/alerts';
                return $resource(getAlertsUrl,{},{
                    query: { method:'GET', isArray:false }
                });
            },
            

             /* 
             * This function is called 2 times.,
             * 1. When an Employee clicks on Employee in Navigation pane after successful login for fetching 
             * all the ‘Saved’ documents and display in the ‘Draft’ swimlane.
             * 
             * 2. When an Employee wants to perform any actions on the saved cards available in ‘Draft’ swimlane, he drags the card to 
             * ‘Submit’ and click on process at that moment it’s a POST call and the cards are processed available in ‘Submit’ swimlane. 
             */           
            resourceDocuments: function(){
                $rootScope.employee.start();
                $rootScope.employee.setColor('#187dbd');
                var docUrl = hostName + "users/" + userId + "/documents"
                
                return $resource(docUrl,{},{
                	query: {method:'GET', isArray:false }
                });                
            },
            
            /* 
             * This function is called when a employee delete a document[Timesheet/expense].
             */
            deleteDocument: function(docId,docType){
               
               var deleteUrl = hostName + "users/" + userId + "/documents/" + docId + "?docType=" + docType;
               
              return $resource(deleteUrl,{},{                  
                   remove: {method:'DELETE'}
               });             
              
            },
            
            /* 
             * This function is called when an Employee clicks on Create Timesheet / Create Expense button it fetches 
             * all the projects to which an employee is assigned to.
             */           
            fetchProjects: function() {
            	
            	var projectUrl = hostName + "users/" + userId + "/projects";
            	
            	return $resource(projectUrl,{},{
            		query: {method:'GET', isArray:false }
            	});
            },

            /* 
             * This function is called after an employee clicks on Create Timesheet / Create Expense button a modal window 
             * appears and in that we get ‘Select Project’, ‘Select Category’ and ‘Select Report Cycles’ dropdown.
             * Then first on selecting a particular project after that it fetches all the activity/category assigned to 
             * that project based on projectId and ‘Select Category’ drop down gets enabled.
             */
            fetchActivityForProject: function(projectId, docType) {
            	var activityUrl = hostName + "project/" + projectId + "/activities?" + "docType=" + docType;
            	
            	return $resource(activityUrl,{},{
            		query: {method:'GET', isArray:false }
            	});
           },

           /* 
            * This function is called after when an employee selects a particular project in Create Timesheet / Create Expense 
            * modal window it fetches all the reporting cycles for that project based on projectId.
            */
           fetchReportCycleForProject: function(projectId) {
               
               var reportCycleUrl = hostName + "employee/" + empId + "/project/" + projectId +"/report-cycle";
               
               return $resource(reportCycleUrl,{},{
            	   query: {method:'GET', isArray:false }
               });
           },


           /* 
            * This function is called when a employee creates the new Expense and do a file Upload feature for attaching expense proof
            * for the lineItems.
            */
            uploadAttachments: function() {
                
                var uploadUrl = hostName + "upload/:id";

                return $resource(uploadUrl,{},{
                    save: {method:'POST', isArray:false, transformRequest : angular.identity, headers : {'Content-Type' : undefined} },
                    remove: {method:'DELETE'}
                });
            },
            
            /* 
             * This function is called when an employee wants to update documents.
             * 
             */
            updateDocumentLines: function(docId,docType) {
            	
            	var updateUrl = hostName + 'users/' + userId + '/documents/' + docId + '/lines?' + 'docType=' + docType;
              console.log(updateUrl);
            	return $resource(updateUrl,{},{
            	query: {method:'POST', isArray:false },
            	update: {method:'PUT'}
            	});
			},
            
            /* 
             * This function is called when an employee wants to delete attachment after the expense document is created/saved (update process)
             * 
             */
            deleteAttachmentFromOB: function(attachmentId) {
            	
            	 var uploadUrl = hostName + "upload/" + attachmentId + ".ob";
            	 return $resource(uploadUrl,{},{
            		 query: {method:'GET', isArray:false }
                 });
            },

             fetchResourceList: function(userId){
               var getDahBoardProjectUrl = hostName + '/v1.0/reports/users/' + userId +'/resourceList';
               return $resource(getDahBoardProjectUrl,{},{
                   query: { method:'GET', isArray:false }
               });
            },

            
            // SalesInvoiceSummary for Dashboard
            getSalesInvoiceSummary: function(userId,role,x,y){
                var getSalesInvoiceSummaryUrl = hostName + '/v1.0/reports/users/' + userId +'/salesInvoiceSummary?fromDate=' + x + '&toDate=' + y +'&roles=' +role;
                return $resource(getSalesInvoiceSummaryUrl,{},{
                    query: { method:'GET', isArray:false }
                });
            },

            // SalesInvoiceSummaryTile for Dashboard
            fetchSalesInvoiceSummaryTile: function(userId,role,x,y){
                var getSalesInvoiceSummaryTileUrl = hostName + '/v1.0/reports/users/' + userId +'/salesInvoiceSummaryTile?fromDate=' + x + '&toDate=' + y +'&roles=' +role;
                console.log(getSalesInvoiceSummaryTileUrl);
                return $resource(getSalesInvoiceSummaryTileUrl,{},{
                    query: { method:'GET', isArray:false }
                });
            },

            //Currency Conversion
            fetchCurrencyExRate: function(){
                var fetchCurrencyExRate = hostName + '/v1.0/currencyConversion';
                return $resource(fetchCurrencyExRate,{},{
                    query: { method:'GET', isArray:false }
                });
            },

            // Fetches all resources name for Dashboard
            fetchAllEmployeeDetails: function(userId, x ,y){
                console.log(x);
                var getAllEmployeeDetailsUrl = hostName + '/v1.0/reports/users/' + userId +'/activitySummary?startDate=' + x + '&endDate=' + y;
                return $resource(getAllEmployeeDetailsUrl,{},{
                    query: { method:'GET', isArray:false }
                });
            },

             fetchDashBoardProjects: function(userId,resId){
               var getDahBoardProjectUrl = hostName + 'v1.0/users/' + userId +'/resources/' + resId + '/projects';
               return $resource(getDahBoardProjectUrl,{},{
                   query: { method:'GET', isArray:false }
               });
            },
            fetchDashReportingCycle: function(userId,resId,projId){
               var getDahBoardProjectUrl = hostName + 'v1.0/users/' + userId +'/resources/' + resId + '/projects/' + projId + '/reportingcycles';

               return $resource(getDahBoardProjectUrl,{},{
                   query: { method:'GET', isArray:false }
               });
            },
            fetchDashTiles: function(userId, x, y){
               console.log(x,y);
               var getDahBoardProjectUrl = hostName + '/v1.0/reports/users/' + userId +'/activitySummaryTile?startDate=' + x + '&endDate=' + y;

               return $resource(getDahBoardProjectUrl,{},{
                   query: { method:'GET', isArray:false }
               });
            },
            fetchTimeRecordDetails: function(timId){

               var getDahBoardProjectUrl = hostName + '/v1.0/timesheets/' + timId + '/timesheetrecord';
               console.log(getDahBoardProjectUrl);
               return $resource(getDahBoardProjectUrl,{},{
                   query: { method:'GET', isArray:false }
               });
            },
            fetchExpRecordDetails: function(expId){
               var getDahBoardProjectUrl = hostName + '/v1.0/expenses/' + expId + '/expenserecord';
               return $resource(getDahBoardProjectUrl,{},{
                   query: { method:'GET', isArray:false }
               });
            },
            
            
            fetchResourceFilterTile: function(userId, x, y, resId){
               
               var getDahBoardProjectUrl = hostName + '/v1.0/reports/users/' + userId +'/activitySummaryTile?startDate=' + x + '&endDate=' + y + '&resourceId=' + resId;
               return $resource(getDahBoardProjectUrl,{},{
                   query: { method:'GET', isArray:false }
               });
            },

            fetchResourceFilterSummary: function(userId, x, y, resId){
               if(resId.length == 0){
                  var getDahBoardProjectUrl = hostName + '/v1.0/reports/users/' + userId +'/activitySummary?startDate=' + x + '&endDate=' + y;
               }else{
                  var getDahBoardProjectUrl = hostName + '/v1.0/reports/users/' + userId +'/activitySummary?startDate=' + x + '&endDate=' + y + '&resourceId=' + resId ;
               }

               console.log(getDahBoardProjectUrl);
               return $resource(getDahBoardProjectUrl,{},{
                   query: { method:'GET', isArray:false }
               });
            },

            fetchTimeAuditDetails: function(timId){

                var getDahBoardProjectUrl = hostName + '/v1.0/timesheetaudit/' + timId;
                console.log(getDahBoardProjectUrl);
                return $resource(getDahBoardProjectUrl,{},{
                    query: { method:'GET', isArray:false }
                });
             },
             
             fetchExpenseAuditDetails: function(expId){

                 var getDahBoardProjectUrl = hostName + '/v1.0/expenseaudit/' + expId;
                 console.log(getDahBoardProjectUrl);
                 return $resource(getDahBoardProjectUrl,{},{
                     query: { method:'GET', isArray:false }
                 });
              },
             
            fetchReport: function(userId, x, y, resId, reportCat,viewType, format){
               if(resId.length == 0){
                  var getDahBoardProjectUrl = hostName + '/v1.0/reports/users/' + userId + '/' + reportCat + '?repType=' + viewType + '&fileType=' + format + '&fromDate=' + x + '&toDate=' + y;
               }else{
                  var getDahBoardProjectUrl = hostName + '/v1.0/reports/users/' + userId + '/' + reportCat + '?repType=' + viewType + '&fileType=' + format + '&fromDate=' + x + '&toDate=' + y + '&resourceId=' + resId ;
               }
               $rootScope.reportUrl = getDahBoardProjectUrl;
               console.log(getDahBoardProjectUrl);
               return $resource(getDahBoardProjectUrl,{},{
                   query: { method:'GET', isArray:false }
               });
            }
        }
    }]);