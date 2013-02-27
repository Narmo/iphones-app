require(
	['article', 'utils', 'feed', 'splash', 'comments-list', 'nav-history', 'article-reel'], 
	function(article, utils, feed, splash, commentsList, nav, articleReel) {


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

	splash.create(function(tiles) {
		// фиксируем плитки как страницу приложения,
		// на которую можно вернуться
		nav.go(tiles);	
	});
	

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
			case 'show_category_for_post':
				var post = feed.getPost(params);
				var cat = utils.getKnownCategory(post) || post.categories[0];
				feed.get('category_posts', {slug: cat.slug}, function(data) {
					if (data && data.posts) {
						nav.go(articleReel.create(cat.title, data.posts));
					}
				});
				break;
			case 'show_post':
				var post = feed.getPost(params);
				nav.go(article.create(post));
				break;
		}

	});
	
});