(function() {
    "use strict";

    angular.module("TendrlModule")
        .service("userStore", userStore);

    /*@ngInject*/
    function userStore($state, $q, userFactory) {
        var store = this;

        store.getUserDetails = function() {
            var deferred;

            deferred = $q.defer();
            userFactory.getUserDetails()
                .then(function(data) {
                    _setUserDetails(data);
                    deferred.resolve(data);
                });

            return deferred.promise;

            function _setUserDetails(data) {
                localStorage.setItem("userRole", data.role);
            }
        };

        store.clearUserRole = function() {
            localStorage.clear("userRole");
        };

        store.getUserRole = function() {
            return localStorage.getItem("userRole");
        };
    }

})();
