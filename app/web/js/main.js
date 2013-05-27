requirejs(
['feed', 'splash', 'nav-history', 'auth', 'locker', 'network', 'eventHandler', 'tracker', 'image-preloader'],
function(feed, splash, nav, auth, locker, network, eventHandler, tracker, imagePreloader) {
	/**
	 * Начальная анимация сплэш-экрана
	 * @param  {Array} items Листы, которые нужно анимировать
	 */
	function animateSplash(swypeGroup, container) {
		var elems = swypeGroup.elems;
		if (elems.length < 2) {
			return;
		}

		locker.lock('splashAnim');
		var flipWrapper = $('<div class="swype-flip splash-anim" style="background: #ebebeb;"></div>')[0];
		var shade = $('<div class="tiles swype-item" style="background: #ebebeb;z-index: 10;"><div class="swype__shade" style="background: #fff;opacity: 0;"></div></div>');
		var shadeInner = shade.find('.swype__shade')[0];
		var screens = elems.slice(0, 2);
		var half = Math.round(screens[0].offsetHeight / 2);
		var leaveTop = 'rect(auto, auto, ' + half + 'px, auto)';
		var leaveBottom = 'rect(' + half + 'px, auto, auto, auto)';
		var transformCSS = Modernizr.prefixed('transform');

		var flippers = [];
		screens.forEach(function(item, i) {
			var clone1 = item.cloneNode(true);
			var clone2 = item.cloneNode(true);
			var z = (i + 1) * 3;

			clone1.style.clip = leaveTop;
			clone1.style.zIndex = z;

			clone2.style.clip = leaveBottom;
			clone2.style.zIndex = z + 1;
			clone2.style[transformCSS] = 'rotateX(180deg)';

			flipWrapper.appendChild(clone1);
			flipWrapper.appendChild(clone2);

			flippers.push(clone1);
			flippers.push(clone2);
		});

		shade.css('clip', leaveTop).appendTo(flipWrapper);
		shade = shade[0];
		container.appendChild(flipWrapper);
		
		$(flippers[3]).on('webkitTransitionEnd', function() {
			this.style.zIndex = 1;
		});

		$(flippers[1]).on('webkitTransitionEnd', function() {
			$(flipWrapper).remove();
			locker.unlock('splashAnim');
		});
		
		setTimeout(function() {
			shade.style[transformCSS] = 'rotateX(-180deg)';
			shadeInner.style.opacity = 1;
			flippers[3].style[transformCSS] = 'rotateX(0deg)';
			flippers[2].style[transformCSS] = 'rotateX(-180deg)';
			flippers[1].style[transformCSS] = 'rotateX(0deg)';
		}, 100);
	}

	function hideAppSplash() {
		if (typeof MOBILE_APP != 'undefined') {
			location.href = 'app://hide-splash';
		}
	}

	/**
	 * Инициализация первого экрана страницы
	 */
	function init(callback) {
		splash.create(function(tiles, swypeGroup) {
			// фиксируем плитки как страницу приложения,
			// на которую можно вернуться
			if (tiles) {
				tiles.remove();
				var triggered = false;
				var images = $(swypeGroup.elems)
					.find('.tiles__item')
					.map(function(i, tile) {
						return $(tile).attr('data-image');
					})
					.slice(0, 9);

				imagePreloader.preloadImages(images, function() {
					if (!triggered) {
						triggered = true;
						hideAppSplash();
						nav.go(tiles);
						animateSplash(swypeGroup, tiles[0]);
						callback && callback(true);
					}
				});

				setTimeout(function() {
					if (!triggered) {
						// картинки грузятся слишком долго, 
						// просто покажем сплэш
						triggered = true;
						hideAppSplash();
						nav.go(tiles);
						callback && callback(true);	
					}
				}, 3000);
			} else {
				callback && callback(false);
			}
		});

		// попробуем залогинить пользователя
		auth.check();
		tracker.init();
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