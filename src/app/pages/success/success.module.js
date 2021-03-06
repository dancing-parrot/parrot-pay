(function () {
    'use strict';

    angular.module('BlurAdmin.pages.success', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('success', {
                url: '/success',
                params: {
                    merchantIdentifier: null,
                    merchantName: null,
                    amount: null
                },
                views:{
                    'admin':{
                        templateUrl: 'app/pages/success/success.html',
                        controller: 'SuccessCtrl'
                    }
                }
            });
    }
})();
