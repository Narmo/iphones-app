/**
 * Модуль для вывода данных в виде плиток
 */
define(['require', 'utils', 'image-preloader'], function(require, utils, imagePreloader) {
	function renderFeed(data, options) {
		options = _.extend({
			waitImages: false,
			classNames: '',
			tiles: data
		}, options || {});

		var feed = $(utils.render('tiles', options))
			.appendTo(document.body);

		var tileLookup = {};
		var images = feed.find('.tiles__item').map(function(i, tile) {
			var img = $(tile).attr('data-image');
			if (!tileLookup[img]) {
				tileLookup[img] = [];
			}

			tileLookup[img].push(tile);
			// tileLookup[img] = tile;
			return img;
		});

		imagePreloader.getSize(images, function(src, size, image) {
			if (src === 'complete') {
				if (options.waitImages && options.callback) {
					options.callback(feed);
				}
			} else {
				var parent = tileLookup[src];
				_.each(tileLookup[src], function(parent) {
					var img = image.cloneNode(true);
					utils.centerImage(img, size, parent);
					img.className = 'tiles__image';
					parent.appendChild(img);
				});
				
			}
		});

		return feed;
	}

	/**
	 * Возвращает данные для главного блока плиток
	 * @param  {Array} feed Весь поток сплэш-страницы
	 * @return {Array}
	 */
	function getMainTiles(feed) {
		feed = feed.slice(0, 3);
		var categoryHints = ['', 'appstore', 'accessories'];
		return _.map(feed, function(post, i) {
			var cat = _.find(post.categories, function(c) {
				return c.slug == categoryHints[i];
			});

			return cat ? _.extend({}, post, {title: cat.title}) : post;
		});
	}

	return {
		/**
		 * Отрисовывает поток данных в виде плиток.
		 * @param  {Array} feed Данные для отрисовки (обычно JSON-поток новостей)
		 * @return {Element} DOM-элемент с блоками плиток
		 */
		create: function(feed) {
			var reel = $('<div class="tiles-reel"></div>').appendTo(document.body);
			var mainPayload = getMainTiles(feed);
			var restPayload = feed.slice(3);
			var itemsPerPage = 6;

			var totalPages = 1 + Math.ceil(restPayload.length / itemsPerPage);

			reel.append(renderFeed(mainPayload, {
				classNames: 'tiles_main',
				pageNumber: 1,
				totalPages: totalPages
			}));
			
			for (var i = 0; i < restPayload.length; i += itemsPerPage) {
				reel.append(renderFeed(restPayload.slice(i, i + itemsPerPage), {
					pageNumber: 2 + i,
					totalPages: totalPages
				}));
			}

			return reel[0];
		}
	};
});