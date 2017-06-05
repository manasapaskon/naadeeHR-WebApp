﻿'use strict';

/*
 * This class contains a factory method which is responsible for creating and returning an object that can be used to work
 * with data, validate business rules, or perform a variety of other tasks. Angular factories are singletons by default so 
 * the object returned by a factory is re-used by the application. In this application this file handles GET, PUT, POST, and 
 * DELETE calls to the NOAH-TEX API service for authentication only. The factory creates an object that handles making calls 
 * to the server.
 */
 angular.module('Authentication').factory('AuthenticationService',
    ['$http','Base64','$cookieStore', '$rootScope', '$timeout','$resource',
    function ($http,Base64,$cookieStore, $rootScope, $timeout,$resource) {
    	
    	var hostName = 'http://dev.app-hr.paskon.com:8080/dev-naadee-hr-tex/';
    	     
             /* 
             * This function is a POST method which gets called whenever a user tries to login to a noah web-app application.
             */

    	return {
    		
    		login: function() {
    			var loginUrl = hostName+'authenticate.ob';
    			return $resource(loginUrl,{},{
    				save: {method:'POST', isArray: false, headers: {'Content-Type': 'application/json; charset=utf-8'} }
    			});
    		},
            
            /* 
             * After the login process is successful we are setting the username, password, userId, empId, name, roles in 
             * $cookieStore so that these values can be accessed anywhere in the entire application as and where required. 
             * Username and password passed are encoded as Base64 and the generated encoded string is passed as a value to 
             * ‘Authorization’ header.
             */		

    		setCredentials: function(username, password, userId, empId, name, roles){
    			var authdata = Base64.encode(username + ':' + password);
    			$rootScope.globals = {
    					currentUser: {
    						userId: userId,
    						name: name,
    						empId: empId,
    						roles: roles,
    	                    username: username,
    	                    authdata: authdata
    	                }
    	            };
    			$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
    			$cookieStore.put('globals', $rootScope.globals);
    		},

            /* 
             * After the authentication is successful we are fetching all the role list to which user is assigned based 
             * on the userId which is passed as a path variable in the url.
             */
    		fetchRoles: function(userId) {
    			var userRolesUrl = hostName + 'users/' + userId + '.ob';
    			return $resource(userRolesUrl,{},{
    				query: { method:'GET', isArray:false }
    			});
    		},

            /* 
             * This function is called when a user logout from an app successfully then its credentials needs to be cleared 
             * from the $cookieStore and also the authdata from ‘Authorization’ header.
             */  		
    		clearCredentials: function() {
    			$rootScope.globals = {};
    	        $cookieStore.remove('globals');
    	        $http.defaults.headers.common.Authorization = 'Basic';
    		}
    	};
    }]);

/* 
 * This factory method returns me the Base64 encoded and decoded string
 */
angular.module('Authentication').factory('Base64', function () {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);
            return output;
        }
    };
});

