'use strict';

// Walkers controller
angular.module('walkers').controller('WalkersController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Walkers', '$modal', '$log',
    function($scope, $http, $stateParams, $location, Authentication, Walkers, $modal, $log) {
        $scope.authentication = Authentication;

        // Create new Walker
        $scope.create = function() {
            $http.post('/walkers', $scope.credentials).success(function(response) {
                // And redirect to the index page
                $location.path('/walkers/' + response._id);
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

        // Update existing Walker
        $scope.update = function(updatedWalker) {
            $http.put('/walkers/:' + updatedWalker._id, $scope.walker).success(function(response) {
                // And redirect to the index page
            }).error(function(response) {
                $scope.error = response.message;
            });
            /*var walker = updatedWalker;

            walker.$update(function() {}, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });*/
        };

        $scope.modalUpdate = function(size, selectedWalker) {

            var modalInstance = $modal.open({
                templateUrl: 'modules/walkers/views/edit-walker.client.view.html',
                controller: function($scope, $modalInstance, walker) {
                    $scope.walker = walker;
                    $scope.ok = function() {
                        $modalInstance.close($scope.walker);
                    };

                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                },
                size: size,
                resolve: {
                    walker: function() {
                        return selectedWalker;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.modalExerciseTest = function(size, selectedWalker) {

            var modalInstance = $modal.open({
                templateUrl: 'modules/walkers/views/exerciseTest-walker.client.view.html',
                controller: function($scope, $modalInstance, walker) {
                    $scope.walker = walker;
                },
                size: size,
                resolve: {
                    walker: function() {
                        return selectedWalker;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.modalDietTest = function(size, selectedWalker) {

            var modalInstance = $modal.open({
                templateUrl: 'modules/walkers/views/dietTest-walker.client.view.html',
                controller: function($scope, $modalInstance, walker) {
                    $scope.walker = walker;
                },
                size: size,
                resolve: {
                    walker: function() {
                        return selectedWalker;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
        /*$scope.updateWalker = function(isValid) {
            if (isValid) {
                $scope.success = $scope.error = null;
                var walker = new Walkers($scope.walker);
                walker.$update(function(response) {
                    $scope.success = true;
                    //Authentication.walker = response;
                }, function(response) {
                    $scope.error = response.data.message;
                });
            } else {
                $scope.submitted = true;
            }
        };*/

        // Remove existing Walker
        $scope.remove = function(walker) {
            if (walker) {
                walker.$remove();

                for (var i in $scope.walkers) {
                    if ($scope.walkers[i] === walker) {
                        $scope.walkers.splice(i, 1);
                    }
                }
            } else {
                $scope.walker.$remove(function() {
                    $location.path('walkers');
                });
            }
        };



        // Find a list of Walkers
        $scope.find = function() {
            $scope.walkers = Walkers.query();
        };

        // Find existing Walker
        $scope.findOne = function() {
            $scope.walker = Walkers.get({
                walkerId: $stateParams.walkerId
            });
        };
    }
]);
