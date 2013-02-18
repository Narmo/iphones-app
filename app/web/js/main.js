require(['article', 'utils', 'feed', 'tiles', 'comments-list'], function(article, utils, feed, tiles, commentsList) {

	// получаем основную ленту и отрисовываем её
	feed.get('main', function(data) {
		var mainTiles = $(tiles.create(data))
			.on('pointertap', '.tiles__item', function(evt) {

				var itemId = $(this).attr('data-feed-id');
				var feedData = _.find(data, function(item) {
					return item.id == itemId;
				});

				if (feedData) {
					$(document.body)
						.append(article.create(feedData))
						.addClass('article-mode');
				}
			})
			.on('pointertap', '.tiles__comments', function(evt) {
				var itemId = $(this).closest('.tiles__item').attr('data-feed-id');
				var feedData = _.find(data, function(item) {
					return item.id == itemId;
				});

				feed.get('comments', function(comments) {
					$(document.body)
						.append(commentsList.create({
							title: feedData.title,
							comments: comments
						}))
						.addClass('article-mode');
				});

				evt.stopImmediatePropagation();
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