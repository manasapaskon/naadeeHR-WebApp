/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */
'use strict';

function Board(name, numberOfColumns) {
    return {
        name: name,
        numberOfColumns: numberOfColumns,
        columns: [],
        rejectReasons: [],
        notifications: [],
        backlogs: []
    };
}

function Column(name) {
    return {
        name: name,
        documents: [],
        projects: [],
        categories: [],
        resources: [],
        reportingCycles: [],
        projectsforRejectReason: []

    };
}

function RejectReason(id) {
    return {
        id: id,
        rejectReason: []
    };
}


function rejectReasonCard(rejectReasonId,rejectCode,type,rejectReason) {
	this.rejectReasonId = rejectReasonId;
	this.rejectCode = rejectCode;
	this.type = type;
	this.rejectReason = rejectReason;
	return this;
}




function docCard(orgId,projectId, projectName, empId, empFirstName, empLastName, empName, depName,
    userId, type, id, codeId, code, title, billable, value, status, state, valuePrefix, valueSuffix, startDate, endDate,reportCycle,rejectReasonName,rejectReasonNote) {
	this.orgId = orgId;
    this.projectId = projectId;
    this.projectName = projectName;
    this.empId = empId;
    this.empFirstName = empFirstName;
    this.empLastName = empLastName;
    this.empName = empName;
    this.depName = depName;
    this.userId = userId;
    this.type = type;
    this.id = id;
    this.codeId = codeId;
    this.code = code;
    this.title = title;
    this.billable = billable;
    this.value = value;
    this.status = status;
    this.state = state;
    this.valuePrefix = valuePrefix;
    this.valueSuffix = valueSuffix;
    this.startDate = startDate.slice(0,10);
    this.endDate = endDate.slice(0,10);
    this.reportCycle = reportCycle;
    this.rejectReasonName = rejectReasonName;
    this.rejectReasonNote = rejectReasonNote;
    return this;
}
