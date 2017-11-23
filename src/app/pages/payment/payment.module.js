(function () {
    'use strict';

    angular.module('BlurAdmin.pages.payment', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('payment', {
                url: '/payment',
                params: {
                    apiToken: null,
                    merchantIdentifier: null,
                    merchantName: null,
                    amount: null
                },
                views:{
                    'admin':{
                        templateUrl: 'app/pages/payment/payment.html',
                        controller: 'PaymentCtrl'
                    }
                }
            });
    }
})();
