/*global angular */

/**
 * Services that persists and retrieves todos from localStorage or a backend API
 * if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular.module('quotes')
	.factory('quoteStorage', function ($http, $injector) {
		'use strict';

		// Detect if an API backend is present. If so, return the API module, else
		// hand off the localStorage adapter
		return $http.get('/api')
			.then(function () {
				return $injector.get('api');
			}, function () {
				return $injector.get('localStorage');
			});
	})

	.factory('api', function ($http) {
		'use strict';

		var store = {
			quotes: [],

			clearCompleted: function () {
				var originalQuotes = store.quotes.slice(0);

				var completeQuotes = [];
				var incompleteQuotess = [];
				store.todos.forEach(function (quote) {
					if (quote.completed) {
						completeQuotes.push(quote);
					} else {
						incompleteQuotes.push(quote);
					}
				});

				angular.copy(incompleteQuotes, store.quotes);

				return $http.delete('/api/quotes')
					.then(function success() {
						return store.quotes;
					}, function error() {
						angular.copy(originalQuotes, store.quotes);
						return originalQuotes;
					});
			},

			delete: function (quote) {
				var originalQuotes = store.quotes.slice(0);

				store.quotes.splice(store.quotes.indexOf(quote), 1);

				return $http.delete('/api/quotes/' + quote.id)
					.then(function success() {
						return store.quotes;
					}, function error() {
						angular.copy(originalQuotes, store.quotes);
						return originalQuotes;
					});
			},

			get: function () {
				return $http.get('/api/quotes')
					.then(function (resp) {
						angular.copy(resp.data, store.quotes);
						return store.quotes;
					});
			},

			insert: function (quote) {
				var originalQuotes = store.quotes.slice(0);

				return $http.post('/api/quotes', quote)
					.then(function success(resp) {
						quote.id = resp.data.id;
						store.quotes.push(quote);
						return store.quotes;
					}, function error() {
						angular.copy(originalQuotes, store.quotes);
						return store.quotes;
					});
			},

			put: function (quote) {
				var originalQuotes = store.quotes.slice(0);

				return $http.put('/api/quotes/' + quote.id, quote)
					.then(function success() {
						return store.quotes;
					}, function error() {
						angular.copy(originalQuotes, store.quotes);
						return originalQuotes;
					});
			}
		};

		return store;
	})

	.factory('localStorage', function ($q) {
		'use strict';

		var STORAGE_ID = 'quotes-angularjs';

		var store = {
			quotes: [],

			_getFromLocalStorage: function () {
				return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
			},

			_saveToLocalStorage: function (quotes) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(quotes));
			},

			clearCompleted: function () {
				var deferred = $q.defer();

				var completeQuotes = [];
				var incompleteQuotes = [];
				store.quotes.forEach(function (quote) {
					if (quote.completed) {
						completeQuotes.push(quote);
					} else {
						incompleteQuotess.push(quote);
					}
				});

				angular.copy(incompleteQuotes, store.quotes);

				store._saveToLocalStorage(store.quotes);
				deferred.resolve(store.quotes);

				return deferred.promise;
			},

			delete: function (quote) {
				var deferred = $q.defer();

				store.quotes.splice(store.quotes.indexOf(quote), 1);

				store._saveToLocalStorage(store.quotes);
				deferred.resolve(store.quotes);

				return deferred.promise;
			},

			get: function () {
				var deferred = $q.defer();

				angular.copy(store._getFromLocalStorage(), store.quotes);
				deferred.resolve(store.quotes);

				return deferred.promise;
			},

			insert: function (quote) {
				var deferred = $q.defer();

				store.quotes.push(quote);

				store._saveToLocalStorage(store.quotes);
				deferred.resolve(store.quotes);

				return deferred.promise;
			},

			put: function (quote, index) {
				var deferred = $q.defer();

				store.quotes[index] = quote;

				store._saveToLocalStorage(store.quotes);
				deferred.resolve(store.quotes);

				return deferred.promise;
			}
		};

		return store;
	});