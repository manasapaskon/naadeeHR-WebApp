 /*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('demoApp').service('BoardService', ['$uibModal', 'BoardManipulator', function ($uibModal, BoardManipulator) {

  return {
    kanbanBoard: function (board) {
      var kanbanBoard = new Board("Approval Board", 3);
      
      BoardManipulator.addColumn(kanbanBoard,"Pending");
      BoardManipulator.addColumn(kanbanBoard,"Approve");
      BoardManipulator.addColumn(kanbanBoard,"Reject");
      // console.log("BD"+board.documents);
      angular.forEach(board.documents, function (card) {
        
        
        if((card.status === "Submitted" && card.state === "Open") || 
            (card.status === "Approved_Int" && card.state === "In Progress")) {
          
          BoardManipulator.adddocCardToColumn(kanbanBoard,"Pending",card.orgId,card.projectId,card.projectName,card.empId,
              card.empFirstName,card.empLastName,card.empName,card.depName,card.userId,card.type,card.id,card.codeId,
              card.code,card.title,card.billable,card.value,card.status,card.state,card.valuePrefix,
              card.valueSuffix,card.startDate,card.endDate,card.reportCycle);
          }
        });
      return kanbanBoard;
    },

    resetKanbanBoard: function(){
            BoardManipulator.adddocCardToColumn(kanbanBoard,"Reject",card.orgId,card.projectId,card.projectName,card.empId,
              card.empFirstName,card.empLastName,card.empName,card.depName,card.userId,card.type,card.id,card.codeId,
              card.code,card.title,card.billable,card.value,card.status,card.state,card.valuePrefix,
              card.valueSuffix,card.startDate,card.endDate,card.reportCycle);
    },

    // kanbanBoard: function (board) {
    //   var kanbanBoard = new Board("Approval Board", 3);
      
    //   BoardManipulator.addColumn(kanbanBoard,"Pending");
    //   BoardManipulator.addColumn(kanbanBoard,"Approve");
    //   BoardManipulator.addColumn(kanbanBoard,"Reject");
    //   // console.log("BD"+board.documents);
    //   angular.forEach(board.documents, function (card) {
        
        
    //     if((card.status === "Submitted" && card.state === "Open") || 
    //         (card.status === "Approved_Int" && card.state === "In Progress")) {
          
    //       BoardManipulator.adddocCardToColumn(kanbanBoard,"Pending",card.orgId,card.projectId,card.projectName,card.empId,
    //           card.empFirstName,card.empLastName,card.empName,card.depName,card.userId,card.type,card.id,card.codeId,
    //           card.code,card.title,card.billable,card.value,card.status,card.state,card.valuePrefix,
    //           card.valueSuffix,card.startDate,card.endDate,card.reportCycle);
    //       }
    //     });
    //   return kanbanBoard;
    // },

  kanbanGroupBoard: function (board) {
      var kanbanGroupBoard = new Board("Approval Board", 10);
        angular.forEach($scope.kanbanBoard.columns, function(column) {
          angular.forEach(column.documents, function(card){
             BoardManipulator.addColumn(kanbanGroupBoard,card.projectName);
          });

        });

      angular.forEach(board.documents, function (card) {
        
        
        if((card.status === "Submitted" && card.state === "Open") || 
            (card.status === "Approved_Int" && card.state === "In Progress")) {
          
          BoardManipulator.adddocCardToColumn(kanbanGroupBoard,"Pending",card.orgId,card.projectId,card.projectName,card.empId,
              card.empFirstName,card.empLastName,card.empName,card.depName,card.userId,card.type,card.id,card.codeId,
              card.code,card.title,card.billable,card.value,card.status,card.state,card.valuePrefix,
              card.valueSuffix,card.startDate,card.endDate,card.reportCycle);
          }
        });
      return kanbanGroupBoard;
    },
    
    rejectReason: function(board,projectId) {
      BoardManipulator.addProject(board, projectId);
      return board;
    },
    
    rejectCards: function(board,projectId,data) {
      console.log(data);
      angular.forEach(data.rejectReasons, function(rejectList) {
        BoardManipulator.addToRejectReasonArray(board, projectId, rejectList.id, rejectList.rejectCode, 
            rejectList.type, rejectList.rejectReason);
      });
      return board;
    },
    
    createNotifications: function(board,data) {
    	BoardManipulator.addAlertType(board,data);
    }
  };
}]);



