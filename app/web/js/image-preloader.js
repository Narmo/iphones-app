/**
 * Модуль загружает набор картинок и возвращает
 * размер каждой картинки в callback-функцию.
 * Размеры загруженных картинок кэшируются
 */
define(['utils'], function(utils) {
	/* Кэш загруженных картинок */
	var sizeCache = {};
	var loadCache = {};

	return {
		/**
		 * Получение размеров указанных картинок. На каждую
		 * картинку из массива <code>images</code> вызывается
		 * функция <code>callback</code>, в которую в качестве 
		 * аргументов передаются путь к картинке, её размер и сам объект картинки
		 * (класс Image).
		 *
		 * После того, как все картинки были загружены, функция <code>callback</code>
		 * вызывается с единственным параметром <code>'complete</code>
		 * 
		 * @param  {Array}   images   Список картинок, которые нужно загрузить
		 * @param  {Function} callback 
		 */
		getSizeOld: function(images, callback) {
			if (!_.isArray(images)) {
				images = [images];
			}

			images = _.flatten(images);
			var onLoad = function() {
				var src = this._src;
				sizeCache[src] = {
					width: this.naturalWidth,
					height: this.naturalHeight
				};

				imageLoaded(src, sizeCache[src], this);
			};

			var imageLoaded = function(src, size, image) {
				if (!image) {
					image = new Image;
					image.src = src;
				}

				images = _.without(images, src);
				callback(src, size, image);

				if (!images.length) {
					callback('complete');
				}
			}

			_.each(images, function(img) {
				if (img in sizeCache) {
					imageLoaded(img, sizeCache[img]);
				} else {
					var image = new Image;
					image.onload = onLoad;
					image._src = image.src = img;
				}
			});
		},

		getSize: function(images, callback) {
			callback = callback || _.noop;
			images = _.flatten(!_.isArray(images) ? [images] : images);

			var next = function() {
				if (!images.length) {
					return callback('complete');
				}

				var img = images.shift();
				if (!img) {
					return next();
				}

				if (sizeCache[img]) {
					imageLoaded(img, sizeCache[img]);
				} else {
					var image = new Image;
					image.onload = onLoad;
					image._src = image.src = img;
				}
			};

			var onLoad = function() {
				var src = this._src;
				sizeCache[src] = {
					width: this.naturalWidth,
					height: this.naturalHeight
				};

				imageLoaded(src, sizeCache[src], this);
			};

			var imageLoaded = function(src, size, image) {
				if (!image) {
					image = new Image;
					image.src = src;
				}

				callback(src, size, image);
				next();
			}

			next();
		},

		resetCache: function() {
			sizeCache = {};
		},

		/**
		 * @param {Array} images
		 */
		addImages: function(images) {
			images.forEach(function(img) {
				if (!sizeCache[img]) {
					sizeCache[img] = null;
				}
			});
		},

		preloadImages: function(images, callback) {
			this.getSize(images, function(status) {
				if (status === 'complete' && callback) {
					callback();
				}
			});
		}
	};
});