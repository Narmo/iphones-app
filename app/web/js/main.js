require(
	['article', 'utils', 'feed', 'splash', 'comments-list', 'nav-history'], 
	function(article, utils, feed, splash, commentsList, nav) {


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

	splash.create();

	/**
	 * Универсальный хэндлер событий, который позволяет выполнять стандартные 
	 * действия для большинства контролов, вроде отображения комментариев или
	 * статьи
	 */
	$(document).on('pointertap', '[data-trigger]', function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();

		

		var parts = $(this).attr('data-trigger').split(':');
		var command = parts.shift();
		var params = parts.join(':');
		if (params && params.charAt(0) == '{') {
			params = JSON.parse(params);
		}

		console.log('handle trigger', command, params);
		switch (command) {
			case 'show_comments':
				commentsList.showForPost(params);
				break;
		}

	});
	
});