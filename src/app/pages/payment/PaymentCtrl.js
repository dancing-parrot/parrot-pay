(function () {
    'use strict';

    angular.module('BlurAdmin.pages.payment')
        .controller('PaymentCtrl', PaymentCtrl);

    /** @ngInject */
    function PaymentCtrl($rootScope,$scope,$http,cookieManagement,environmentConfig,$state,$timeout,errorHandler) {

        var vm = this;
        $scope.apiToken = cookieManagement.getCookie('TOKEN');
        $scope.merchantIdentifier = $state.params.merchantIdentifier;
        $scope.merchantName = $state.params.merchantName;
        $scope.customAmount = $state.params.amount;

        vm.getRandomNumber = function(){
            var code = '';
            for(var i = 0; i<5; i ++){
                code = code + (Math.floor((Math.random()*6)+1)).toString();
            }

            return code;
        };

        vm.getQrCodeUrl = function() {
           $scope.code = vm.getRandomNumber();
           var qrCodeObj = {
               code: $scope.code,
               merchantIdentifier: $scope.merchantIdentifier,
               merchantName: $scope.merchantName,
               amount: $scope.customAmount
           };

            $scope.qrCodeUrl = 'https://chart.googleapis.com/chart?cht=qr&chl='+ JSON.stringify(qrCodeObj)
                + '&chs=150x150&chld=L|0';
        };
        vm.getQrCodeUrl();

        $scope.pay = function () {
            $rootScope.$pageFinishedLoading = false;
                if($scope.apiToken) {
                    $http.get(environmentConfig.API + '/admin/transactions/?status=Complete&metadata__code=' + $scope.code, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': $scope.apiToken
                        }
                    }).then(function (res) {
                        if (res.status === 200) {
                            if(res.data.data.count == 0){
                                $timeout(function () {
                                    $scope.pay()
                                },3000);
                            } else {
                                $rootScope.$pageFinishedLoading = true;
                                $state.go('success',{amount: $scope.customAmount})
                            }
                        }
                    }).catch(function (error) {
                        $rootScope.$pageFinishedLoading = true;
                        errorHandler.evaluateErrors(error.data);
                    });
                }
        };




    }
})();
