(function() {
    "use strict";

    //permissions.js
    angular.module("TendrlModule")
        .factory("permissions", function($rootScope, config) {
            var permissionList = [];
            return {
                setPermissions: function(permissions) {
                    permissionList = permissions;
                    $rootScope.$broadcast('permissionsChanged');
                },
                hasPermission: function(permission) {
                    permission = permission.trim();
                    return config.aclData.some(function(item){
                        return item === permission;
                    });
                }
            };
        });
})();
