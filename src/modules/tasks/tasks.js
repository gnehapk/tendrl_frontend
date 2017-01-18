(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("taskController", taskController);

    /*@ngInject*/
    function taskController($rootScope, $scope, $interval, utils, config) {

        var vm = this,
            timer;

        $rootScope.isNavigationShow = true;
        vm.isDataLoading = true;

        init();

        function init() {
            utils.getTaskDetails()
                .then(function(data) {
                    vm.taskDetails = data;
                    vm.isDataLoading = false;                    

                    utils.getTaskLogs("all")
                        .then(function(data) {

                            if(typeof vm.taskDetails !== "undefined") {
                                vm.taskDetails.logs = data.logs;
                            }
                        });
                });
        }

        timer = $interval(function () {
            init();
        }, 1000 * config.logsRefreshIntervalTime );

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });

    }

})();
