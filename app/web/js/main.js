require(
['article', 'utils', 'feed', 'splash', 'comments', 'nav-history', 'article-reel', 'auth', 'preloader', 'locker', 'network'],
function(article, utils, feed, splash, comments, nav, articleReel, auth, preloader, locker, network) {
	/**
	 * Инициализация первого экрана страницы
	 */
	function init(callback) {
		splash.create(function(tiles) {
			// фиксируем плитки как страницу приложения,
			// на которую можно вернуться
			if (tiles) {
				nav.go(tiles);
				callback && callback(true);
			} else {
				callback && callback(false);
			}
		});

		// попробуем залогинить пользователя
		auth.check();
	}
	
	// после авторизации обновляем все данные на странице
	auth
		.on('authorized', function() {
			auth.updateUserInfo();
			$(document.body).addClass('authorized');
		})
		.on('logout', function() {
			$(document.body).removeClass('authorized');
		});
	
	nav.on('willAttach', function(page) {
		// автоматическое обновление количества комментариев
		$(page).find('.icon_comment').not('.icon_comment_add').each(function(i) {
			var item = $(this);
			var m = ($(this).attr('data-trigger') || '').match(/:(\d+)$/);
			if (m) {
				var post = feed.getPost(m[1]);
				if (post) {
					item.text(post.comment_count);
				}
			}
		});
	});

	// блокируем перелистывания если существуют блокировки
	swype.addPointerTest(function() {
		return !locker.locked();
	});

	/**
	 * Универсальный хэндлер событий, который позволяет выполнять стандартные 
	 * действия для большинства контролов, вроде отображения комментариев или
	 * статьи
	 */
	$(document).on('pointertap', '[data-trigger]', function(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();

		if (locker.locked()) {
			return;
		}

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
				var pl = preloader.createForBlock(this);
				locker.lock('category_posts');
				feed.get('category_posts', {slug: cat.slug}, function(data) {
					if (data && data.posts) {
						articleReel.create(cat.title, data.posts, {
							complete: function(reel) {
								if (pl) {
									pl.stop();
									$(pl.getContainer()).remove();
								}

								locker.unlock('category_posts');
								nav.go(reel);
							}
						});
					} else {
						if (pl) {
							pl.stop();
							$(pl.getContainer()).remove();
						}
						locker.unlock('category_posts');
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
				auth.show(function(status) {
					if (status) {
						nav.back();
					}
				});
				break;
				
			case 'add_comment':
				comments.showForm(_.isObject(params) ? params : {post_id: params});
				break;

			case 'reply':
				comments.showReplyWidget(this);
				break;
		}
	});

	// XXX пробуем инициализировать приложение
	if (network.available()) {
		init();
	} else {
		// нет сети, покажем виджет
		var widget = $('<div class="w-notify"><div class="w-notify__message">Для работы приложения требуется активное подключение к интернету</div><button>Попробовать ещё</button></div>')
			.appendTo(document.body);
		var blinkTimer = null;
		var blink = function(elem, color) {
			elem = $(elem).data('blink-count', 5);

			if (!blinkTimer) {
				blinkTimer = setInterval(function() {
					var curIx = parseInt(elem.data('blink-count'));
					if (!curIx || curIx < 0) {
						clearInterval(blinkTimer);
						blinkTimer = null;
						elem.css('color', '');
					} else {
						elem
							.css('color', curIx % 2 ? color : '')
							.data('blink-count', curIx - 1);
					}
				}, 100);
			}
		};

		widget.find('button').on('click', function() {
			if (locker.locked('init')) {
				return;
			}
			
			var msg = widget.find('.w-notify__message');
			if (!network.available()) {
				blink(msg, 'red');
			} else {
				locker.lock('init');
				init(function(status) {
					locker.unlock('init');
					if (!status) {
						blink(msg, 'red');
					} else {
						widget.remove();
					}
				});
			}
		});
	}
});