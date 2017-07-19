//# sourceURL=storage-management-plugin.js
(function() {

    var storageModule = angular.module("TendrlModule", ["ui.router", "ui.bootstrap", "frapontillo.bootstrap-switch", "gridshore.c3js.chart", "patternfly.charts", "patternfly.card", "patternfly.form"]);

    /* Setting up provider for getting config data */
    storageModule.provider("config", function() {

        /*Ideally this config should only contain
        configuration related stuff . it should not hold 
        cluster data */
        var config = {};

        /* Accessible only in config function */
        this.setConfigData = function(dataFromServer) {
            config = dataFromServer;
        };

        /* Accessible in controller/service/factory */
        this.$get = function() {
            return config;
        };

    });

    /* First fetch the config data than only application will bootstrap */
    fetchConfigData()
        .then(bootstrapApplication);

    function fetchConfigData() {
        var initInjector = angular.injector(["ng"]);

        var $http = initInjector.get("$http");

        return $http.get("../../config.json").then(function(response) {

            storageModule.config(function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, configProvider) {

                configProvider.setConfigData(response.data);

                $httpProvider.defaults.headers.post = {};
                $httpProvider.defaults.headers.delete = {};

                $urlRouterProvider.otherwise("/login");


                $stateProvider
                    .state("landing-page", { /* This will decide which view will be landing page */
                        url: "/landing-page",
                        template: "<div ng-if='!isAPINotFoundError' class='spinner spinner-lg'><div>",
                        resolve: {
                            "landingPage": function($rootScope, $state, $interval, utils, eventStore, config) {
                                var notificationTimer;

                                $rootScope.isAPINotFoundError = false;
                                $rootScope.clusterData = null;
                                $rootScope.notificationList = null;

                                utils.getObjectList("Cluster").then(function(list) {
                                    $rootScope.clusterData = list;
                                    if ($rootScope.clusterData !== null && $rootScope.clusterData.clusters.length !== 0) {
                                        /* Forward to cluster view if we have cluster data. */
                                        $rootScope.isNavigationShow = true;
                                        getNotificationList();
                                        $state.go("dashboard");
                                    } else {
                                        /* Forward to home view if we don't have cluster data. */
                                        $rootScope.isNavigationShow = false;
                                        $state.go("home");
                                    }
                                }).catch(function(error) {
                                    $rootScope.isAPINotFoundError = true;
                                });

                                function getNotificationList() {
                                    eventStore.getNotificationList()
                                        .then(function(notificationList) {
                                            $interval.cancel(notificationTimer);
                                            $rootScope.notificationList = notificationList;
                                            $rootScope.$broadcast("GotNoticationData", $rootScope.notificationList);
                                            startNotificationTimer();
                                        })
                                        .catch(function(error) {
                                            $rootScope.notificationList = null;
                                        });
                                }

                                function startNotificationTimer() {
                                    notificationTimer = $interval(function() {
                                        getNotificationList();
                                    }, 1000 * config.eventsRefreshIntervalTime, 1);
                                }

                                $rootScope.$on("$destroy", function() {
                                    $interval.cancel(notificationTimer);
                                });

                                $rootScope.$on("UserLogsOut", function() {
                                    $interval.cancel(notificationTimer);
                                });
                            }
                        }
                    })
                    .state("forbidden", { /* This will decide which view will be landing page */
                        url: "/forbidden",
                        template: "<div>Not Authorized<div>"
                    })
                    .state("login", {
                        url: "/login",
                        templateUrl: "/modules/login/login.html",
                        controller: "LoginController",
                        controllerAs: "loginCntrl"
                    })
                    .state("home", {
                        url: "/home",
                        templateUrl: "/modules/home/home.html",
                        controller: "homeController",
                        controllerAs: "homeCntrl"
                    })
                    .state("cluster", {
                        url: "/clusters",
                        templateUrl: "/modules/cluster/cluster-list/cluster-list.html",
                        controller: "clusterController",
                        controllerAs: "clusterCntrl"
                    })
                    .state("import-cluster", {
                        url: "/import-cluster",
                        templateUrl: "/modules/cluster/import-cluster/import-cluster.html",
                        controller: "importClusterController",
                        controllerAs: "importClusterCntrl"
                    })
                    .state("cluster-detail", {
                        url: "/cluster/:clusterId",
                        templateUrl: "/modules/cluster/cluster-detail/cluster-detail.html",
                        controller: "clusterDetailController",
                        controllerAs: "clusterDetail"
                    })
                    .state("host", {
                        url: "/hosts",
                        templateUrl: "/modules/host/host-list/host-list.html",
                        controller: "hostController",
                        controllerAs: "hostCntrl"
                    })
                    .state("file-share", {
                        url: "/file-shares",
                        templateUrl: "/modules/file-share/file-share-list/file-share-list.html",
                        controller: "fileShareController",
                        controllerAs: "fileShareCntrl"
                    })
                    .state("pool", {
                        url: "/pools",
                        templateUrl: "/modules/pool/pool-list/pool-list.html",
                        controller: "poolController",
                        controllerAs: "poolCntrl"
                    })
                    .state("create-pool", {
                        url: "/pool/create-pool",
                        templateUrl: "/modules/pool/create-pool/create-pool.html",
                    })
                    .state("rbd", {
                        url: "/rbds",
                        templateUrl: "/modules/rbd/rbd-list/rbd-list.html",
                        controller: "rbdController",
                        controllerAs: "rbdCntrl"
                    })
                    .state("create-rbd", {
                        url: "/create-rbd",
                        templateUrl: "/modules/rbd/create-rbd/create-rbd.html",
                        controller: "createRBDController",
                        controllerAs: "createRBDCntrl"
                    })
                    .state("add-inventory", {
                        url: "/add-inventory/:clusterId",
                        templateUrl: "/modules/add-inventory/add-inventory.html",
                        controller: "addInventoryController",
                        controllerAs: "addInventoryCntrl"
                    })
                    .state("tasks", {
                        url: "/admin/tasks",
                        templateUrl: "/modules/tasks/tasks.html",
                        controller: "taskController",
                        controllerAs: "taskCntrl"
                    })
                    .state("alerts", {
                        url: "/alerts",
                        templateUrl: "/modules/alerts/alerts.html",
                        controller: "alertController",
                        controllerAs: "alertCntrl"
                    })
                    .state("task-detail", {
                        url: "/admin/tasks/:taskId",
                        templateUrl: "/modules/tasks/task-detail/task-detail.html",
                        controller: "taskDetailController",
                        controllerAs: "taskDetailCntrl"
                    })
                    .state("dashboard", {
                        url: "/dashboard",
                        templateUrl: "/modules/dashboard/dashboard.html",
                        controller: "dashboardController",
                        controllerAs: "dashboardCntrl"
                    })
                    .state("create-volume", {
                        url: "/create-volume",
                        templateUrl: "/modules/file-share/create-volume/create-volume.html",
                        controller: "createVolumeController",
                        controllerAs: "createVolumeCntrl"
                    })
                    .state("create-cluster", {
                        url: "/create-cluster",
                        template: "",
                        controller: "createClusterController",
                        controllerAs: "createClusterCntrl"
                    })
                    .state("create-ceph-cluster", {
                        url: "/create-ceph-cluster",
                        templateUrl: "/modules/cluster/create-cluster/create-ceph-cluster/create-ceph-cluster.html",
                        controller: "createCephClusterController",
                        controllerAs: "createCephClusterCntrl"
                    })
                    .state("create-gluster-cluster", {
                        url: "/create-gluster-cluster",
                        templateUrl: "/modules/cluster/create-cluster/create-gluster-cluster/create-gluster-cluster.html",
                        controller: "createGlusterClusterController",
                        controllerAs: "createGlusterClusterCntrl"
                    })
                    .state("host-detail", {
                        url: "/hosts/:hostId",
                        templateUrl: "/modules/host/host-detail/host-detail.html",
                        controller: "hostDetailController",
                        controllerAs: "hostDetailCntrl"
                    });

            });
            storageModule.run(function($rootScope, $location, $http, $interval, $state, menuService, AuthManager, utils, eventStore, config, userStore) {
                var restrictedPage, loggedIn, notificationTimer;

                $rootScope.$on("$locationChangeStart", function(event, current, next) {
                    // redirect to login page if not logged in and trying to access a restricted page
                    $rootScope.isHeaderShow = true;

                    restrictedPage = $.inArray($location.path(), ["/login"]) === -1;
                    loggedIn = JSON.parse(localStorage.getItem("userInfo"));
                    if (restrictedPage && !loggedIn) {
                        $location.path("/login");
                    }
                    if (!restrictedPage) {
                        $rootScope.isHeaderShow = false;
                    }
                });

                $rootScope.$on("$stateChangeStart", function(event, next, current) {
                    if ((next.name.indexOf("tasks") !== -1) && (userStore.getUserRole() !== "admin")) {
                        $location.path("/forbidden");
                    }
                });

                $rootScope.$on("$stateChangeSuccess", function(event, current, prev) {
                    menuService.setActive(current.name);
                });

                if (JSON.parse(localStorage.getItem("userInfo")) && JSON.parse(localStorage.getItem("userInfo")).username && JSON.parse(localStorage.getItem("userInfo")).accessToken) {
                    AuthManager.isUserLoggedIn = true;
                    AuthManager.setAuthHeader();
                }

                if (AuthManager.isUserLoggedIn) {
                    /* Tracking the current URI for navigation*/
                    $rootScope.isAPINotFoundError = false;
                    $rootScope.clusterData = null;
                    $rootScope.notificationList = null;

                    var url = $location.path();
                    utils.getObjectList("Cluster").then(function(list) {
                        $rootScope.clusterData = list;
                        /* Setting up manual broadcast event for ClusterData*/
                        $rootScope.$broadcast("GotClusterData", $rootScope.clusterData); // going down!
                        if ($rootScope.clusterData !== null && $rootScope.clusterData.clusters.length !== 0) {
                            /* Forward to cluster view if we have cluster data. */
                            $rootScope.isNavigationShow = true;
                            getNotificationList();
                        } else {
                            /* Forward to home view if we don't have cluster data. */
                            $rootScope.isNavigationShow = false;
                        }
                    }).catch(function(error) {
                        $rootScope.$broadcast("GotClusterData", $rootScope.clusterData); // going down!
                        $rootScope.isAPINotFoundError = true;
                    });
                }

                function getNotificationList() {
                    eventStore.getNotificationList()
                        .then(function(notificationList) {
                            $interval.cancel(notificationTimer);
                            $rootScope.notificationList = notificationList;
                            $rootScope.$broadcast("GotNoticationData", $rootScope.notificationList);
                            startNotificationTimer();
                        })
                        .catch(function(error) {
                            $rootScope.notificationList = null;
                        });
                }

                function startNotificationTimer() {
                    notificationTimer = $interval(function() {
                        getNotificationList();
                    }, 1000 * config.eventsRefreshIntervalTime, 1);
                }

                $rootScope.$on("$destroy", function() {
                    $interval.cancel(notificationTimer);
                });

                $rootScope.$on("UserLogsOut", function() {
                    $interval.cancel(notificationTimer);
                });
            });

        }, function(errorResponse) {
            // Handle error case
        });
    }

    function bootstrapApplication() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ["TendrlModule"]);
        });
    }

}());
