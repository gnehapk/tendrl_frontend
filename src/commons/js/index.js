//# sourceURL=storage-management-plugin.js
(function() {

    var storageModule = angular.module("TendrlModule", ["ui.router", "ui.bootstrap", "frapontillo.bootstrap-switch", "gridshore.c3js.chart", "patternfly.charts", "patternfly.card", "patternfly.form", "patternfly.notification"]);

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
                    .state("login", {
                        url: "/login",
                        template: "<login></login>"
                    })
                    .state("clusters", {
                        url: "/clusters",
                        template: "<cluster-list></cluster-list>"
                    })
                    .state("import-cluster", {
                        url: "/import-cluster/:clusterId",
                        template: "<import-cluster cluster='clusterTobeImported'></import-cluster>"
                    })
                    .state("cluster-detail", {
                        url: "/cluster-detail/:clusterId",
                        template: "<cluster-detail></cluster-detail>"
                    })
                    .state("hosts", {
                        url: "/hosts",
                        template: "<host-list></host-list>"
                    })
                    .state("host-detail", {
                        url: "/cluster-detail/:clusterId/host-detail/:hostId",
                        template: "<host-detail></host-detail>"
                    })
                    .state("volume-detail", {
                        url: "/cluster-detail/:clusterId/volume-detail/:volumeId",
                        template: "<volume-detail></volume-detail>"
                    })
                    .state("events", {
                        url: "/events",
                        template: "<event-list></event-list>"
                    })
                    .state("tasks", {
                        url: "/tasks",
                        template: "<tasks></tasks>"
                    })
                    .state("users", {
                        url: "/admin/users",
                        template: "<users></users>"
                    })
                    .state("add-user", {
                        url: "/admin/users/add",
                        template: "<add-user></add-user>"
                    })
                    .state("edit-user", {
                        url: "/admin/users/edit/:userId",
                        template: "<edit-user></edit-user>"
                    })
                    // .state("alerts", {
                    //     url: "/alerts",
                    //     template: "<alerts></alerts>"
                    // })
                    .state("task-detail", {
                        url: "/admin/tasks/:taskId",
                        template: "<task-detail></task-detail>"
                    })
                    .state("forbidden", {
                        url: "/forbidden",
                        template: "<div class='un-auth-user'>You are not authorised to see this view.<div>"
                    });

            });
            storageModule.run(function($rootScope, $location, $http, $interval, menuService, AuthManager, utils, eventStore, config, clusterStore, userStore) {
                var restrictedPage, loggedIn, alertListTimer;

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

                $rootScope.$on("$stateChangeSuccess", function(event, current, prev) {
                    menuService.setActive(current.name);
                });

                $rootScope.$on("$stateChangeStart", function(event, next, current) {
                    if (AuthManager.isAuthenticated(next.name)) {
                        $location.path("/forbidden");
                    }
                });

                if (JSON.parse(localStorage.getItem("userInfo")) && JSON.parse(localStorage.getItem("userInfo")).username && JSON.parse(localStorage.getItem("userInfo")).accessToken) {
                    AuthManager.isUserLoggedIn = true;
                    AuthManager.setAuthHeader();
                    $rootScope.userRole = AuthManager.getUserRole();
                }

                if (AuthManager.isUserLoggedIn) {
                    /* Tracking the current URI for navigation*/
                    $rootScope.isAPINotFoundError = false;
                    $rootScope.clusterData = null;
                    $rootScope.alertList = null;
                    $rootScope.selectedClusterOption = "allClusters";
                    menuService.setMenus();

                    var url = $location.path();
                    clusterStore.getClusterList().then(function(list) {
                        $rootScope.clusterData = list;
                        /* Setting up manual broadcast event for ClusterData*/
                        $rootScope.$broadcast("GotClusterData", $rootScope.clusterData); // going down!
                        if ($rootScope.clusterData !== null && $rootScope.clusterData.length !== 0) {
                            /* Forward to cluster view if we have cluster data. */
                            getAlertList();
                        }
                    }).catch(function(error) {
                        $rootScope.$broadcast("GotClusterData", $rootScope.clusterData); // going down!
                        $rootScope.isAPINotFoundError = true;
                    }).finally(function() {
                        $rootScope.isNavigationShow = true;
                    });
                }


                function getAlertList() {
                    eventStore.getAlertList()
                        .then(function(alertList) {
                            $interval.cancel(alertListTimer);
                            $rootScope.alertList = alertList;
                            $rootScope.$broadcast("GotAlertData", $rootScope.alertList);
                            startAlertTimer();
                        })
                        .catch(function(error) {
                            $rootScope.alertList = null;
                        });
                }

                function startAlertTimer() {
                    alertListTimer = $interval(function() {
                        getAlertList();
                    }, 1000 * config.eventsRefreshIntervalTime, 1);
                }

                $rootScope.$on("$destroy", function() {
                    $interval.cancel(alertListTimer);
                });

                $rootScope.$on("UserLogsOut", function() {
                    $interval.cancel(alertListTimer);
                });
            });

            storageModule.run(function($rootScope, $interval, $document, $state, AuthManager, config) {

                // Timeout timer value
                var sessionTimeOut = config.sessionIntervalTime * 1000,
                    // Start a timeout
                    sessionTimer = $interval(function() { LogoutByTimer() }, sessionTimeOut),
                    bodyElement = angular.element($document);

                angular.forEach(["keydown", "keyup", "click", "mousemove", "DOMMouseScroll", "mousewheel", "mousedown", "touchstart", "touchmove", "scroll", "focus"],
                    function(eventName) {
                        bodyElement.bind(eventName, function(e) { resetSession(e) });
                    });

                function LogoutByTimer() {
                    if ($state.current.name !== "login") {
                        AuthManager.logout()
                            .then(function() {
                                $interval.cancel(sessionTimer);
                                bodyElement.unbind();
                            })
                            .then(function() {
                                AuthManager.setFlags();
                            })
                            .then(function() {
                                $state.go("login");
                            })
                            .catch(function(e) {
                                AuthManager.isUserLoggedIn = true;
                                console.log("Logout Error: Logout Not Successful");
                            });
                    }
                }

                function resetSession(e) {
                    /// Stop the pending timeout
                    $interval.cancel(sessionTimer);

                    /// Reset the timeout
                    sessionTimer = $interval(function() { LogoutByTimer() }, sessionTimeOut);
                }

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
