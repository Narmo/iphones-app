/**
 * Модуль для вывода данных в виде плиток
 */
define(['require', 'utils'], function(require, utils) {
	function renderFeed(data, options) {
		options = _.extend({
			waitImages: false,
			classNames: '',
			tiles: data
		}, options || {});

		var feed = $(utils.render('tiles', options))
			.appendTo(document.body);

		var complete = function() {
			if (options.callback) {
				options.callback(feed);
			}
		};

		var images = [];
		var onLoad = function() {
			// считаем правильные габариты картинки
			var parent = this.parentNode;
			var vp = {
				width: parent.offsetWidth,
				height: parent.offsetHeight
			};

			var img = {
				width: this.naturalWidth,
				height: this.naturalHeight
			}

			// var coeff = Math.min(getScaleCoeff(vp, img), 1);
			// this.style.width = Math.round(coeff * img.width) + 'px';
			// this.style.height = Math.round(coeff * img.height) + 'px';
			var coeff = utils.getScaleCoeff(vp, img);
			var transformCSS = Modernizr.prefixed('transform');
			this.style[transformCSS] = 'translate(-50%, -50%) scale(' + coeff + ')';			

			images = _.without(images, this);
			if (!images.length && options.waitImages) {
				complete();
			}
		};

		feed.find('.tiles__item').each(function(i, tile) {
			tile = $(tile);

			if (tile.attr('data-image')) {
				var img = new Image;
				img.className = 'tiles__image';
				img.onload = onLoad;
				img.src = tile.attr('data-image');

				images.push(img);
				tile.append(img);
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