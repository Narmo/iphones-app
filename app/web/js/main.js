requirejs(
['feed', 'splash', 'nav-history', 'auth', 'locker', 'network', 'eventHandler'],
function(feed, splash, nav, auth, locker, network, eventHandler) {
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
		eventHandler.handle($(this).attr('data-trigger'), this);
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