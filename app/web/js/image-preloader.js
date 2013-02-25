/**
 * Модуль загружает набор картинок и возвращает
 * размер каждой картинки в callback-функцию.
 * Размеры загруженных картинок кэшируются
 */
define(['utils'], function(utils) {
	/* Кэш загруженных картинок */
	var cache = {};

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
		getSize: function(images, callback) {
			if (!_.isArray(images)) {
				images = [images];
			}

			images = _.flatten(images);
			var onLoad = function() {
				var src = this._src;
				cache[src] = {
					width: this.naturalWidth,
					height: this.naturalHeight
				};

				imageLoaded(src, cache[src], this);
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
				if (img in cache) {
					imageLoaded(img, cache[img]);
				} else {
					var image = new Image;
					image.onload = onLoad;
					image._src = image.src = img;
				}
			});
		},

		resetCache: function() {
			cache = {};
		}
	};
});