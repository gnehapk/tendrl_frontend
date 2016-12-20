describe("UNIT CONTROLLER - importClusterController", function () {
    "use strict";

    // Angular injectables
    var $q, $injector, $controller, $rootScope, $state, $location, $stateParams, $timeout, $templateCache, $compile;

    // Module defined (non-Angular) injectables
    var $scope, utils, importCluster;

    // Local variables used for testing
    var getClusterImportDeferred, vm;

    // Initialize modules
    beforeEach(function () {
        module("TendrlModule");
        module("templates");
        module("TestDataModule");
    });

    // Define all injectables and compile template
    beforeEach(function () {

        var templateHtml;

        inject(function (_$q_, _$controller_, _$rootScope_, _$state_, _$stateParams_, _$templateCache_, _$compile_, _importCluster_, _$location_) {
            $q = _$q_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $location = _$location_;
            $state = _$state_;
            $stateParams = _$stateParams_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            importCluster = _importCluster_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/cluster/import-cluster/import-cluster.html");

            $compile(templateHtml)($scope);
        });

        inject(function (_utils_) {
            utils = _utils_;
        });
    });

    // Create controller instance to be used by all the unit tests
    beforeEach(function () {

        getClusterImportDeferred = $q.defer();

        sinon.stub(utils, "getObjectWorkflows").returns(getClusterImportDeferred.promise);
        sinon.stub($state, "go");

        goTo("import-cluster");
        $state.current.name = "import-cluster";

        // Exercise SUT
        vm = $controller("importClusterController", {
            $scope: $scope
        });

    });

    describe("Initialization Block", function () {

        // Verify result (behavior)
        it("Should set the initialization properties", function () {
            expect(vm.isShowImportButton).to.be.true;
            expect(vm.heading).to.be.equal("Import Cluster");
            expect(vm.notification).to.be.empty;
            expect(vm.importFlows).to.be.empty;        
        });

        it("Should call getObjectWorkflows", function() {
            expect(utils.getObjectWorkflows.calledOnce).to.be.true;
        });

        it("Should set importFlows", function() {
            getClusterImportDeferred.resolve(importCluster.generateFlows);
            $scope.$digest();
            expect(vm.importFlows).to.deep.equal(importCluster.generateFlows);
        });

    });

    describe("Funtcion: setImportClusterInfo", function () {

        beforeEach(function () {
            vm.setImportClusterInfo(importCluster.flowInfo);
        });

        //TODO: discuss woth Kamlesh
        // it("Should set flow details", function () {
        //     expect(vm.heading).to.be.equal("CephImportCluster");
        //     expect(vm.isShowImportButton).to.be.false;
        //     console.log(vm.selectedFlow, "selectedFlow");
        //     console.log(importCluster.attributes, "attributes");
        //     expect(vm.selectedFlow).to.deep.equal(importCluster.attributes);
        // });
    });

    describe("Funtcion: callBack", function () {

        beforeEach(function () {
            vm.callBack({job_id: 1234});
        });

        it("Should set notification to empty when notification window is closed", function() {
            expect($rootScope.notification.message).to.be.equal("JOB is under process. and JOB-ID is - 1234");
            expect($rootScope.notification.type).to.be.equal("success");
            expect($state.go.calledOnce).to.be.true;
            expect($state.go.calledWithMatch("cluster")).to.be.true;
        });
    });

    afterEach(function () {
        // Tear down
        utils.getObjectWorkflows.restore();
    });

    function goTo(url) {
        $location.url(url);
        $rootScope.$digest();
    }
}); 