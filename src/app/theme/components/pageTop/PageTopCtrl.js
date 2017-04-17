(function () {
    'use strict';

    angular.module('BlurAdmin.theme.components')
        .controller('PageTopCtrl', PageTopCtrl);

    /** @ngInject */
    function PageTopCtrl($rootScope,$scope,$http,cookieManagement,API,$location,errorToasts,$window,_) {
        var vm = this;

        $scope.companyName = cookieManagement.getCookie('COMPANY');
        vm.token = cookieManagement.getCookie('TOKEN');
        $scope.currencies = [];
        vm.currentLocation = $location.path();

        vm.getCompanyCurrencies = function(){
            $http.get(API + '/company/currencies/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 200) {
                    $rootScope.selectedCurrency = res.data.data.results[0];
                    $scope.currencies = res.data.data.results;
                    $window.sessionStorage.currenciesList = JSON.stringify(res.data.data.results);
                }
            }).catch(function (error) {
                errorToasts.evaluateErrors(error.data);
            });
        };
        if(vm.currentLocation != '/login'){
            vm.getCompanyCurrencies();
        }

        $scope.selectCurrency = function(selectedCurrency){
            $rootScope.selectedCurrency = selectedCurrency;
        };

        $scope.logout = function(){
            cookieManagement.deleteCookie('TOKEN');
            cookieManagement.deleteCookie('COMPANY');
            $location.path('/login');
        };
    }

})();