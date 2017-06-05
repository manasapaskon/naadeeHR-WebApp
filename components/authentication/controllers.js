﻿'use strict';

angular.module('Authentication')

.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService','$window',
    function ($scope, $rootScope, $location, AuthenticationService,$window) {
    
        // reset login status
        AuthenticationService.clearCredentials();
        
        /*
         * Once the credentials are entered and login button is clicked from the login form available within 
         * /src/components/authentication/views package the controls comes to this file and the login() function 
         * gets executed and it internally makes the REST API calls by calling functions available in 
         * 'AuthenticationService’ for data retrieval and manipulation.
         */        
    	$scope.login = function () {
    		$scope.dataLoading = true;
    		
    		var credentials = new Object();
    		credentials.userName = $scope.username;
    		credentials.password = $scope.password;
    		
    		AuthenticationService.login().save(credentials,function(response) {
    			AuthenticationService.fetchRoles(response.userId).query(function(roleResponse){
    				AuthenticationService.setCredentials(credentials.userName, credentials.password, 
    						roleResponse.user.id,roleResponse.user.empId,roleResponse.user.name,roleResponse.user.roles);
    				$rootScope.name=roleResponse.user.name;
                    $rootScope.userid=roleResponse.user.id;
                    if(roleResponse.user.roles[0].name=="NOAH Approving Manager"){
                        $rootScope.org = response.approverOrganization;
                        $rootScope.busiPartner = response.approverBusinessPartner;
                    }else
                    {
                        $rootScope.org = response.organization;
                        $rootScope.busiPartner = response.businessPartner;
                    }
                    
                    console.log(response);
                    console.log(roleResponse.user.roles);
                    $rootScope.userRole=roleResponse.roles;
                    if(roleResponse.user.roles[0].name=='NOAH Employee'){
                        $location.path('/main/employee');
                    }else if(roleResponse.user.roles[0].name=='NOAH Approving Manager'){
                        $location.path('/main/dashboard');
                    }

    			},function(errResponse) {
    				$scope.error = "UnAuthorized";
    			});
    		},function(errResponse) {
    			errResponse.message = "Username or Password is incorrect"
    			$scope.error = errResponse.message;
    			$scope.dataLoading = false;
    		});
    	};


        $rootScope.logout = function(){
                AuthenticationService.clearCredentials();
                $location.path('/login');
                $window.location.reload();
                
        }
    
    }]);