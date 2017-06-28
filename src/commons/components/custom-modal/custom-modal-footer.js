(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("customModalFooterController", customModalFooterController);

    app.component("customModalFooter", {
        bindings: {
            modalFooter: "="
        },
        controllerAs: "vm",
        controller: "customModalFooterController",
        templateUrl: "/commons/components/custom-modal/custom-modal-footer.html"
    });

    function customModalFooterController($element, $scope) {
        var vm = this,
            len = vm.modalFooter.length,
            i;

        // for( i = 0; i < len; i++) {
        //     if(vm.modalFooter[i].disable) {
        //         $scope.$watch(vm.modalFooter[i].disable, function() {

        //         });
        //     }
        // }

        console.log($scope.modalFooter, vm);
    };
}());
