/**
 * Модуль для работы с комментариями
 */
define(
['sheet', 'utils', 'feed', 'nav-history', 'auth'],
/**
 * @param {sheetModule} sheet
 * @param {utilsModule} utils
 * @param {feedModule} feed
 * @param {navModule} nav
 * @param {authModule} auth
 */
function(sheet, utils, feed, nav, auth) {
	Handlebars.registerHelper('renderComment', function(ctx) {
		return new Handlebars.SafeString(utils.render('comment', ctx));
	});

	return {
		/**
		 * Создаёт страницу со списком комментариев
		 * @memberOf commentsModule
		 * @param data
		 * @returns
		 */
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
				back_label: 'Назад',
				options: '<i class="icon icon_comment icon_comment_dark icon_comment_add" data-trigger="add_comment">&nbsp;</i>',
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
			if (post && !_.isObject(post)) {
				post = feed.getPost(post);
			}

			var that = this;
			feed.get('comments', {id: post.id}, function(comments) {
				var page = that.create({
					title: post ? post.title : '',
					comments: comments
				});

				nav.go(page);
			});
		},
		
		/**
		 * Показывает форму с постингом комментария
		 * @returns
		 */
		showForm: function(data) {
			var page = sheet.create({
				back_label: 'Назад',
				options: '<button class="post-comment-btn">Отправить</button>',
				content: utils.render('comment-form', data || {})
			}, {
				features: ['comment-form', 'no-scroll']
			});
			
			
			var form = page.find('form').on('submit', function(evt) {
				evt.preventDefault();
				console.log('sending comment');
			});
			
			page
				.on('history:anim-forward', function() {
					form.find('textarea').eq(0).focus();
				})
				.find('button.post-comment-btn').on('pointertap', function() {
					form.submit();
				});
			
			auth.showAuthorizedView(page);
		}
	};
});