/**
 * Модуль для вывода ленты статей
 */
define(
	['utils', 'sheet', 'image-preloader', 'nav-history', 'comments-list', 'article'], 
	function(utils, sheet, imagePreloader, nav, commentsList, article) {
		return {
			create: function(title, posts, options) {
				var transitionGroup;
				var reel = $('<div class="article__preview-container"></div>')
					.on('history:attach', function() {
						if (transitionGroup) {
							transitionGroup.destroy();
						}

						reel.css('visibility', 'visible');
						transitionGroup = swype.setup(_.toArray(reel.find('.sheet')), {
							active: 0,
							viewport: reel[0],
							tapzone: 0
						});
					})
					.on('history:detach', function() {
						reel.remove();
						reel = null;
						if (transitionGroup) {
							transitionGroup.destroy();
						}
					})
					.on('pointertap', '.article', function(evt) {
						var postId = $(this).attr('data-post-id');
						var post = _.find(posts, function(p) {
							return p.id == postId;
						});

						if (!post) {
							return;
						}

						if ($(evt.target).closest('.icon_comments').length) {
							// commentsList.showForPost(post);
						} else {
							nav.go(article.create(post));
						}
					})
					.css('visibility', 'hidden')
					.appendTo(document.body);


				var lookup = {};
				var images = _.map(posts, function(post) {
					var page = $(sheet.create({
						title: title,
						features: ['no-scroll'],
						content: utils.render('article-preview', utils.transformPost(post))
					}, options));

					reel.append(page);

					var article = page.find('.article');
					var img = article.attr('data-image');
					lookup[img] = article;
					return img;
				});

				imagePreloader.getSize(images, function(src, size, image) {
					if (src !== 'complete') {
						var elem = $(lookup[src]);
						var vp = {
							width: elem[0].offsetWidth,
							height: elem[0].offsetHeight
						};

						var coeff = utils.getScaleCoeff(vp, size);
						var transformCSS = Modernizr.prefixed('transform');
						image.style[transformCSS] = 'translate(-50%, -50%) scale(' + coeff + ')';
						elem.find('.article__image-holder').append(image);
					}
				});

				return reel;
			}
		};
	}
);