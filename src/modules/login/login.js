(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("LoginController", LoginController);

    /*@ngInject*/
    function LoginController($scope, $window, $location, $state, $rootScope, AuthManager, userStore, menuService) {

        /* Controller instance */
        var vm = this;
        $rootScope.isAPINotFoundError = false;

        if(AuthManager.isUserLoggedIn){
            $state.go("landing-page")
        }

        vm.user = {};
        vm.showPassword = "password";
        vm.errorMsg = "";
        vm.login = login;

        function login() {

            vm.formSubmitInProgress = true;

            if (validateUiFields()) {

                AuthManager.authenticateUser(vm.user)
                .then(function (data) {
                    AuthManager.isUserLoggedIn = true;
                    AuthManager.setAuthHeader();
                })
                .catch(function(){
                    AuthManager.isUserLoggedIn = false;
                    vm.errorMsg = "The username or password you entered does not match our records. Please try again.";
                    vm.user.password = "";
                })
                .then(function() {
                    return userStore.getUserDetails();
                })
                .catch(function() {
                    console.log("error in getting user details");
                })
                .then(function () {
                    menuService.setMenus();
                    $state.go("landing-page");
                })
                .finally(function () {
                    vm.formSubmitInProgress = false;
                });
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
