'use strict';

//Setting up route
angular.module('walkers').config(['$stateProvider',
    function($stateProvider) {
        // Walkers state routing
        $stateProvider.
        state('listWalkers', {
            url: '/walkers',
            templateUrl: 'modules/walkers/views/list-walkers.client.view.html'
        }).
        state('createWalker', {
            url: '/walkers/create',
            templateUrl: 'modules/walkers/views/create-walker.client.view.html'
        }).
        state('viewWalker', {
            url: '/walkers/:walkerId',
            templateUrl: 'modules/walkers/views/view-walker.client.view.html'
        }).
        state('editWalker', {
            url: '/walkers/:walkerId/edit',
            templateUrl: 'modules/walkers/views/edit-walker.client.view.html'
        }).
        state('exerciseTestWalker', {
            url: '/walkers/:walkerId/exerciseTest',
            templateUrl: 'modules/walkers/views/exerciseTest-walker.client.view.html'
        }).
        state('dietTestWalker', {
            url: '/walkers/:walkerId/dietTest',
            templateUrl: 'modules/walkers/views/dietTest-walker.client.view.html'
        });
    }
]);
