/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the quotesStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('quotes')
	.controller('QuoteCtrl', function QuoteCtrl($scope, $routeParams, $filter, store) {
		'use strict';

		var quotes = $scope.quotes = store.quotes;

		$scope.newQuote = '';
		$scope.editedQuote = null;

		$scope.$watch('quotes', function () {
			$scope.remainingCount = $filter('filter')(quotes, { completed: false }).length;
			$scope.completedCount = quotes.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
		}, true);

		// Monitor the current route for changes and adjust the filter accordingly.
		$scope.$on('$routeChangeSuccess', function () {
			var status = $scope.status = $routeParams.status || '';
			$scope.statusFilter = (status === 'active') ?
				{ completed: false } : (status === 'completed') ?
				{ completed: true } : {};
		});

		$scope.addQuote = function () {
			var newQuote = {
				title: $scope.newQuote.trim(),
				completed: false
			};

			if (!newQuote.title) {
				return;
			}

			$scope.saving = true;
			store.insert(newQuote)
				.then(function success() {
					$scope.newQuote = '';
				})
				.finally(function () {
					$scope.saving = false;
				});
		};

		$scope.editQuote = function (quote) {
			$scope.editedQuote = quote;
			// Clone the original todo to restore it on demand.
			$scope.originalQuote = angular.extend({}, quote);
		};

		$scope.saveEdits = function (quote, event) {
			// Blur events are automatically triggered after the form submit event.
			// This does some unfortunate logic handling to prevent saving twice.
			if (event === 'blur' && $scope.saveEvent === 'submit') {
				$scope.saveEvent = null;
				return;
			}

			$scope.saveEvent = event;

			if ($scope.reverted) {
				// Quote edits were reverted-- don't save.
				$scope.reverted = null;
				return;
			}

			quote.title = quote.title.trim();

			if (quote.title === $scope.originalQuote.title) {
				$scope.editedQuote = null;
				return;
			}

			store[quote.title ? 'put' : 'delete'](quote)
				.then(function success() {}, function error() {
					quote.title = $scope.originalQuote.title;
				})
				.finally(function () {
					$scope.editedQuote = null;
				});
		};

		$scope.revertEdits = function (quote) {
			quotes[quotes.indexOf(quote)] = $scope.originalQuote;
			$scope.editedQuote = null;
			$scope.originalQuote = null;
			$scope.reverted = true;
		};

		$scope.removeQuote = function (quote) {
			store.delete(quote);
		};

		$scope.saveQuote = function (quote) {
			store.put(quote);
		};

		$scope.toggleCompleted = function (quote, completed) {
			if (angular.isDefined(completed)) {
				quote.completed = completed;
			}
			store.put(quote, quotes.indexOf(quote))
				.then(function success() {}, function error() {
					quote.completed = !quote.completed;
				});
		};

		$scope.clearCompletedQuotes = function () {
			store.clearCompleted();
		};

		$scope.markAll = function (completed) {
			quotes.forEach(function (quote) {
				if (quote.completed !== completed) {
					$scope.toggleCompleted(quote, completed);
				}
			});
		};
	});