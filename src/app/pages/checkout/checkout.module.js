(function () {
    'use strict';

    angular.module('BlurAdmin.pages.checkout', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('checkout', {
                url: '/checkout/:apiToken/:merchantIdentifier/:merchantName',
                params: {
                    apiToken: {
                        type: 'string',
                        squash: true
                    },
                    merchantIdentifier: {
                        type: 'string',
                        squash: true
                    },
                    merchantName: {
                        type: 'string',
                        squash: true
                    }
                },
                views:{
                'admin':{
                    templateUrl: 'app/pages/checkout/checkout.html',
                    controller: 'CheckoutCtrl'
                }
            }
        });
    }
})();
