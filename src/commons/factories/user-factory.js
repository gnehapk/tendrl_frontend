(function() {
    "use strict";

    angular.module("TendrlModule")
        .service("userFactory", userFactory);

    /*@ngInject*/
    function userFactory($state, $q, $http, utils, config) {
        var vm = this;

        vm.getUserDetails = function(userId) {
            var url, request, getUserDetailsRequest;

            //url = config.baseUrl + "user/current";
            url = "/api/GetUserDetails.json";

            getUserDetailsRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getUserDetailsRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
            });
        };

    }

})();
