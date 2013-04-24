/**
 * Модуль для получения списка JSON-данных с сервера
 */
define(
['utils', 'api'], 
/**
 * @constructor
 * @memberOf __feedModule
 * @param {utilsModule} utils
 * @param {apiModule} api
 */
function(utils, api) {
	var urls = {
		'splash':         '/api/app/splash_simple/',
		'category_posts': {url: '/api/app/get_category_posts/', params: {count: 40, exclude: 'comments,attachments'}},
		'comments':       '/api/app/comments/',
		'post':           {url: '/api/core/get_post/', params: {exclude: 'comments,attachments'}}
	};

	var cacheEnabled = true;

	/**
	 * Кэш всех полученных постов с сервера. Ключом является ID поста
	 * @type {Object}
	 */
	var cachedPosts = {};

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
		 * @memberOf feedModule
		 * @param  {String}   name     Название потока
		 * @param {Object} params Дополнительные параметры для запроса
		 * @param  {Function} callback Функция, в которую вернётся результат
		 */
		get: function(name) {
			var callback = _.last(arguments);
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
				
				return api.request(url, params, function(status, data) {
					if (status) {
						var posts = data.posts || [];
						if (data.post) {
							posts.push(data.post);
						}
						
						// сохраняем посты в кэш
						_.each(posts, function(item) {
							cachedPosts[item.id] = utils.transformPost(item);
						});

						if (data.app) {
							cachedPosts[data.app.id] = utils.transformPost(data.app);
						}

						if (cacheEnabled) {
							cache[cacheKey] = data;
						}
					}

					callback(data);
				}, {delayTimeout: withDelay});
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
			return cachedPosts[id];
		},
	};
});