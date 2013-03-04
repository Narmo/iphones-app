/**
 * Модуль для получения списка JSON-данных с сервера
 */
define(['utils'], function(utils) {
	// var domain = 'http://localhost:8104';
	var domain = 'http://www.iphones.ru';
	var urls = {
		'splash':         domain + '/api/app/splash/',
		'category_posts': {url: domain + '/api/core/get_category_posts/', params: {count: 10}},
		'comments':       domain + '/api/app/comments/'
	};

	var cacheEnabled = true;

	/**
	 * Кэш всех полученных постов с сервера. Ключом является ID поста
	 * @type {Object}
	 */
	var posts = {};

	var cache = {};

	function createCacheKey(url, params) {
		var key = url;
		var p = _.map(params, function(v, k) {
			return k + '=' + v;
		});

		if (p.length) {
			key += '?' + p.join('&');
		}

		return key;
	}

	return {
		/**
		 * Получает указанный поток с сервера и возвращает его 
		 * в функцию <code>callback</code>
		 * @param  {String}   name     Название потока
		 * @param {Object} params Дополнительные параметры для запроса
		 * @param  {Function} callback Функция, в которую вернётся результат
		 */
		get: function(name) {
			callback = _.last(arguments);
			var params = arguments.length > 2 ? arguments[1] : {};

			if (name in urls) {
				var url, defParams;
				if (_.isString(urls[name])) {
					url = urls[name];
					defParams = {};
				} else {
					url = urls[name].url;
					defParams = urls[name].params || {};
				}

				params = _.extend({}, defParams, params);

				// хотим получить свежие данные с сервера мимо кэша
				var useCache = cacheEnabled;
				if (params.nocache) {
					useCache = false;
					delete params.nocache;
				}

				// хотим получить данные с задержкой, чтобы показать анимацию
				var withDelay = 0;
				if (params.withDelay) {
					withDelay = params.withDelay;
					delete params.withDelay;
				}

				var cacheKey = createCacheKey(url, params);

				if (useCache && cacheKey in cache) {
					return callback(cache[cacheKey]);
				}

				return $.delayedAjax({
					url: url,
					data: params,
					delayTimeout: withDelay,
					dataType: 'jsonp',
					success: function(data) {
						if (data && data.status == 'ok' && data.posts) {
							// сохраняем все посты в кэш
							_.each(data.posts, function(item) {
								posts[item.id] = utils.transformPost(item);
							});

							if (cacheEnabled) {
								cache[cacheKey] = data;
							}
						}

						callback(data);
					}
				});
			} else {
				throw 'Unknown feed "' + name + '"';
			}
		},

		/**
		 * Возвращает информацию о закэшированном посте
		 * @param  {String} id ID поста
		 * @return {Object}
		 */
		getPost: function(id) {
			return posts[id];
		}
	};
});