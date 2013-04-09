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
	var MAX_DEPTH_LEVEL = 3;
	var module = null;

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

		// проставляем уровень вложенности у комментариев
		var setLevel = function(ar, level) {
			if (!ar) {
				return;
			}

			level = level || 0;
			_.each(ar, function(comment) {
				comment.level = level;
				comment.isDeep = level > MAX_DEPTH_LEVEL;
				setLevel(comment.children, level + 1);
			});
		}

		setLevel(data.comments, 0);
		
		return utils.render('comments-list', data);
	}
	
	/**
	 * Получаем список комментариев по указанным параметрам
	 * @param {Object} params Параметры для получения списка комментариев
	 * @param {Function} callback
	 */
	function loadComments(params, callback) {
		feed.get('comments', params, function(data) {
			if (!data) {
				return callback();
			}

			var comments = data.comments || data;
			callback(comments);
			// обновляем количество комментариев в родительском посте
			var post = feed.getPost(params.post_id);
			if (post) {
				post.comment_count = comments.length;
			}
		});
	}

	function handleReplyUIEvent(evt) {
		var target = $(evt.target);
		if (target.hasClass('comment__reply')) {
			module.showForm({
				parent: target.attr('data-comment-id'),
				post_id: target.attr('data-post-id')
			});
		}

		hideReplyWidget(target.closest('.comment__reply-overlay'));
	}

	function hideReplyWidget(widget) {
		widget = $(widget)[0];
		new Tween({
			reverse: true,
			autostart: true,
			duration: 100,
			step: function(pos) {
				widget.style.opacity = pos;
			},
			complete: function() {
				$(widget).remove();
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

	return module = {
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
				locker.unlock('comments');

				if (comments) {
					var page = that.create({
						id: post.id,
						title: post.title,
						comments: comments
					});
					
					nav.go(page);
				}
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
		},

		/**
		 * Показывает слой для ответа на комментарий
		 * @param  {HTMLElement} ctx Элемент с комментарием, на который нужно ответить
		 */
		showReplyWidget: function(ctx) {
			ctx = $(ctx);
			var box = ctx.find('.comment__content')[0].getBoundingClientRect();
			var overlay = $('<div class="comment__reply-overlay"><div class="comment__reply"></div></div>')
				.on('pointertap', handleReplyUIEvent)
				.appendTo(document.body);

			var btn = overlay.find('.comment__reply')
				.attr('data-comment-id', ctx.attr('data-comment-id'))
				.attr('data-post-id', ctx.closest('.comments__list').attr('data-post-id'));

			var style = btn[0].style;
			var transformCSS = Modernizr.prefixed('transform');

			// совмещаем центры и готовим к анимации
			var btnHeight = btn[0].offsetHeight;
			var yOffset = Math.min(document.body.offsetHeight - btnHeight, box.top + (box.bottom - box.top - btnHeight) / 2);
			style.top = yOffset + 'px';
			style[transformCSS] = 'scale(0)';
			
			new Tween({
				easing: 'easeOutBack',
				duration: 250,
				autostart: true,
				step: function(pos) {
					style[transformCSS] = 'scale(' + pos +')';
				}
			});
		}
	};
});