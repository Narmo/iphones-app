/**
 * Модуль для вывода ленты статей
 */
define(['utils', 'sheet'], function(utils, sheet) {
	return {
		create: function(title, posts, options) {
			var transitionGroup;
			var reel = $('<div class="article__preview"></div>')
				.on('history:attach', function() {
					if (transitionGroup) {
						transitionGroup.destroy();
					}

					console.log('swype items', _.toArray(reel.find('.article')));
					transitionGroup = swype.setup(_.toArray(reel.find('.article')), {
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
				});

			_.each(posts, function(post) {
				console.log(utils.transformPost(post));
				reel.append(sheet.create({
					title: title,
					content: utils.render('article-preview', utils.transformPost(post))
				}, options));
			});

			return reel;
		}
	};
});