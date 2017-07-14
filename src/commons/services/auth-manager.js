(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.factory("AuthManager", AuthManager);

    /*@ngInject*/
    function AuthManager($http, $q, $state, $rootScope, config, $timeout) {

        var authApiFactory;

        function create_request(request_type, endpoint){
            return {
                method: request_type,
                url: config.baseUrl + endpoint,
                data: {}
            }
        }

        authApiFactory = {
            authenticateUser: authenticate,
            isUserLoggedIn: false,
            globalUser: globalUser(),
            getUserInfo: getUserInfo,
            clearCredentials: clearCredentials,
            setFlags: setFlags,
            logout: logout,
            setAuthHeader: setAuthHeader,
            handleUnauthApi: handleUnauthApi
        };

        function setAuthHeader(){
            $http.defaults.headers.common["Authorization"] = "Bearer "  + JSON.parse(localStorage.getItem("userInfo")).accessToken;
        }

        function globalUser(){
            return {
                "username": null,
                "accessToken": null
            };
        }

        function setUserInfo(user, accesstoken, role){
            authApiFactory.globalUser.username = user.username;
            authApiFactory.globalUser.accessToken = accesstoken;
            authApiFactory.globalUser.role = role;
            localStorage.setItem("userInfo", JSON.stringify(authApiFactory.globalUser));
            $rootScope.$broadcast("PermissionsChanged", role);
        }

        function getUserInfo(){
            return JSON.parse(localStorage.getItem("userInfo"));
        }

        function clearCredentials(){
            authApiFactory.globalUser.username = null;
            authApiFactory.globalUser.accessToken = null;
            localStorage.clear("userInfo");
            authApiFactory.isUserLoggedIn = false;
        }

        function setFlags(){
            $rootScope.isNavigationShow = false;
            $rootScope.isHeaderShow =  false;
            $rootScope.isAPINotFoundError = false;
        }

        function logout() {
            authApiFactory.clearCredentials();
            var req = create_request("DELETE", "logout");
            return $http(req).then(function (response) {
                $http.defaults.headers.common["Authorization"] = "";
                $rootScope.$broadcast("UserLogsOut");
                return response.data;
            })
            .catch(function (response) {
                authApiFactory.clearCredentials();
                authApiFactory.setFlags();
                $state.go("login");
                return $q.reject({});
            });
        }


        function authenticate(user) {
            var req = create_request("POST", "login");

            if (!!user) {
                req.data.username = user.username;
                req.data.password = user.password;

                return $http(req).then(function (response) {

                    if (response.data.access_token) {
                        setUserInfo(user,response.data.access_token, data.role);
                        return response.data;
                    } else {
                        return $q.reject({});
                    }

                })
                .catch(function (response) {
                    return $q.reject({});
                });
            }
        }

        function handleUnauthApi(){
            authApiFactory.clearCredentials();
            authApiFactory.setFlags();
            $state.go("login");
        }

        return authApiFactory;
    }

})();
