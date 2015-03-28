'use strict';

(function() {
	// Walkers Controller Spec
	describe('Walkers Controller Tests', function() {
		// Initialize global variables
		var WalkersController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Walkers controller.
			WalkersController = $controller('WalkersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Walker object fetched from XHR', inject(function(Walkers) {
			// Create sample Walker using the Walkers service
			var sampleWalker = new Walkers({
				name: 'New Walker'
			});

			// Create a sample Walkers array that includes the new Walker
			var sampleWalkers = [sampleWalker];

			// Set GET response
			$httpBackend.expectGET('walkers').respond(sampleWalkers);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.walkers).toEqualData(sampleWalkers);
		}));

		it('$scope.findOne() should create an array with one Walker object fetched from XHR using a walkerId URL parameter', inject(function(Walkers) {
			// Define a sample Walker object
			var sampleWalker = new Walkers({
				name: 'New Walker'
			});

			// Set the URL parameter
			$stateParams.walkerId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/walkers\/([0-9a-fA-F]{24})$/).respond(sampleWalker);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.walker).toEqualData(sampleWalker);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Walkers) {
			// Create a sample Walker object
			var sampleWalkerPostData = new Walkers({
				name: 'New Walker'
			});

			// Create a sample Walker response
			var sampleWalkerResponse = new Walkers({
				_id: '525cf20451979dea2c000001',
				name: 'New Walker'
			});

			// Fixture mock form input values
			scope.name = 'New Walker';

			// Set POST response
			$httpBackend.expectPOST('walkers', sampleWalkerPostData).respond(sampleWalkerResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Walker was created
			expect($location.path()).toBe('/walkers/' + sampleWalkerResponse._id);
		}));

		it('$scope.update() should update a valid Walker', inject(function(Walkers) {
			// Define a sample Walker put data
			var sampleWalkerPutData = new Walkers({
				_id: '525cf20451979dea2c000001',
				name: 'New Walker'
			});

			// Mock Walker in scope
			scope.walker = sampleWalkerPutData;

			// Set PUT response
			$httpBackend.expectPUT(/walkers\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/walkers/' + sampleWalkerPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid walkerId and remove the Walker from the scope', inject(function(Walkers) {
			// Create new Walker object
			var sampleWalker = new Walkers({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Walkers array and include the Walker
			scope.walkers = [sampleWalker];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/walkers\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleWalker);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.walkers.length).toBe(0);
		}));
	});
}());