/*global angular */

/**
 * The main Quote app module
 *
 * @type {angular.Module}
 */
angular.module('quotes', ['ngRoute'])
	.config(function ($routeProvider) {
		'use strict';

		var routeConfig = {
			controller: 'QuoteCtrl',
			templateUrl: 'quoteslist-index.html',
			resolve: {
				store: function (quoteStorage) {
					// Get the correct module (API or localStorage).
					return quoteStorage.then(function (module) {
						module.get(); // Fetch the quote records in the background.
						return module;
					});
				}
			}
		};

		$routeProvider
			.when('/', routeConfig)
			.when('/:status', routeConfig)
			.otherwise({
				redirectTo: '/'
			});
	});