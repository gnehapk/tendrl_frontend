(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("utils", utils);

    /*@ngInject*/
    function utils($http, config, $rootScope) {

        /* Cache the reference to this pointer */
        var vm = this,
            volumeList,
            hostList,
            poolList,
            i, 
            index, 
            key, 
            clusterData, 
            len, 
            clusterOb,
            j;


        vm.takeAction = function(data, postUrl, formMethod, clusterId) {
            var url, actionRequest, request;

            /* TODO:- Need to find out the proper way for DELETE Request */
            if (formMethod === "DELETE") {
                data._method = formMethod;
            }

            if (clusterId === undefined || clusterId === "") {
                url = config.baseUrl + postUrl;
            } else {
                url = config.baseUrl + clusterId + "/" + postUrl;
            }

            actionRequest = {
                method: "POST",
                url: url,
                data: data
            };

            request = angular.copy(actionRequest);

            return $http(request).then(function (response) {
                return response.data;
            });
        };

        /* For object workflow service */
        vm.getObjectWorkflows = function(clusterId) {
            var url, objectWorkflowsRequest, request;

            if (clusterId === undefined || clusterId === "") {
                url = config.baseUrl + "Flows";
            } else {
                url = config.baseUrl + clusterId + "/Flows";
            }

            objectWorkflowsRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(objectWorkflowsRequest);
            return $http(request).then(function (response) {
                return response.data;
            }, function() {
                console.log("Error Occurred: while fetching getObjectWorkflows");
                return null;
            }); 
        };

        vm.getObjectList= function(objectType, clusterId) {
            var url = "", getObjectListRequest, request;

            //will comment out once API is available
            // if (clusterId === undefined || clusterId === "") {
            //     url = config.baseUrl + "Get" + objectType +"List";
            // }

            //url = config.baseUrl + "Get" + objectType +"List";
            url = "/api/GetClusterList.json";

            getObjectListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getObjectListRequest);
            return $http(request).then(function (response) {
                return response.data;
            }, function() {
                console.log("Error Occurred: while fetching getObjectList");
                return null;
            });
        };

        vm.importCluster = function(uri, data) {
            var url, actionRequest, request;

            url = config.baseUrl + uri;

            actionRequest = {
                method: "POST",
                url: url,
                data: data
            };
            request = angular.copy(actionRequest);

            return $http(request).then(function (response) {
                return response.data;
            });
        };

        vm.getClusterDetails = function(clusterId) {
            clusterObj = {};

            if($rootScope.clusterData !== null && typeof clusterId !== "undefined") {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;

                for ( i = 0; i < len; i++ ) {

                    if(clusterData[i].cluster_id === clusterId) {
                        clusterObj = clusterData[i];
                        break;
                    }
                }
            }

            return clusterObj;
        };


        vm.getIntergrationDetails = function(intergrationId) {
            clusterObj = {};

            if($rootScope.clusterData !== null && typeof intergrationId !== "undefined") {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;
                for ( i = 0; i < len; i++ ) {
                    if(clusterData[i].intergration_id === intergrationId) {
                        clusterObj = clusterData[i];
                        break;
                    }
                }
            }

            return clusterObj;
        };

        vm.getFileShareDetails = function(clusterId) {
            volumeList = [];

            if($rootScope.clusterData !== null) {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;
                for ( i = 0; i < len; i++ ) {

                    if(typeof clusterData[i].volumes !== "undefined") {

                        if(clusterId !== undefined && clusterData[i].cluster_id === clusterId) {
                               
                            for(index in clusterData[i].volumes) {
                                clusterData[i].volumes[index].cluster_id = clusterData[i].cluster_id;
                                volumeList.push(clusterData[i].volumes[index])
                            }

                        } else {

                            for(index in clusterData[i].volumes) {
                                clusterData[i].volumes[index].cluster_id = clusterData[i].cluster_id;
                                volumeList.push(clusterData[i].volumes[index])
                            }
                        }   
                    }
                    
                }
            } else {
                vm.getObjectList("Cluster").then(function(list) {
                    $rootScope.clusterData = list;
                    vm.getFileShareDetails();
                });
            }
            return volumeList;
        };

        vm.getPoolDetails = function(clusterId) {
            poolList = [];

            if($rootScope.clusterData !== null) {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;

                for ( i = 0; i < len; i++ ) {

                    if(typeof clusterData[i].pools !== "undefined") {

                        if(clusterId !== undefined && clusterData[i].cluster_id === clusterId) {
                               
                            for(index in clusterData[i].pools) {
                                clusterData[i].pools[index].cluster_id = clusterData[i].cluster_id;
                                poolList.push(clusterData[i].pools[index])
                            }

                        } else {

                            for(index in clusterData[i].pools) {
                                clusterData[i].pools[index].cluster_id = clusterData[i].cluster_id;
                                poolList.push(clusterData[i].pools[index])
                            }
                        }   
                    }
                }
            } else {
                vm.getObjectList("Cluster").then(function(list) {
                    $rootScope.clusterData = list;
                    vm.getPoolDetails();
                });
            }
            return poolList;
        };

        vm.getAssociatedHosts = function(hostListArray, clusterId) {
            hostList = [];
            len = hostListArray.length;
            for ( i = 0; i < len; i++ ) {
                if(hostListArray[i].tendrlcontext.integration_id === clusterId) {
                    hostList.push(hostListArray[i]);
                }
            }
            return hostList;
        };

        vm.getTaskDetails = function(jobId) {
            var url, getTaskDetailsRequest, request;

            if (jobId === undefined) {
                //url = config.baseUrl + "jobs";
                url = "/api/GetTaskDetails.json";
            } else {
                //url = config.baseUrl + "jobs/" + jobId;                
            }

            getTaskDetailsRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getTaskDetailsRequest);
            return $http(request).then(function (response) {
                return response.data;
            }, function() {
                console.log("Error Occurred: while fetching getTaskDetails");
                return null;
            });
        };

        vm.getTaskLogs = function(type, jobId) {
            var url, getTaskLogsRequest, request;

            //url = config.baseUrl + "jobs/"  + JobId + "logs/type=" + type;
            url = "/api/GetJobs.json";

            getTaskLogsRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getTaskLogsRequest);
            return $http(request).then(function (response) {
                return response.data;
            }, function() {
                console.log("Error Occurred: while fetching getTaskLogs");
                return null;
            });
        };

    }

})();