/*
 * Контроллер для работы со сплэш-страницей
 */
define(
	['feed', 'tiles', 'utils', 'flipper'], 
	function(feed, tiles, utils, flipper) {

	return {
		create: function(callback) {
			feed.get('splash', function(data) {
				var mainTiles = $(tiles.create(data.posts));

				flipper.attach(mainTiles, '.tiles', {
					active: 1
				});

				// вешаем триггеры на плитку
				mainTiles.find('.tiles__item').each(function() {
					var tile = $(this);
					var itemId = $(this).attr('data-feed-id');
					var post = feed.getPost(itemId);
					var trigger = (post.type == 'page' ? 'show_post:' : 'show_category_for_post:') + itemId;
					tile.attr('data-trigger', trigger);
				});

				if (callback) {
					callback(mainTiles);
				}
			});
		}
	};
});