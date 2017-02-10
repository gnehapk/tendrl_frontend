(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createRBDController", createRBDController);

    /*@ngInject*/
    function createRBDController($scope, $state, utils, $rootScope) {
        var vm = this,
            selectedPool,
            poolList;

        vm.step = 1;
        vm.updateStep = updateStep;
        vm.updateRBDName = updateRBDName;
        vm.isSizeGreater = isSizeGreater;
        vm.sizeUnits = ["GB", "TB"];

        //default values
        vm.backingPool = "existing";
        vm.rbdName = "MyBlockDevice";
        vm.rbdCount = 3;
        vm.targetSize = 128;
        vm.taskSubmitted = false;

        init();

        function isSizeGreater() {
            
            if(vm.selectedCluster.unit !== vm.selectedUnit) {
                
                if (vm.selectedCluster.unit === "TB" && vm.selectedUnit === "GB") {
                    return (vm.targetSize * vm.rbdCount > vm.selectedCluster.unit * 1024);
                } else if(vm.selectedCluster.unit === "GB" && vm.selectedUnit === "TB") {
                    return (vm.targetSize * vm.rbdCount * 1024 > vm.selectedCluster.unit);
                }
            } else {
                return vm.targetSize * vm.rbdCount > vm.selectedCluster.size;
            }
        }

        function updateStep(step) {

            if (step === "inc") {
                
                if(vm.step === 3) {
                    vm.taskSubmitted = true;
                }
                vm.step += 1;
            
            } else if (step === "dec") {
                vm.step -= 1;
            }
        }

        function updateRBDName() {
            var i;

            vm.rbdNames = [];

            for (i = 0; i < vm.rbdCount; i++) {
                vm.rbdNames.push("MyBlockDevice" + (i + 1));
            }
        }

        function init() {

            if (typeof $rootScope.clusterData !== "undefined") {
                vm.clusterList = $rootScope.clusterData.clusters;
                poolList = utils.getPoolDetails();
                _createPoolList(poolList);
            } else {
                utils.getObjectList("Cluster")
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        vm.clusterList = $rootScope.clusterData.clusters;
                        poolList = utils.getPoolDetails();
                        _createPoolList(poolList);
                    });
            }

            vm.selectedCluster = vm.clusterList[0];
            vm.selectedUnit = vm.sizeUnits[0];
            vm.selectedPool = vm.poolList[0];
            vm.updateRBDName();
            
            //TODO- remove once API provide it
            vm.selectedCluster.size = 6;
            vm.selectedCluster.unit = "TB";
        }

        function _createPoolList(list) {

            var len = list.length,
                poolList = [],
                pool,
                i;

            for (i = 0; i < len; i++) {
                pool = {};
                pool.name = list[i].pool_name;
                pool.clusterId = list[i].cluster_id;
                pool.pgCount = list[i].pg_num;
                pool.replicaCount = list[i].replica_count;
                pool.osdCount = list[i].osd_count;
                pool.quotas = list[i].quotas;
                pool.conf = list[i].conf;

                poolList.push(pool);
            }

            vm.poolList = poolList;
        }
    }

})();
