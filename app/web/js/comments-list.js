/**
 * Модуль для отрисовки содержимого статьи
 */
define(['sheet', 'utils', 'feed', 'nav-history'], function(sheet, utils, feed, nav) {
	Handlebars.registerHelper('renderComment', function(ctx) {
		return new Handlebars.SafeString(utils.render('comment', ctx))
	});

	return {
		create: function(data) {
			var comments = data.comments || [];
			var parentLookup = {};
			_.each(comments, function(comment) {
				var id = String(comment.parent);
				if (!(id in parentLookup)) {
					parentLookup[id] = [];
				}
				parentLookup[id].push(comment);
			});

			// связываем все комментарии в дерево
			_.each(comments, function(comment) {
				if (comment.id && comment.id in parentLookup) {
					comment.children = parentLookup[comment.id];
				}
			});

			data.comments = _.filter(comments, function(c) {
				return c.parent == 0;
			});

			return sheet.create({
				back_label: 'Назад к статье',
				options: '<i class="icon icon_comment icon_comment_dark icon_comment_add">&nbsp;</i>',
				content: utils.render('comments-list', data)
			});
		},

		/**
		 * Создаёт и показывает комментарии для указанного поста
		 * @param  {Object} post Информация о посте, для которого нужно показать
		 * комментарии
		 * @param {Function} callback
		 */
		showForPost: function(post, callback) {
			var that = this;
			feed.get('comments', function(comments) {
				nav.go(that.create({
					title: post ? post.title : '',
					comments: comments
				}));
			});
		}
	}
});