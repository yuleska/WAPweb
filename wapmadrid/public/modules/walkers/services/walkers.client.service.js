'use strict';

//Walkers service used to communicate Walkers REST endpoints
angular.module('walkers').factory('Walkers', ['$resource',
    function($resource) {
        return $resource('walkers/:walkerId', {
            walkerId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
        return $resource('walkers', {}, {
            create: {
                method: 'POST'
            }
        });

    }
]);
