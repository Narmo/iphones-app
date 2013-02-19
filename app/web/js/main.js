require(
	['article', 'utils', 'feed', 'tiles', 'comments-list', 'nav-history'], 
	function(article, utils, feed, tiles, commentsList, nav) {


	/**
	 * Показываем комментарии для указанной статьи
	 * @param  {Object} article Объект с информацией о статье
	 */
	function showComments(article) {
		feed.get('comments', function(comments) {
			nav.go(commentsList.create({
				title: article ? article.title : '',
				comments: comments
			}));
		});
	}

	// получаем основную ленту и отрисовываем её
	feed.get('main', function(data) {
		var mainTiles = $(tiles.create(data))
			.on('pointertap', '.tiles__item', function(evt) {

				var itemId = $(this).attr('data-feed-id');
				var feedData = _.find(data, function(item) {
					return item.id == itemId;
				});

				if ($(evt.target).closest('.tiles__comments').length) {
					// тапнули на комментарий
					showComments(feedData);
				} else if (feedData) {
					nav.go(article.create(feedData, {
						onOptionTap: function(evt) {
							if ($(evt.target).closest('.icon_comment').length) {
								showComments(feedData);
							}
						}
					}));
				}
			});

		swype.setup(_.toArray(mainTiles.find('.tiles')), {
			active: 1,
			viewport: mainTiles[0],
			tapzone: 0
		});

		// фиксируем плитки как главную страницу
		nav.go(mainTiles);
	});

	// swype.addPointerTest(function() {
	// 	// TODO блокировать swype в нужный момент
	// 	return !$(document.body).hasClass('article-mode');
	// });
});