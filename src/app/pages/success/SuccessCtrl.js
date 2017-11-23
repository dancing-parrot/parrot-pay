(function () {
    'use strict';

    angular.module('BlurAdmin.pages.success')
        .controller('SuccessCtrl', SuccessCtrl);

    /** @ngInject */
    function SuccessCtrl($scope,cookieManagement,$state,$location) {

        $scope.apiToken = cookieManagement.getCookie('TOKEN');
        $scope.merchantIdentifier = $state.params.merchantIdentifier;
        $scope.merchantName = $state.params.merchantName;
        $scope.customAmount = $state.params.amount;

        $scope.goBackToCheckout = function(){
            $location.path('/checkout/' + $scope.apiToken + '/' + $scope.merchantIdentifier + '/' + $scope.merchantName);
        };

    }
})();