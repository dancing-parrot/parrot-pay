(function () {
    'use strict';

    angular.module('BlurAdmin.pages.checkout')
        .controller('CheckoutCtrl', CheckoutCtrl);

    /** @ngInject */
    function CheckoutCtrl($scope,cookieManagement,$state,$stateParams,currencyModifiers,toastr) {

        if($stateParams.apiToken){
            cookieManagement.setCookie('TOKEN',$stateParams.apiToken);
        }
        $scope.apiToken = $stateParams.apiToken;
        $scope.merchantIdentifier = $stateParams.merchantIdentifier;
        $scope.merchantName = $stateParams.merchantName;
        $scope.amount = {};
        $scope.amount.custom = '';

        $scope.checkout = function(){
            var amount;
            var validAmount = currencyModifiers.validateCurrency($scope.amount.custom, 2);
            if (validAmount) {
                amount = currencyModifiers.convertToCents($scope.amount.custom, 2);
            } else {
                toastr.error('Please input amount to 2 decimal places');
                return;
            }

            $state.go('payment',{
                apiToken: $scope.apiToken,
                merchantIdentifier: $scope.merchantIdentifier,
                merchantName: $scope.merchantName,
                amount: amount
            });
        };

    }
})();
