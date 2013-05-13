/**
 * Вспомогательный модуль для работы с сетевым подключением:
 * проверяет, есть ли сеть в данный момент 
 */
define(['notifier'], function(notifier) {
	var module = {
		__online: true,

		/**
		 * @return {Boolean} Вернёт <code>true</code>, если 
		 * есть подключение к интернету
		 */
		available: function() {
			return this.__online && navigator.onLine;
		},

		/**
		 * Метод проверяет, есть ли интернет, и если его нет –
		 * покажет сообщение
		 * @return {Boolean} Вернёт <code>true</code>, если есть интернет
		 */
		ensureOnline: function() {
			if (!this.available()) {
				notifier.error('Для работы приложение требуется активное подключение к интернету');
				return false;
			}

			return true;
		}
	};

	window.addEventListener('offline', function(e) {
		module.trigger('offline');
	});

	window.addEventListener('online', function(e) {
		module.trigger('online');
	});

	return _.extend(module, _.events);
});