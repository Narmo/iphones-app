/**
 * Модуль, отвечающий за добавление и инициализацию механизма переворачивания
 * страниц для указанного контейнера
 */
define(function() {
	return {
		attach: function(container, items, options) {
			var group = null;

			container = $(container);
			options = options || {};

			var createSwypeGroup = function() {
				if (!group) {
					var elems = _.isString(items) ? container.find(items) : items;
					group = swype.setup(_.toArray(elems), _.extend({
						viewport: container[0],
						tapzone: 0,
						// active: 1,
						optimizeLayout: true
					}, options || {}));
				}
			}

			if (options.swypeOnInit) {
				createSwypeGroup();
			}

			container
				.on('history:attach', function() {
					createSwypeGroup();
					group.locked(false);
				})
				.on('history:detach', function() {
					if (group) {
						group.locked(true);
					}
				})
				.on('history:remove', function() {
					if (group) {
						group.destroy();
						group = null;
					}
				});

			return group;
		}
	};
});