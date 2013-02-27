/**
 * Модуль для вывода ленты статей
 */
define(
	['utils', 'sheet', 'image-preloader', 'nav-history', 'comments-list', 'article', 'flipper'], 
	function(utils, sheet, imagePreloader, nav, commentsList, article, flipper) {
		return {
			create: function(title, posts, options) {
				var reel = $('<div class="article__preview-container"></div>')
					.css('visibility', 'hidden')
					.appendTo(document.body);

				flipper.attach(reel, '.sheet');

				var lookup = {};
				var images = _.map(posts, function(post) {
					var page = $(sheet.create({
						title: title,
						features: ['no-scroll'],
						content: utils.render('article-preview', utils.transformPost(post))
					}, options));

					reel.append(page);

					var article = page.find('.article');
					// вешаем триггер
					article.attr('data-trigger', 'show_post:' + article.attr('data-post-id'));
					var img = article.attr('data-image');
					lookup[img] = article;
					return img;
				});

				imagePreloader.getSize(images, function(src, size, image) {
					if (src !== 'complete') {
						var holder = $(lookup[src]).find('.article__image-holder');
						utils.centerImage(image, size, holder[0]);
						holder.append(image);
					}
				});

				return reel;
			}
		};
	}
);