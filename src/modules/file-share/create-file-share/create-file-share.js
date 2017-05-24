(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("CreateFileShareController", CreateFileShareController);

    /*@ngInject*/
    function CreateFileShareController($scope, $rootScope, $state, utils, $uibModal, nodeStore) {
        var vm = this;

        // vm.onCreateBrickModal = onCreateBrickModal;

        // function onCreateBrickModal(clusterData) {
        //     var wizardDoneListener,
        //         modalInstance,
        //         closeWizard;

        //     modalInstance = $uibModal.open({
        //         animation: true,
        //         backdrop: "static",
        //         templateUrl: "/modules/bricks/create-brick/create-brick.html",
        //         controller: "CreateBrickModalController",
        //         controllerAs: "vm",
        //         size: "lg",
        //         resolve : {
        //             clusterData: function() {
        //                 return clusterData;
        //             }
        //         }
        //     });

        //     closeWizard = function(e, reason) {
        //         modalInstance.dismiss(reason);
        //         wizardDoneListener();
        //     };

        //     modalInstance.result.then(function() {}, function() {});

        //     wizardDoneListener = $rootScope.$on("modal.done", closeWizard);
        // }
        vm.hostDetails = [];
        vm.brickList = [];
        vm.brickDetails = [];
        vm.replicaCount = 2;
        vm.distributionCount = 3;
        vm.selectedStep = 3;

        vm.expandList = expandList;
        vm.getBrickPath = getBrickPath;

        init();

        function init() {
            nodeStore.getNodeList()
                .then(function(data) {
                    vm.hostList = data;
                    _createHostDetails();
                    _createBrickList();
                    _createBucketList();
                });
        }

        function expandList(item) {
            if (item.isExpanded) {
                item.isExpanded = false;
            } else {
                item.isExpanded = true;
            }
        }

        function getBrickPath(brick) {
            return Object.values(brick)[0];
        }

        function _createBucketList() {
            var n = 0,
                i,
                j,
                bucket;

            for (i = 0; i < vm.distributionCount; i++) {
                bucket = [];

                for ( j = 0; j < vm.replicaCount; j++) {
                    bucket.push(vm.brickList[n]);
                    n += 1;
                }
                vm.brickDetails.push({bricks: bucket});
            }

            console.log(vm.brickDetails, "brickDetails");

        }

        function _createBrickList() {
            var hostLen = vm.hostDetails.length,
                brickLen,
                i,
                j = 0,
                fails = 0,
                ip;

            while(1) {
                fails = 0;
                for ( i = 0; i < hostLen; i++) {
                    ip = Object.keys(vm.hostDetails[i])[0];
                    brickLen = vm.hostDetails[i][ip].length;

                    if(j < brickLen) {
                        vm.brickList.push({[ip]: vm.hostDetails[i][ip][j]});
                    } else {
                        fails +=1;
                    }
                }

                if(fails >= hostLen)
                    break;

                j += 1;
            }

            console.log(vm.brickList, "brickList");

        }

        function _createHostDetails() {
            var keys = Object.keys(vm.clusterNodes.nodes),
                len = keys.length,
                ip,
                temp,
                i;

            for( i = 0; i < len; i++) {
                temp = {};
                ip = _getNodeIP(keys[i]);
                temp[ip] = vm.clusterNodes.nodes[keys[i]].bricks.free ? vm.clusterNodes.nodes[keys[i]].bricks.free : [];
                vm.hostDetails.push(temp);
            }

            console.log(vm.hostDetails, "hostDetails");

        }

        function _getNodeIP(nodeId) {
            var len = vm.hostList.length,
                netkeys,
                i;

            for( i = 0 ; i < len; i++) {
                if(vm.hostList[i].node_id === nodeId) {
                    netkeys =  Object.keys(vm.hostList[i].networks);
                    return JSON.parse(vm.hostList[i].networks[netkeys[0]].ipv4)[0];
                }
            }
        }



        vm.clusterNodes = {
            "nodes": {
                "68b8df12-819b-48af-9ec3-942e293daece": {
                    "hash": "11a0d39b4b375806398dca8bad5cc291",
                    "tags": "[\"detected_cluster/3f7df67e2f5f4f59156c2a6f6f152378d4abe99ff3809c4584f946b8aeddb619\", \"tendrl/integration/gluster\", \"tendrl/integration/daa4f683-6559-4168-b16a-3a4fc374ea2b\", \"gluster/server\", \"tendrl/node\"]",
                    "fqdn": "dhcp43-191.lab.eng.blr.redhat.com",
                    "updated_at": "2017-05-23 14:50:44.311158+00:00",
                    "node_id": "68b8df12-819b-48af-9ec3-942e293daece",
                    "machine_id": "0e2055ede9444fff9304a7b6b17c8b11",
                    "status": "UP",
                    "bricks": {
                        "free": ["dhcp43-191.lab.eng.blr.redhat.com:_tendrl_gluster_bricks_mybrick1_mount_mybrick1", "dhcp43-191.lab.eng.blr.redhat.com:_tendrl_gluster_bricks_mybrick2_mount_mybrick2"]
                    }
                },
                "bd53fd82-9b36-4c53-b946-95b558b522e9": {
                    "hash": "9b85c13a94a356928fc4d250da701c33",
                    "tags": "[\"tendrl/integration/gluster\", \"tendrl/integration/daa4f683-6559-4168-b16a-3a4fc374ea2b\", \"gluster/server\", \"detected_cluster/3f7df67e2f5f4f59156c2a6f6f152378d4abe99ff3809c4584f946b8aeddb619\", \"provisioner/gluster\", \"tendrl/node\"]",
                    "fqdn": "dhcp41-222.lab.eng.blr.redhat.com",
                    "updated_at": "2017-05-23 14:50:59.713346+00:00",
                    "node_id": "bd53fd82-9b36-4c53-b946-95b558b522e9",
                    "machine_id": "1f294a997080422c9930a07843e0f352",
                    "status": "UP",
                    "bricks": {
                        "free": ["dhcp43-191.lab.eng.blr.redhat.com:_tendrl_gluster_bricks_mybrick1_mount_mybrick1", "dhcp43-191.lab.eng.blr.redhat.com:_tendrl_gluster_bricks_mybrick2_mount_mybrick2"]
                    }
                },
                "85909e65-eb2d-46f3-9476-b47cd23d62b8": {
                    "node_id": "85909e65-eb2d-46f3-9476-b47cd23d62b8",
                    "machine_id": "f4aede5a660445cd924740eb6473b4a9",
                    "status": "UP",
                    "hash": "052223018db5a6d57e931224b4c36cd4",
                    "tags": "[\"tendrl/integration/gluster\", \"tendrl/integration/daa4f683-6559-4168-b16a-3a4fc374ea2b\", \"provisioner/daa4f683-6559-4168-b16a-3a4fc374ea2b\", \"gluster/server\", \"detected_cluster/3f7df67e2f5f4f59156c2a6f6f152378d4abe99ff3809c4584f946b8aeddb619\", \"tendrl/node\"]",
                    "fqdn": "dhcp41-223.lab.eng.blr.redhat.com",
                    "updated_at": "2017-05-23 14:51:10.283336+00:00",
                    "bricks": {
                        "free": ["dhcp41-223.lab.eng.blr.redhat.com:_tendrl_gluster_bricks_mybrick2_mount_mybrick2", "dhcp41-223.lab.eng.blr.redhat.com:_tendrl_gluster_bricks_mybrick1_mount_mybrick1"]
                    }
                }
            }
        }


    }

})();
