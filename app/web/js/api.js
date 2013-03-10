/**
 * Модуль для взаимодействия с сайтом: шлёт запросы на сайт и разбирает ответ
 */
define(['notifier'], function(notifier) {
	var domain = 'http://www.iphones.ru';
	
	/**
	 * @param {String} url
	 * @returns {String}
	 */
	function transformUrl(url) {
		if (!/^https?:/.test(url)) {
			var _domain = domain;
			if (/submit_comment|get_nonce|generate_auth_cookie|get_currentuserinfo/.test(url)) {
				_domain = 'http://localhost:8104';
			}
			
			url = _domain + url;
		}
		
		return url;
	}
	
	return {
		/**
		 * @memberOf apiModule
		 * @param {String} url Адрес, откуда нужно получать данные
		 * @param {Object} data Данные для отправки
		 * @param {Function} callback Функция, которая вызывается после получения
		 * ответа. В функцию первым параметром передаётся статус ответа 
		 * (<code>true</code>/<code>false</code> в зависимости от успешности
		 * выполнения запроса), а вторым параметром либо данные ответа (если 
		 * запрос успешный), либо сообщение об ошибке
		 * @param {Object} options Дополнительные параметры для запроса
		 */
		request: function(url, data, callback, options) {
			var args = _.toArray(arguments);
			if (_.isFunction(args[1])) {
				callback = args[1];
				data = null;
			}
			
			if (_.isFunction(_.last(args))) {
				options = {};
			}
			
			$.ajax({
				url: transformUrl(url),
				dataType: 'jsonp',
				data: data,
				success: function(response) {
					if (response && response.status != 'error') {
						callback(true, response);
					} else {
						callback(false, response.error);
					}
				},
				error: function() {
					callback(false);
				}
			});
		}
	};
});