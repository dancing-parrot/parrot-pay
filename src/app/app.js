'use strict';

angular.module('BlurAdmin', [
    'BlurAdmin.config',
    'cp.ngConfirm',
    'ngFileUpload',
    'ngSanitize',
    'ngCookies',
    'ui.bootstrap',
    'ui.router',
    'ngclipboard',
    'toastr',
    'countrySelect',
    'iso-3166-country-codes',
    'ngIntlTelInput',
    'BlurAdmin.theme',
    'BlurAdmin.pages'
])
    .config(function (ngIntlTelInputProvider) {
        ngIntlTelInputProvider.set({utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/12.0.1/js/utils.js'});
    })

    .run(function($cookies,$rootScope,cookieManagement,$state,$stateParams,errorHandler,errorToasts,
                  userVerification,$http,environmentConfig,$window,$location,_){

        $window.onload = function(){
            $rootScope.$pageFinishedLoading = true;
        };
    });