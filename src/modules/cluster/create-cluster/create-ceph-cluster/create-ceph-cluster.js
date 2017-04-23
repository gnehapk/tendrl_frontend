(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createCephClusterController", createCephClusterController);

    /*@ngInject*/
    function createCephClusterController($rootScope, $scope, $uibModal, $filter, $state, utils, nodeStore) {

        var vm = this,
            date = new Date(),
            initialLoad = true;


        vm.selectedStep = 1;
        vm.storageService ="Ceph";
        vm.roles = ["Monitor", "OSD Host"];
        vm.totalDevices = 0;
        vm.diskConf = {
            diskUnits: ['GB','MB'],
            journalConfigrationType: ["Colocated","Dedicated"],
            partitionType: ["SSD", "HDD"],
            partitionValue: 4
        };
        vm.cephClusterName = "ceph_"+ date.getFullYear() + date.getMonth() + date.getDate() + date.getTime();
        vm.wizardSteps = [{
                "number": 1,
                "name": "General"
            },{
                "number": 2,
                "name": "Network & Host"
            },{
                "number": 3,
                "name": "Roles"
            },{
                "number": 4,
                "name": "Journal Configuration"
            },{
                "number": 5,
                "name": "Review"
            }];

        vm.diskFilterBy = {
            "property": "fqdn",
            "value": ""
        };

        vm.subnetFilterBy = {
            "property": "networks.eth0.subnet",
            "value": ""
        };
        vm.showSelectionWarning = false;
        vm.showMonSelectionWarning = false;
        vm.journalFilterBy = "fqdn";

        vm.clusterNetwork = [];
        vm.publicNetwork = [];
        vm.filteredList = [];
        vm.selectedNWHost = [];
        vm.selectedRoleHost = [];
        vm.journalFilterBy = {
            "property": "fqdn",
            "value": ""
        };

        vm.deviceWarningMsg = "Some devices contain user data and will be repartitioned on cluster creation. Any existing data will be lost."
        vm.createPublicNetwork = createPublicNetwork;
        vm.filterByCN = filterByCN;
        vm.filterByPN = filterByPN;
        vm.filterHostByPN = filterHostByPN;
        vm.selectNWHost = selectNWHost;
        vm.isSelectedNWHost = isSelectedNWHost;
        vm.validateFields = validateFields;
        vm.updateOSDMonCount = updateOSDMonCount;
        vm.closeExpandList = closeExpandList;
        vm.expandList = expandList;
        vm.reset = reset;
        vm.filterByOSD = filterByOSD;
        vm.filterList = filterList;
        vm.getJournalMap = getJournalMap;

        init();
        
        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            init();
        });

        function init() {
            vm.isDataLoading = true;
            vm.totalDevices = 0
            vm.availableHostList = [];
            vm.updatedHostList = [];
            vm.subnetList = [];
            vm.serverNodes = [];

            utils.getObjectList("Node").then(function(list) {
                var hostList = list.nodes,
                    len = hostList.length,
                    i;

                vm.isDataLoading = false;
                
                if(list !== null && len !== 0) {
                    for(i = 0; i < len ; i++){
                        if(JSON.parse(hostList[i].tags).indexOf("tendrl/central-store") !== -1){
                            vm.serverNodes.push(hostList[i]);
                        } else if (hostList[i].detectedcluster && hostList[i].detectedcluster.detected_cluster_id === ""){
                            vm.availableHostList.push(hostList[i]);
                            //vm.totalRawCapacity += hostList[i].stats ? hostList[i].stats.storage.total : 0;
                            changeIntoArray(hostList[i]);
                            _createHostList(hostList[i]);
                            vm.createPublicNetwork();
                        }
                    }
                }

                if(initialLoad) {
                    _setIntendedUsage();
                }
            });
        }

        function _setIntendedUsage() {
            if(vm.availableHostList && vm.availableHostList.length >= 3) {
                vm.enablePOCIntendedUsage = true;
                vm.enableProIntendedUsage = true;
                vm.intendedUsage = "production";
            } else if(vm.availableHostList && vm.availableHostList.length >= 1) {
                vm.enablePOCIntendedUsage = true;
                vm.enableProIntendedUsage = false;
                vm.intendedUsage = "poc";  
            }

            initialLoad = false;
        }

        function validateFields() {
            var flag = false,
                monFlag = false;
            vm.showSelectionWarning = false;
            vm.showMonSelectionWarning = false;

            if(vm.selectedStep === 2) {
                
                if(vm.intendedUsage === "production") {                
                    flag = vm.selectedNWHost.length < 3;
                    
                    if(flag) {
                        vm.hostSelectionMsg = "Minimum 3 hosts should be selected for Production";
                        vm.showSelectionWarning = true;
                    }
                } else if(vm.intendedUsage === "poc") {
                    flag = vm.selectedNWHost.length < 1;
                    
                    if(flag) {
                        vm.hostSelectionMsg = "Minimum 1 host should be selected for POC";
                        vm.showSelectionWarning = true;
                    }
                }

                return flag; 
            } else if(vm.selectedStep === 3) {

                if(vm.intendedUsage === "production") {                
                    monFlag = vm.selectedMonitors < 3;
                    
                    if(monFlag) {
                        vm.monSelectionMsg = "Minimum 3 monitors should be selected for Production";
                        vm.showMonSelectionWarning = true;
                    }
                } else if(vm.intendedUsage === "poc") {
                    monFlag = vm.selectedMonitors < 1;
                    
                    if(monFlag) {
                        vm.monSelectionMsg = "Minimum 1 monitor should be selected for POC";
                        vm.showMonSelectionWarning = true;
                    }
                }

                return monFlag;   
            }
        }

        function selectNWHost(host) {
            
            var hostIndex;

            if (typeof host === "boolean") {
                
                if(host) {
                    vm.selectedNWHost = vm.filteredList.slice(0); 
                } else {
                    vm.selectedNWHost = [];
                }

            } else if (typeof host === "object") {
                hostIndex = vm.selectedNWHost.indexOf(host);

                if (hostIndex === -1) {
                    vm.selectedNWHost.push(host);
                } else {
                    vm.selectedNWHost.splice(hostIndex, 1);
                }
            }

            console.log(vm.selectedNWHost, "selectedNWHost");

            vm.allNWHostChecked = vm.selectedNWHost.length === vm.filteredList.length;
        }

        function isSelectedNWHost(host) {
            return vm.selectedNWHost.indexOf(host) > -1;
        }

        function createPublicNetwork() {
            var len,
                subnetLen,
                i,
                j;
                
            vm.publicNetwork = [];
            vm.filteredList = vm.filterListByCN = $filter("filter")(vm.updatedHostList, vm.filterByCN);
            len = vm.filteredList.length

            for ( i = 0; i < len; i++) {
                subnetLen = vm.filteredList[i].subnets.length;

                for ( j = 0; j < subnetLen; j++) {
                    if(vm.publicNetwork.indexOf(vm.filteredList[i].subnets[j]) === -1) {
                        vm.publicNetwork.push(vm.filteredList[i].subnets[j]);
                    }
                }
            }

            vm.selectedPublicNetwork = vm.publicNetwork[0];
            vm.filteredList = vm.filteredListByPN = $filter("filter")(vm.filterListByCN, vm.filterByPN);
        };

        function filterByCN(host) {
            if(host.subnets.indexOf(vm.selectedClusterNetwork) !== -1) {
                return host;
            }
        }

        function filterByPN(host) {
            if(host.subnets.indexOf(vm.selectedPublicNetwork) !== -1) {
                return host;
            }
        }

        function filterHostByPN() {
            vm.filteredList = $filter("filter")(vm.filterListByCN, vm.filterByPN);   
        }

        function _getDisks(host) {
            var keys = Object.keys(host.disks),
                len = keys.length,
                temp,
                conf = [],
                i;

            for ( i = 0; i < len; i++) {
                if(keys[i] !== "free" && keys[i] !== "used") {
                    temp = {};
                    temp.device = host.disks[keys[i]].device_name;
                    temp.size = host.disks[keys[i]].size;
                    temp.ssd = host.disks[keys[i]].ssd;
                    conf.push(temp);
                }
            }

            return conf;
        }

        function _createHostList(host) {
            var interfaceKeys = Object.keys(host.networks),
                len = interfaceKeys.length,
                interfaces = [],
                hostIP = [],
                subnets = [],
                ipLen,
                ip,
                i,
                j,
                obj = {},
                temp;

            obj.fqdn = host.fqdn;
            obj.node_id = host.node_id;
            obj.ifLength = len;
            obj.ifIPMapping =[];
            obj.subnets = [];
            obj.freeDevices = host.disks.free ? Object.keys(host.disks.free).length : 0;
            obj.usedDevices = host.disks.used ? Object.keys(host.disks.used).length : 0;
            obj.totalNodeInDevice = obj.freeDevices + obj.usedDevices;
            obj.selectedRole = _getRole(obj);
            obj.storage_disks = _getDisks(host);

            for ( i = 0; i < len; i++) {
                temp = {};
                
                ip = host.networks[interfaceKeys[i]].ipv4;
                ipLen = ip.length;

                for ( j = 0; j < ipLen; j++) {
                    temp.if = interfaceKeys[i];
                    temp.ip = ip[j];
                    obj.ifIPMapping.push(temp);
                }

                if(obj.subnets.indexOf(host.networks[interfaceKeys[i]].subnet) === -1) {
                    obj.subnets.push(host.networks[interfaceKeys[i]].subnet);
                    _createClusterNetwork(host.networks[interfaceKeys[i]].subnet);
                }

                vm.selectedClusterNetwork = vm.clusterNetwork[0];
            }
            vm.updatedHostList.push(obj);
        }

        function reset() {
            init();
            vm.selectedNWHost = [];
            vm.availableHostForRole = [];
            vm.filteredList = [];
        }

        function _createClusterNetwork(subnet) {
            if(vm.clusterNetwork.indexOf(subnet) === -1) {
                vm.clusterNetwork.push(subnet);
            }
        }

        function updateOSDMonCount() {
            var len = vm.availableHostForRole.length,
                i;

            vm.selectedMonitors = 0;
            vm.selectedOSDs = 0;

            for (i = 0; i < len; i++) {

                if(vm.availableHostForRole[i].selectedRole === "Monitor") {
                    vm.selectedMonitors += 1;
                } else if(vm.availableHostForRole[i].selectedRole === "OSD Host") {
                    vm.selectedOSDs += 1;
                }
            }
        }

        function changeIntoArray(host){
            var i,
                interfaces = Object.keys(host.networks),
                len = interfaces.length;

            for ( i = 0; i < len; i++) {
                host.networks[interfaces[i]].ipv4 = JSON.parse(host.networks[interfaces[i]].ipv4);
            }
        }

        function _getRole(host) {
            if(host.totalNodeInDevice >= 1) {
                return "OSD Host";
            } else {
                return "Monitor";
            }
        }

        function createClusterPostData(){
            var roleMapping = {
                "Monitor": "ceph/mon",
                "OSD Host": "ceph/osd"
            },
            postData = {},
            sds_parameters = {},
            node_configuration = {},
            conf_overrides =  {
            "global":{
                "osd_pool_default_pg_num":128,
                "pool_default_pgp_num":1
                }
            },
            role = {
                "Monitor": "ceph/mon",
                "OSD Host": "osd"
            },
            network,
            index,
            index1;

            sds_parameters.name = vm.cephClusterName;
            sds_parameters.public_network = vm.selectedPublicNetwork;
            sds_parameters.cluster_network = vm.selectedClusterNetwork;
            sds_parameters.conf_overrides = conf_overrides;
            postData.sds_parameters = sds_parameters;
            postData.node_identifier = "ip";

            for(index = 0; index < vm.availableHostForJournal.length; index++){
                for(index1=0; index1 < vm.availableHostForJournal[index].ifIPMapping.length; index1++){
                    network = vm.availableHostForJournal[index].ifIPMapping[index1].ip;
                    node_configuration[network] = {};
                    node_configuration[network].role = roleMapping[vm.availableHostForJournal[index].selectedRole];
                    node_configuration[network].provisioning_ip = vm.availableHostForJournal[index].ifIPMapping[index1].ip;
                    if(vm.availableHostForJournal[index].selectedRole === "OSD Host"){
                        node_configuration[network].journal_size = vm.availableHostForJournal[index].journalSize;
                        node_configuration[network].journal_colocation = vm.availableHostForJournal[index].selectedJournalConfigration === "Dedicated" ? false : true;
                        node_configuration[network].storage_disks = vm.availableHostForJournal[index].storage_disks;
                    } else if(vm.availableHostForJournal[index].selectedRole === "Monitor"){
                        node_configuration[network].monitor_interface = vm.availableHostForJournal[index].ifIPMapping[index1]["if"];
                    }
                }
            }
            postData.node_configuration = node_configuration;
            console.log(postData);
        }

        function _createNodeConf() {
            var len = vm.availableHostForRole.length,
                i;

            vm.nodeConf = {
                node_configuration: []
            };

            if(vm.intendedUsage === "production") {
                for ( i = 0; i < len; i++) {
                    vm.nodeConf.node_configuration
                }
            }
        }

        function _createJournalData(journals) {
            var len = journals.length,
                i;

            if(vm.intendedUsage === "production") {
                for ( i = 0; i < len; i++) {
                    _updateDiskList(journals[i]);
                }
            }
        }

        function _updateDiskList(journal) {
            var len = vm.availableHostForJournal.length,
                diskLen,
                i,
                j;

            for(i = 0; i < len; i++) {
                if(vm.availableHostForJournal[i].node_id === journal.node_id) {
                    _upadateDisk(vm.availableHostForJournal[i], journal);
                    vm.availableHostForJournal[i].unallocated_disks = journal.unallocated_disks;
                    _deleteUnallocatedDisks(vm.availableHostForJournal[i], journal);
                    break;
                }
            }

        }

        function _deleteUnallocatedDisks(host, journal) {
            var journalLen = journal.unallocated_disks.length,
                hostLen = host.storage_disks.length,
                i,
                j;

            for ( i = 0; i < journalLen; i++) {

                for ( j = 0; j < hostLen; j++) {
                    if(journal.unallocated_disks[i] === host.storage_disks[j].device) {
                        host.storage_disks.splice(j, 1);
                        break;   
                    }
                }
            }
        }

        function _upadateDisk(host, journal) {
            var journalLen = journal.storage_disks.length,
                hostLen = host.storage_disks.length,
                i,
                j;

            for ( i = 0; i < journalLen; i++) {

                for ( j = 0; j < hostLen; j++) {
                    if(journal.storage_disks[i].device === host.storage_disks[j].device) {
                        host.storage_disks[j].journal = journal.storage_disks[i].journal;
                        break;   
                    }
                }
            }
        }

        function _setJournalConf() {
            var len = vm.availableHostForJournal.length,
                i;

            for ( i = 0; i < len; i++) {
                if(vm.intendedUsage === "production") {
                    vm.availableHostForJournal[i].selectedJournalConfigration = "Dedicated";
                } else if(vm.intendedUsage === "poc") {
                    vm.availableHostForJournal[i].selectedJournalConfigration = "Colocated";
                }
            }
        }

        function filterByOSD(host) {
             if(host.selectedRole !== "Monitor") {
                return host;
            }
        }

        function filterList(item) {
            var properties,
                property,
                i,
                diskLen,
                disks,
                searchBy = {},
                eth,
                ethlen,
                list = item.storage_disks,
                len = list.length;

            if(vm.journalFilterBy.value) {

                properties = vm.journalFilterBy.property.split(".");

                if(properties.length > 1) {
                    property = properties[1];
                   
                    for ( i = 0; i < len; i++) {
                        if(list[i][property].toLowerCase().indexOf(vm.journalFilterBy.value.toLowerCase()) >= 0) {
                            item.isExpanded = true;
                            return item;
                        }
                    }

                } else {
                    property = vm.journalFilterBy.property;

                    if(item[property].toLowerCase().indexOf(vm.journalFilterBy.value.toLowerCase()) >= 0) {
                        return item;
                    }
                }
                
            } else {
                return item;
            }
        };

        function _resetNodeDetails(host) {
            var len = vm.availableHostForRole.length,
                i;

            for ( i = 0; i < len; i++) {
                if(host.node_id === vm.availableHostForRole[i].node_id) {
                    vm.availableHostForJournal[i] = vm.availableHostForRole[i];
                    break;
                }
            }
        }

        function getJournalMap(host, $event) {
            _resetNodeDetails(host);
            if(host.selectedJournalConfigration === "Dedicated") {
                nodeStore.getJournalConf()
                    .then(function(data) {
                        _createJournalData(data);                                
                        //vm.availableHostForRole =  $filter("filter")(vm.availableHostForRole, vm.filterByOSD)
                        console.log(vm.availableHostForRole, "availableHostForRoleUpdated");
                    });
            }
            //$event.stopPropagation();
            
        }

        vm.nextStep = function(step) {
            if(!vm.showMsg){
                vm.selectedStep += 1;
                
                if(vm.selectedStep === 3) {
                    vm.availableHostForRole = vm.selectedNWHost;
                    _calculateSummaryValues();
                }else if(vm.selectedStep === 4) {
                    vm.availableHostForJournal = angular.copy(vm.availableHostForRole);
                    console.log(vm.availableHostForJournal, "availableHostForJournal");
                    _setJournalConf();
                    if(vm.intendedUsage === "production") {
                        nodeStore.getJournalConf()
                            .then(function(data) {
                                _createJournalData(data);                                
                                //vm.availableHostForRole =  $filter("filter")(vm.availableHostForRole, vm.filterByOSD)
                                console.log(vm.availableHostForRole, "availableHostForRoleUpdated");
                            });
                    }
                }else if(vm.selectedStep === 5) {
                    createClusterPostData();
                }
            }

        };

        vm.backStep= function(step) {
            vm.selectedStep -= 1;

            if(vm.selectedStep >= 3) {
                closeExpandList();
            }

        };

        function _calculateSummaryValues() {
            var len = vm.availableHostForRole.length,
                i;

            vm.totalDevices = 0;
            vm.selectedMonitors = 0;
            vm.selectedOSDs = 0;

            for (i = 0; i < len; i++) {
                vm.totalDevices += vm.availableHostForRole[i].totalNodeInDevice;
                
                if(vm.availableHostForRole[i].selectedRole === "Monitor") {
                    vm.selectedMonitors += 1;
                } else if(vm.availableHostForRole[i].selectedRole === "OSD Host") {
                    vm.selectedOSDs += 1;
                }
            }
        }

        function closeExpandList(){
            var len = vm.availableHostForRole.length,
                i;

            for( i = 0; i < len; i++){
                vm.availableHostForRole[i].isExpanded = false;
            }
        }

        function expandList(item) {
            if(item.isExpanded) {
                item.isExpanded = false;
            } else {
                item.isExpanded = true;
            }
        }

        
    }
})();