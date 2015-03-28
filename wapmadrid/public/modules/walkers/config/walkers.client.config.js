'use strict';

// Configuring the Articles module
angular.module('walkers').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Wappies', 'walkers', 'dropdown', '/walkers(/create)?');
		Menus.addSubMenuItem('topbar', 'walkers', 'Buscar wappy', 'walkers');
		Menus.addSubMenuItem('topbar', 'walkers', 'Registrar wappy', 'walkers/create');
	}
]);