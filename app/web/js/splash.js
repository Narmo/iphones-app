/*
 * Контроллер для работы со сплэш-страницей
 */
define(
	['feed', 'tiles', 'utils', 'nav-history', 'article'], 
	function(feed, tiles, utils, nav, article) {
	// // swype.addPointerTest(function() {
	// 	// TODO блокировать swype в нужный момент
	// 	return !$(document.body).hasClass('article-mode');
	// });
	// 
	var knownCategories = ['news', 'appstore', 'accessories'];

	function getKnownCategory(post) {
		return _.find(post.categories, function(c) {
			return _.include(knownCategories, c.slug);
		});
	}

	/**
	 * Для указанного объекта с постом создаёт поле image, 
	 * в котором будет храниться путь к основной картинке
	 * @param {Object} post
	 */
	function setImage(post) {
		var img = post.content.match(/<img\s+[^>]*src=['"](.+?)['"]/i);
		if (img) {
			post.image = img[1];
		}

		return post;
	}

	function transformPost(post) {
		post.allowComments = post.comment_status == 'open';

		if (post.type == 'post') {
			// запись из блога
			var isNews = _.find(post.categories, function(c) {
				return c.slug == 'news';
			});

			if (!isNews && post.categories.length) {
				var cat = getKnownCategory(post) || post.categories[0];
				post.title = cat.title;
			}
		}

		if (~post.title.indexOf(':::')) {
			var parts = post.title.split(':::');
			post.title = $.trim(parts[0]);
			post.subtitle = $.trim(parts[1]);
		}

		return post;
	}

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

					transformPost(p);

					return setImage(p);
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
								var cat = getKnownCategory(post) || post.categories[0];
								feed.get('category_posts', {slug: cat.slug}, function(data) {
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