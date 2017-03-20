(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.factory("AuthManager", AuthManager);

    /*@ngInject*/
    function AuthManager($http, $q) {

        var authApiFactory,
            loginRequest;

        loginRequest = {
            method: "POST",
            url: "/login",
            data: {}
        };

        authApiFactory = {
            authenticateUser: authenticate,
            isUserLoggedIn: false,
            accessToken: ""
        };

        function authenticate(user) {
            var req = angular.copy(loginRequest);

            if (!!user) {
                req.data.username = user.username;
                req.data.password = user.password;

                return $http(req).then(function (response) {

                    if (response.data.access_token) {
                        authApiFactory.isUserLoggedIn = true;
                        authApiFactory.accessToken = access_token;

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

        return authApiFactory;
    }

})();
