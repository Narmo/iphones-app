/*
 * Контроллер для работы со сплэш-страницей
 */
define(
	['feed', 'tiles', 'utils', 'flipper'], 
	function(feed, tiles, utils, flipper) {

	function renderTiles(data) {
		var result = $(tiles.create(data));

		// вешаем триггеры на плитку
		tiles.find('.tiles__item').each(function() {
			var tile = $(this);
			var itemId = $(this).attr('data-feed-id');
			var post = feed.getPost(itemId);
			var trigger = (post.type == 'page' ? 'show_post:' : 'show_category_for_post:') + itemId;
			tile.attr('data-trigger', trigger);
		});

		return tiles;
	}

	return {
		/**
		 * Генерирует данные для главной страницы приложения
		 * @param  {Function} callback
		 */
		create: function(callback) {
			feed.get('splash', function(data) {
				var mainTiles = renderTiles(data.posts);
				flipper.attach(mainTiles, '.tiles');
				if (callback) {
					callback(mainTiles);
				}
			});
		},

		/**
		 * Обновляет плитки для клавной страницы: запрашивает данные с сервера
		 * и, при необходимости, переделывает страницы с новыми данными
		 * @param {Element} elem Контейнер с плитками, который нужно обновить
		 * @param {Function} callback
		 */
		reload: function(elem, callback) {
			// получаем идентификаторы последних новостей
			elem = $(elem);
			var curIds = elem.find('.tiles__item').map(function(i, tile) {
				return $(tile).attr('data-feed-id');
			});

			feed.get('splash', {nocache: true}, function(data) {
				var isUpdated = !!_.find(data.posts, function(post, i) {
					return post.id != curIds[i];
				});

				if (isUpdated) {
					var 
				} else {
					// ничего не поменялось: на всякий случай обновим количество
					// комментариев
					elem.find('.tiles__item').each(function(i, tile) {
						tile = $(tile);
						var post = feed.getPost(tile.attr('data-feed-id'));
						tile.find('.icon_comment').text(post.comment_count);
					});
					callback(elem);
				}
			});
		}
	};
});