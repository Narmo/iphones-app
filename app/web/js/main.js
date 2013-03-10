require(
['article', 'utils', 'feed', 'splash', 'comments', 'nav-history', 'article-reel', 'auth'],
/**
 * @param {authModule} auth
 * @param {commentsModule} comments
 */
function(article, utils, feed, splash, comments, nav, articleReel, auth) {

	splash.create(function(tiles) {
		// фиксируем плитки как страницу приложения,
		// на которую можно вернуться
		nav.go(tiles);	
	});
	
	// после авторизации обновляем все данные на странице
	auth
		.on('authorized', function() {
			auth.updateUserInfo();
			$(document.body).addClass('authorized');
		})
		.on('logout', function() {
			$(document.body).removeClass('authorized');
		});
	
	// попробуем залогинить пользователя
	auth.check();

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

		// console.log('handle trigger', command, params);
		switch (command) {
			case 'show_comments':
				comments.showForPost(params);
				break;

			case 'show_category_for_post':
				var post = feed.getPost(params);
				var cat = utils.getKnownCategory(post) || post.categories[0];
				feed.get('category_posts', {slug: cat.slug}, function(data) {
					if (data && data.posts) {
						articleReel.create(cat.title, data.posts, {
							complete: function(reel) {
								nav.go(reel);
							}
						});
						// nav.go(reel);
					}
				});
				break;

			case 'show_post':
				var post = feed.getPost(params);
				nav.go(article.create(post));
				break;

			case 'reload_splash':
				var oldReel = $('.tiles-reel');
				splash.reload($('.tiles-reel'), function(newReel) {
					if (newReel) {
						// лента обновилась, заменим её в истории
						nav.replace(oldReel[0], newReel[0]);
					}
				});
				break;
				
			case 'authorize':
				auth.show();
				break;
				
			case 'add_comment':
				comments.showForm(_.isObject(params) ? params : {post_id: params});
				break;
		}
	});
});