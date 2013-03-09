/**
 * Модуль для хранения данных пользовательских данных на клиенте
 */
define(function() {
	return {
		/**
		 * @memberOf storageModule
		 * @param {String} name
		 * @param {String} value
		 */
		set: function(name, value) {
			localStorage.setItem(name, value);
		},
		
		/**
		 * @param {String} name
		 * @returns {String}
		 */
		get: function(name) {
			return localStorage.getItem(name);
		},
		
		/**
		 * 
		 * @param name
		 * @returns
		 */
		remove: function(name) {
			localStorage.removeItem(name);
		}
	};
});