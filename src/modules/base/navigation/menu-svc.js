(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("menuService", menuService);

    /*@ngInject*/
    function menuService($state, $rootScope, $http, AuthManager, userStore) {

        /* Cache the reference to this pointer */
        var vm = this;
        vm.menus = [{
                label: "Dashboard",
                id: "dashboard",
                href: "dashboard",
                icon: "pficon pficon-resource-pool",
                active: false,
                hasSubMenus: false,
                show: true
            },
            {
                label: "Clusters",
                id: "cluster",
                href: "cluster",
                icon: "pficon pficon-cluster",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Hosts",
                id: "host",
                href: "host",
                icon: "pficon pficon-container-node",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Volumes",
                id: "file-share",
                href: "file-share",
                icon: "pficon pficon-volume",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Pools",
                id: "pool",
                href: "pool",
                icon: "pficon pficon-resource-pool",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "RBDs",
                id: "rbd",
                href: "rbd",
                icon: "pficon pficon-resource-pool",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Alerts",
                id: "alerts",
                href: "alerts",
                icon: "fa fa-cog",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Admin",
                id: "admin",
                href: "admin",
                icon: "fa fa-cog",
                active: false,
                hasSubMenus: true,
                show: userStore.getUserRole() === "admin",
                subMenus: [{
                    label: "Tasks",
                    id: "tasks",
                    href: "tasks",
                    icon: "fa fa-cog",
                    active: false
                }]
            }];
        vm.setMenus = function() {
            vm.menus = [{
                label: "Dashboard",
                id: "dashboard",
                href: "dashboard",
                icon: "pficon pficon-resource-pool",
                active: false,
                hasSubMenus: false,
                show: true
            },
            {
                label: "Clusters",
                id: "cluster",
                href: "cluster",
                icon: "pficon pficon-cluster",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Hosts",
                id: "host",
                href: "host",
                icon: "pficon pficon-container-node",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Volumes",
                id: "file-share",
                href: "file-share",
                icon: "pficon pficon-volume",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Pools",
                id: "pool",
                href: "pool",
                icon: "pficon pficon-resource-pool",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "RBDs",
                id: "rbd",
                href: "rbd",
                icon: "pficon pficon-resource-pool",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Alerts",
                id: "alerts",
                href: "alerts",
                icon: "fa fa-cog",
                active: false,
                hasSubMenus: false,
                show: true
            }, {
                label: "Admin",
                id: "admin",
                href: "admin",
                icon: "fa fa-cog",
                active: false,
                hasSubMenus: true,
                show: userStore.getUserRole() === "admin",
                subMenus: [{
                    label: "Tasks",
                    id: "tasks",
                    href: "tasks",
                    icon: "fa fa-cog",
                    active: false
                }]
            }];
        }

        vm.setActive = function(menuId) {

            if(JSON.parse(localStorage.getItem("userInfo"))) {
                vm.menus.map(function(menu){
                    if (menu.hasSubMenus===true){
                        menu.subMenus.map(function(submenu){
                            submenu.active = submenu.id === menuId
                        });
                    }
                    menu.active = menu.id === menuId;
                    return menu;
                });
            } else if($http.defaults.headers.common["Authorization"]){
                AuthManager.logout();
                $state.go("login");
                AuthManager.setFlags(); 
                AuthManager.isUserLoggedIn = false;
            }
        };
        
        vm.getMenus = function() {
            return vm.menus;
        };

    }

})();