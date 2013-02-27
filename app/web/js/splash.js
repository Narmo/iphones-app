/*
 * Контроллер для работы со сплэш-страницей
 */
define(
	['feed', 'tiles', 'utils'], 
	function(feed, tiles, utils) {

	return {
		create: function(callback) {
			feed.get('splash', function(data) {
				var transitionGroup = null;

				var mainTiles = $(tiles.create(data.posts))
					.on('history:attach', function() {
						if (transitionGroup) {
							transitionGroup.destroy();
						}

						transitionGroup = swype.setup(_.toArray(mainTiles.find('.tiles')), {
							active: 1,
							viewport: mainTiles[0],
							tapzone: 0
						});
					})
					.on('history:detach', function() {
						if (transitionGroup) {
							transitionGroup.destroy();
						}
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