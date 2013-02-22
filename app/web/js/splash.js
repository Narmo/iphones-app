/*
 * Контроллер для работы со сплэш-страницей
 */
define(
	['feed', 'tiles', 'utils', 'nav-history', 'article', 'article-reel'], 
	function(feed, tiles, utils, nav, article, articleReel) {
	// // swype.addPointerTest(function() {
	// 	// TODO блокировать swype в нужный момент
	// 	return !$(document.body).hasClass('article-mode');
	// });
	// 

	return {
		create: function() {
			feed.get('splash', function(data) {
				// индексируем данные и подгоняем их под нужный формат
				var postsLookup = {};
				var posts = _.map(data.posts, function(p) {
					p = _.clone(p);
					p.realId = p.id;
					p.id = _.uniqueId('splash');
					postsLookup[p.id] = p;

					return utils.transformPost(p);
				});


				var mainTiles = $(tiles.create(posts))
					.on('pointertap', '.tiles__item', function(evt) {

						var itemId = $(this).attr('data-feed-id');
						var post = postsLookup[itemId];

						if ($(evt.target).closest('.tiles__comments').length) {
							// тапнули на комментарий
							console.log('show comments');
							// showComments(feedData);
						} else if (post) {
							console.log('show article');
							if (post.type == 'page') {
								// тапнули на обычную страницу, покажем её содержимое
								nav.go(article.create(post));	
							} else {
								// покажем ленту новостей для указанной категории
								var cat = utils.getKnownCategory(post) || post.categories[0];
								feed.get('category_posts', {slug: cat.slug}, function(data) {
									if (data && data.posts) {
										nav.go(articleReel.create(cat.title, data.posts));
									}
									console.log('received', data);
								});
							}
							
						}
					});

				swype.setup(_.toArray(mainTiles.find('.tiles')), {
					active: 1,
					viewport: mainTiles[0],
					tapzone: 0
				});

				// фиксируем плитки как страницу приложения,
				// на которую можно вернуться
				nav.go(mainTiles);
			});
		}
	};
});