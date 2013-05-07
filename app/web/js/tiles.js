/**
 * Модуль для вывода данных в виде плиток
 */
define(
['require', 'utils', 'image-preloader', 'auth'], 
function(require, utils, imagePreloader, auth) {
	function renderFeed(data, options) {
		options = _.extend({
			waitImages: false,
			classNames: '',
			tiles: data,
			user: auth.getUserInfo()
		}, options || {});

		var feed = $(utils.render('tiles', options))
			.appendTo(document.body);

		var tileLookup = {};
		var images = feed.find('.tiles__item').map(function(i, tile) {
			var t = $(tile);
			var img = t.attr('data-image');
			if (!tileLookup[img]) {
				tileLookup[img] = [];
			}

			t.attr('data-size', tile.offsetWidth + 'x' + tile.offsetHeight);
			tileLookup[img].push(tile);
			// tileLookup[img] = tile;
			return img;
		});

		function getScaleRatio(ctx) {
			var devicePixelRatio = window.devicePixelRatio || 1;
			var backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
			return devicePixelRatio / backingStoreRatio;
		}

		function placeImage1(src, parent, size) {
			parent.style.backgroundImage = 'url(' + src + ')';
		}

		function placeImage2(src, parent, size) {
			var coeff = utils.getScaleCoeff(parent, size);
			var targetSize = {
				width: Math.ceil(size.width * coeff),
				height: Math.ceil(size.height * coeff),
			};
					
			parent.style.backgroundImage = 'url(' + src + ')';
		}

		// var cv = document.createElement('canvas');
		// document.body.appendChild(cv);

		imagePreloader.getSize(images, function(src, size, image) {
			if (src === 'complete') {
				if (options.waitImages && options.callback) {
					options.callback(feed);
				}
			} else {
				_.each(tileLookup[src], function(parent) {
					// return;
					parent.style.backgroundImage = 'url(' + src + ')';
					return;
					// parent.style.backgroundSize = targetSize.width + 'px ' + targetSize.height + 'px';

					var coeff = utils.getScaleCoeff(parent, size);
					var targetSize = {
						width: Math.ceil(size.width * coeff),
						height: Math.ceil(size.height * coeff),
					};

					var imgToAppend = null;

					// пытаемся оптимизировать отображение картинок
					// var cv = document.createElement('canvas');
					// cv.className = 'tiles__image';
					// var ctx = cv.getContext('2d');
					// var ratio = getScaleRatio(ctx);

					// cv.width = targetSize.width;
					// cv.height = targetSize.height;
					// // ctx.scale(ratio, ratio);

					// try {
					// 	ctx = cv.getContext('2d');
					// 	ctx.drawImage(image, 0, 0, targetSize.width, targetSize.height);
					// 	// parent.style.backgroundImage = 'url(' + cv.toDataURL('image/jpeg', 0.7) + ')';
					// 	imgToAppend = new Image();
					// 	imgToAppend.src = cv.toDataURL();
					// 	imgToAppend.className = 'tiles__image unscaled';
					// 	parent.appendChild(imgToAppend);
					// } catch(e) {
					// 	console.log(e);
						imgToAppend = image.cloneNode(true);
						utils.centerImage(imgToAppend, size, targetSize);
						imgToAppend.className += ' tiles__image';
						parent.appendChild(imgToAppend);
					// }

					// cv = ctx = imgToAppend = null;
					


					// 
					// var img = image.cloneNode(true);
					// utils.centerImage(img, size, parent);
					// img.className = 'tiles__image';
					// parent.appendChild(img);

					// var ctx = cv.getContext('2d');
					// ctx.clearRect(0, 0, targetSize.width, targetSize.height);
					// ctx.drawImage(image, 0, 0, targetSize.width, targetSize.height);
					// parent.appendChild(cv);
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
			var mainPayload = feed.slice(0, 3);
			var restPayload = feed.slice(3);
			var itemsPerPage = 6;

			var totalPages = 1 + Math.ceil(restPayload.length / itemsPerPage);
			var pageCount = 1;

			reel.append(renderFeed(mainPayload, {
				classNames: 'tiles_main',
				pageNumber: 1,
				totalPages: totalPages
			}));
			
			for (var i = 0; i < restPayload.length; i += itemsPerPage) {
				reel.append(renderFeed(restPayload.slice(i, i + itemsPerPage), {
					pageNumber: ++pageCount,
					totalPages: totalPages
				}));
			}

			return reel[0];
		}
	};
});