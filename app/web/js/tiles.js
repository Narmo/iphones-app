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
			tileLookup[img] = tile;
			return img;
		});

		imagePreloader.getSize(images, function(src, size, image) {
			if (src === 'complete') {
				if (options.waitImages && options.callback) {
					options.callback(feed);
				}
			} else {
				// считаем правильные габариты картинки
				var parent = tileLookup[src];
				var vp = {
					width: parent.offsetWidth,
					height: parent.offsetHeight
				};

				var coeff = utils.getScaleCoeff(vp, size);
				var transformCSS = Modernizr.prefixed('transform');
				image.style[transformCSS] = 'translate(-50%, -50%) scale(' + coeff + ')';
				image.className = 'tiles__image';
				parent.appendChild(image);
			}
		});

		return feed;
	}


	return {
		/**
		 * Отрисовывает поток данных в виде плиток.
		 * @param  {Array} feed Данные для отрисовки (обычно JSON-поток новостей)
		 * @return {Element} DOM-элемент с блоками плиток
		 */
		create: function(feed) {
			var reel = $('<div class="tiles-reel"></div>').appendTo(document.body);

			reel.append(renderFeed(feed.slice(0, 3), {
				classNames: 'tiles_main'
			}));

			var restPayload = feed.slice(3);
			var itemsPerPage = 6;
			for (var i = 0; i < restPayload.length; i += itemsPerPage) {
				reel.append(renderFeed(restPayload.slice(i, i + itemsPerPage)));
			}

			var emptySection = '<div class="tiles swype-empty"></div>';
			reel.prepend(emptySection).append(emptySection);

			return reel[0];
		}
	};
});