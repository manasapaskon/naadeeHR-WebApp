 /*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('demoApp').service('EmpBoardService', ['$uibModal', 'BoardManipulator', function ($uibModal, BoardManipulator) {

  return {
    kanbanBoard: function (board) {
      var kanbanBoard = new Board("Employee Board", 2);
      BoardManipulator.addColumn(kanbanBoard,"Draft");
      BoardManipulator.addColumn(kanbanBoard,"Submit");
      angular.forEach(board.documents, function (card) {
        if((card.status === "Saved" && card.state === "Open") || (card.status === "Rejected" && card.state=="In Progress") || (card.status === "Rejected" && card.state=="Open")) {
          
          BoardManipulator.adddocCardToColumn(kanbanBoard,"Draft",card.orgId,card.projectId,card.projectName,card.empId,
              card.empFirstName,card.empLastName,card.empName,card.depName,card.userId,card.type,card.id,card.codeId,
              card.code,card.title,card.billable,card.value,card.status,card.state,card.valuePrefix,
              card.valueSuffix,card.startDate,card.endDate,card.reportCycle,card.rejectReasonName,card.rejectReasonNote);
          }
        });
      return kanbanBoard;
    },
    allKanbanBoard: function (board) {
        var kanbanBoard = new Board("Employee Board", 1);
        BoardManipulator.addColumn(kanbanBoard,"AllRecords");
        angular.forEach(board.documents, function (card) {
          if((card.status === "Saved") || (card.status === "Submitted") || (card.status === "Rejected" )|| (card.status === "Approved_Int") || (card.status === "Approved")) {
            
            BoardManipulator.adddocCardToColumn(kanbanBoard,"AllRecords",card.orgId,card.projectId,card.projectName,card.empId,
                card.empFirstName,card.empLastName,card.empName,card.depName,card.userId,card.type,card.id,card.codeId,
                card.code,card.title,card.billable,card.value,card.status,card.state,card.valuePrefix,
                card.valueSuffix,card.startDate,card.endDate,card.reportCycle,card.rejectReasonName,card.rejectReasonNote);
            }
          });
        return kanbanBoard;
      },
      allDocuments: function (board) {
        var kanbanBoard = new Board("Employee Board", 1);
        BoardManipulator.addColumn(kanbanBoard,"AllDocuments");
        angular.forEach(board.documents, function (card) {
          if((card.status === "Submitted") || (card.status === "Approved_Int") || (card.status === "Approved_Final")) {
            
            BoardManipulator.adddocCardToColumn(kanbanBoard,"AllDocuments",card.orgId,card.projectId,card.projectName,card.empId,
                card.empFirstName,card.empLastName,card.empName,card.depName,card.userId,card.type,card.id,card.codeId,
                card.code,card.title,card.billable,card.value,card.status,card.state,card.valuePrefix,
                card.valueSuffix,card.startDate,card.endDate,card.reportCycle,card.rejectReasonName,card.rejectReasonNote);
            }
          });
        return kanbanBoard;
      },
    createNotifications: function(board,data) {
      BoardManipulator.addAlertType(board,data);
    }
  };
}]);

//  || card.status === "Rejected")


