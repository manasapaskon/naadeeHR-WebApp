/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

  
'use strict';

angular.module('demoApp').factory('BoardManipulator', function () {
  return {

    addColumn: function (board, columnName) {
      board.columns.push(new Column(columnName)); 
    },
    
    adddocCardToColumn: function (board, columnName, orgId,projectId,projectName,empId,empFirstName,empLastName,empName,depName,
        userId,type,id,codeId,code,title,billable,value,status,state,valuePrefix,velueSuffix,startDate,endDate,reportCycle,rejectReasonName,rejectReasonNote) {
        angular.forEach(board.columns, function (col) {
          if (col.name === columnName) {
            col.documents.push(new docCard(orgId,projectId,projectName,empId,empFirstName,empLastName,empName,depName,
                userId,type,id,codeId,code,title,billable,value,status,state,valuePrefix,velueSuffix,startDate,endDate,reportCycle,rejectReasonName,rejectReasonNote));
            
          //push projects
          if (col.projects.indexOf(projectName) == -1) {
            col.projects.push(projectName);
            
            //push projects along with project id
              var projIdAndProjectName = {};
              projIdAndProjectName.Id = projectId;
              projIdAndProjectName.Name = projectName;
              col.projectsforRejectReason.push(projIdAndProjectName);
          }
          
          //push categories
          if (col.categories.indexOf(title) == -1) {
             col.categories.push(title);
          }
          
          //push employees
          if (col.resources.indexOf(empName) == -1) {
              col.resources.push(empName);
          }

          //push reportingCycles 
          var reportingCyclesList = {};
          reportingCyclesList.reportCycle = reportCycle;
          col.reportingCycles.push(reportingCyclesList)
          }   

        });        
      },
      
      addProject: function (board, projectId) {
          board.rejectReasons.push(new RejectReason(projectId)); 
        },
        
      addToRejectReasonArray: function(board,projectId,rejectReasonId,rejectCode,type,rejectReason) {
        angular.forEach(board.rejectReasons, function(projId){
          if(projId.id === projectId) {
            projId.rejectReason.push(new rejectReasonCard(rejectReasonId,rejectCode,type,rejectReason));
          }
        });
      },
      
      addAlertType: function(board,data) {
    	  board.notifications.push(data);
      }
  };
});
