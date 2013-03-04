;(function(undefined){
	var delayTimeout = 2000;

	/**
	 * Плагин, который делает ajax-запрос на сервер, но отвечает не ранее, чем
	 * через определённый таймаут. Этот подход удобно использовать, когда
	 * пользователю нужно показать процесс отправки данных на сервер (например, через
	 * прелоудер), но интернет слишком быстрый и запрос отрабатывает за доли секунды
	 * @param {String} url
	 * @param {Object} options
	 * @memberOf jQuery
	 */
	$.delayedAjax = function(url, options) {
		var response = null;
		var success = true;
		var timerFinished = false;
		var requestComplete = false;

		options = options || {};
		if (_.isString(url)) {
			options.url = url;	
		} else {
			// url should be object
			options = url;
		}

		var onComplete = function() {
			if (requestComplete && timerFinished) {
				if (success) {
					if (options.success) {
						options.success.apply(options, response);
					}
				} else if (options.error) {
					options.error.apply(options, response);
				}

				if (options.complete) {
					options.complete.apply(options, response);
				}
			}
		};

		var timeout = 'delayTimeout' in options ? options.delayTimeout : delayTimeout;

		if (!timeout) {
			timerFinished = true;
		} else {
			setTimeout(function() {
				timerFinished = true;
				onComplete();
			}, timeout);
		}

		$.ajax(_.extend({}, options, {
			success: function() {
				response = _.toArray(arguments);
			},
			error: function() {
				response = _.toArray(arguments);
				success = false;
			},
			complete: function() {
				requestComplete = true;
				onComplete();
			}
		}));
	};
})();