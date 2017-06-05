﻿'use strict';

angular.module('Authentication')

.controller('RegController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService',
    function ($scope, $rootScope, $location, AuthenticationService) {
    	
        // reset login status
        AuthenticationService.clearCredentials();
        
    	$scope.login = function () {
    		$scope.dataLoading = true;
    		
    		var credentials = new Object();
    		credentials.userName = $scope.username;
    		credentials.password = $scope.password;
    		
    		AuthenticationService.login().save(credentials,function(response) {
    			AuthenticationService.fetchRoles(response.userId).query(function(roleResponse){
    				AuthenticationService.setCredentials(credentials.userName, credentials.password, 
    						roleResponse.user.id,roleResponse.user.empId,roleResponse.user.name,roleResponse.user.roles);
    				$location.path('/main/dashboard');
    			},function(errResponse) {
    				$scope.error = "UnAuthorized";
    			});
    		},function(errResponse) {
    			errResponse.message = "Username or Password is incorrect"
    			$scope.error = errResponse.message;
    			$scope.dataLoading = false;
    		});
    	};
    }]);