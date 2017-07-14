/*
    ============= How to use "hasPermission" component ======

*/
(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("hasPermissionController", hasPermissionController);

    app.component("hasPermission", {
        bindings: {
            role: "="
        },
        controllerAs: "vm",
        controller: "hasPermissionController"
    });

    /*@ngInject*/
    function hasPermissionController($scope, $element, attrs) {
        var vm = this;


        vm.$postLink = function() {
            var value, notPermissionFlag;

            // if (!_.isString(attrs.hasPermission)) {
            //     throw "hasPermission value must be a string";
            // }
            value = vm.role.trim();
            notPermissionFlag = value[0] === "!";
            if (notPermissionFlag) {
                value = value.slice(1).trim();
            }

            function toggleVisibilityBasedOnPermission() {
                var hasPermission = permissions.hasPermission(value);
                if (hasPermission && !notPermissionFlag || !hasPermission && notPermissionFlag) {
                    element[0].style.display = "block";
                } else {
                    element[0].style.display = "none";
                }
            }

            toggleVisibilityBasedOnPermission();

            $scope.$watch("role", function() {
                // code
                toggleVisibilityBasedOnPermission();
            }, true);
        };
    }

}());
