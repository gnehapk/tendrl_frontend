(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("LoginController", LoginController);

    /*@ngInject*/
    function LoginController($scope, $window, $location, $state, AuthManager) {

        /* Controller instance */
        var vm = this;

        vm.user = {};
        vm.emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i;
        vm.showPassword = "password";
        vm.errorMsg = "";

        vm.login = function () {

            vm.formSubmitInProgress = true;

            if (validateUiFields()) {

                // AuthManager.authenticateUser(vm.user)
                //     .then(function (data) {
                //         vm.isLoggedIn = true;
                //     })
                //     .then(function () {
                //         $state.go("landing-page");
                //     })
                //     .catch(function () {
                //         vm.isLoggedIn = false;
                //         vm.user.password = "";
                //         vm.invalidFormMessage = "The email address or password you entered does not match our records. Please try again.";
                //     })
                //     .finally(function () {
                //         vm.formSubmitInProgress = false;
                //     });

                if(vm.user.username === "test" && vm.user.password === "test") {
                    AuthManager.isUserLoggedIn = true;
                    $state.go("landing-page");
                    vm.formSubmitInProgress = false;
                } else {
                    AuthManager.isUserLoggedIn = false;
                    vm.user.password = "";
                    vm.errorMsg = "The email address or password you entered does not match our records. Please try again.";  
                }
            } else {
                vm.formSubmitInProgress = false;
            }
        };

        function validateUiFields() {
            var isFormValid = true,
                form = vm.signInForm;

            if (form.username.$invalid) {
                vm.invalidFormMessage = "Please specify valid email id.";
                isFormValid = false;
            } else if (form.password.$invalid) {
                vm.invalidFormMessage = "Please specify valid password.";
                isFormValid = false;
            }

            return isFormValid;

        }

    }

})();
