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
	
});