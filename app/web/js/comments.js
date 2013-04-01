/**
 * Модуль для работы с комментариями
 */
define(
['sheet', 'utils', 'feed', 'nav-history', 'auth', 'notifier', 'api', 'locker'],
/**
 * @param {sheetModule} sheet
 * @param {utilsModule} utils
 * @param {feedModule} feed
 * @param {navModule} nav
 * @param {authModule} auth
 * @param {notifierModule} notifier
 * @param {apiModule} api
 */
function(sheet, utils, feed, nav, auth, notifier, api, locker) {
	Handlebars.registerHelper('renderComment', function(ctx) {
		return new Handlebars.SafeString(utils.render('comment', ctx));
	});
	
	/**
	 * Список идентификаторов постов, комментарии для которых нужно 
	 * инвалидировать
	 */
	var shouldInvalidate = {};
	
	/**
	 * Инициирует постинг комментария
	 * @param {Element} form
	 * @param {Function} callback
	 */
	function postComment(form, callback) {
		var payload = {};
		_.each($(form).serializeArray(), function(item) {
			payload[item.name] = item.value;
		});
		
		var userData = auth.getUserInfo();
		var authData = auth.getAuthInfo();
		payload.email = userData.email;
		payload.name = userData.displayname || userData.username;
		payload.cookie = authData.cookie;
		
		api.request('/api/app/submit_comment/', payload, function(success, data) {
			if (!success) {
				notifier.error('Не удалось сохранить комментарий:\n' + (data || 'ошибка подключения'));
			}
			
			callback(success, data);
		});
	}
	
	/**
	 * Отрисовывает шаблон со списком комментариев
	 * @param {Object} data
	 * @returns {String}
	 */
	function render(data) {
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
		
		return utils.render('comments-list', data);
	}
	
	/**
	 * Получаем список комментариев по указанным параметрам
	 * @param {Object} params Параметры для получения списка комментариев
	 * @param {Function} callback
	 */
	function loadComments(params, callback) {
		feed.get('comments', params, function(data) {
			var comments = data.comments || data;
			callback(comments);
			// обновляем количество комментариев в родительском посте
			var post = feed.getPost(params.post_id);
			if (post) {
				post.comment_count = comments.length;
			}
		});
	}
	
	nav.on('willAttach', function(page) {
		page = $(page);	
		if (page.hasClass('sheet_comments')) {
			var postId = page.find('.comments__list').attr('data-post-id');
			if (postId in shouldInvalidate) {
				sheet.updateContent(page, render({
					id: postId,
					title: page.find('h2').text(),
					comments: shouldInvalidate[postId]
				}));
				
				delete shouldInvalidate[postId];
			}
		}
	});

	return {
		/**
		 * Создаёт страницу со списком комментариев
		 * @memberOf commentsModule
		 * @param data
		 * @returns
		 */
		create: function(data) {
			return sheet.create({
				back_label: 'Назад',
				options: '<i class="icon icon_comment icon_comment_dark icon_comment_add" data-trigger="add_comment:' + data.id + '">&nbsp;</i>',
				content: render(data)
			}, {features: ['comments']});
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
			locker.lock('comments');
			loadComments({id: post.id}, function(comments) {
				var page = that.create({
					id: post.id,
					title: post.title,
					comments: comments
				});
				locker.unlock('comments');
				nav.go(page);
			});
		},
		
		/**
		 * Показывает форму с постингом комментария
		 * @returns
		 */
		showForm: function(data) {
			data = _.extend({parent: 0, post_id: 0}, data || {});
			
			var page = sheet.create({
				back_label: 'Назад',
				options: '<button class="post-comment-btn">Отправить</button>',
				content: utils.render('comment-form', data)
			}, {
				features: ['comment-form', 'no-scroll']
			});
			
			
			var form = page.find('form').on('submit', function(evt) {
				evt.preventDefault();
				postComment(this, function(success) {
					if (success) {
						// загружаем и инвалидируем данные
						var postId = data.post_id;
						loadComments({id: postId, nocache: true}, function(comments) {
							shouldInvalidate['' + postId] = comments;
							nav.back();
						});
					}
				});
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