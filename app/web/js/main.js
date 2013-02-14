require(['article', 'utils', 'feed', 'tiles'], function(article, utils, feed, tiles) {

	// получаем основную ленту и отрисовываем её
	feed.get('main', function(data) {
		var mainTiles = $(tiles.create(data))
			.on('pointertap', '.tiles__item', function(evt) {
				var itemId = $(this).attr('data-feed-id');
				var feedData = _.find(feed, function(item) {
					return item.id == itemId;
				});

				if (feedData) {
					console.log('render', feedData)
					$(document.body)
						.append(article.create(feedData))
						.addClass('article-mode');
				}
			});

		swype.setup(_.toArray(mainTiles.find('.tiles')), {
			active: 1,
			viewport: mainTiles[0],
			tapzone: 0
		});
	});

	swype.addPointerTest(function() {
		// TODO блокировать swype в нужный момент
		return !$(document.body).hasClass('article-mode');
	});
});