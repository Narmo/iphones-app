/*
 * Контроллер для работы со сплэш-страницей
 */
define(
	['feed', 'tiles', 'utils', 'flipper', 'locker', 'auth'], 
	function(feed, tiles, utils, flipper, locker, auth) {

	var mainTiles = null;

	function renderTiles(data) {
		var posts = _.clone(data.posts);
		if (data.app) {
			posts.unshift(data.app);
		}

		var result = $(tiles.create(posts));
		result.attr('data-post-ids', _.pluck(posts, 'id').join(','))

		// вешаем триггеры на плитку
		result.find('.tiles__item').each(function() {
			var tile = $(this);
			var itemId = $(this).attr('data-post-id');
			var post = feed.getPost(itemId);
			tile.attr('data-trigger', 'show_post:' + itemId);
		});

		// добавляем pull to refresh
		result.append('<div class="pull-to-refresh"><i class="icon icon_refresh"></i>Потяните, чтобы обновить</div>');

		return result;
	}

	function animateSpinner(spinner, deg) {
		deg = deg || 0;
		var degStep = 4;
		var transformCSS = Modernizr.prefixed('transform');
		return new Tween({
			duration: 'infinite',
			autostart: true,
			step: function() {
				deg = (deg + degStep) % 360;
				spinner.style[transformCSS] = 'rotate(' + deg + 'deg)';
			},
			complete: function() {
				spinner.style[transformCSS] = 'none';
			}
		});
	}

	function setupFlipper(elem, options) {
		var spinner = $(elem).find('.pull-to-refresh .icon')[0];
		var transformCSS = Modernizr.prefixed('transform');
		var spinnerDeg = 0;

		var rotateSpinner = function(delta) {
			if (delta) {
				spinnerDeg = (spinnerDeg + delta) % 360;
			}

			spinner.style[transformCSS] = 'rotate(' + spinnerDeg + 'deg)';
		}

		return flipper.attach(elem, '.tiles', _.extend({
			prevConstrain: 110,
			swypeOnInit: true
		}, options || {}))
		.on('willSnapPrevConstrain', function() {
			locker.lock('pull-to-refresh');
		})
		.on('prevConstrainSnapped', function() {
			var that = this;
			var spinnerTween = animateSpinner(spinner, spinnerDeg);
			requestNewFeeds(elem, function(isUpdated, data) {
				spinnerTween.stop();
				that.animate(that.options.prevConstrain, 0, function() {
					if (isUpdated) {
						showNewFeed(elem, data.posts, function() {
							locker.unlock('pull-to-refresh');
						});
					} else {
						updateCommentCount(elem);
						locker.unlock('pull-to-refresh');
					}
				}, {axis: 'y'});
			});
		})
		.on('flipTo', function(pos, deg) {
			if (!this.hasPrev() && spinner) {
				spinnerDeg = -2 * deg;
				rotateSpinner();
			}
		});
	}

	function requestNewFeeds(elem, callback) {
		// получаем идентификаторы последних новостей
		elem = $(elem);
		var curIds = elem.attr('data-post-ids').split(',');

		feed.get('splash', {nocache: true, withDelay: 2000}, function(data) {
			var isUpdated = !!_.find(data.posts, function(post, i) {
				return post.id != curIds[i];
			});

			callback(isUpdated, data);
		});
	}

	function updateCommentCount(elem) {
		$(elem).find('.tiles__item').each(function(i, tile) {
			tile = $(tile);
			var post = feed.getPost(tile.attr('data-post-id'));
			tile.find('.icon_comment').text(post.comment_count);
		});
	}

	function showNewFeed(oldFeed, posts, callback) {
		oldFeed = $(oldFeed)[0];

		mainTiles = renderTiles(posts);
		setupFlipper(mainTiles, {
			swypeOnInit: true
		});

		var transformCSS = Modernizr.prefixed('transform');
		
		mainTiles[0].style[transformCSS] = 'rotateY(-180deg)'
		mainTiles.css({
			zIndex: 100
		}).after(oldFeed);

		updateAuthData();

		new Tween({
			duration: 1300,
			easing: 'easeInOutCubic',
			autostart: true,
			step: function(pos) {
				var deg = pos * 180;
				var scale = 1 - Math.sin(pos * Math.PI) * 0.3;
				mainTiles[0].style[transformCSS] = 'rotateY(' + (deg - 180) + 'deg) scale(' + scale +')';
				oldFeed.style[transformCSS] = 'rotateY(' + (deg) + 'deg) scale(' + scale +')';
			},
			complete: function() {
				$(oldFeed).remove();
				callback(mainTiles);
			}
		});
	}

	function updateAuthData() {
		if (mainTiles) {
			mainTiles.find('.tiles').each(function() {
				auth.updateUserInfo(this);
			});
		}
	};

	auth.on('authorized', updateAuthData);

	return {
		/**
		 * Генерирует данные для главной страницы приложения
		 * @param  {Function} callback
		 */
		create: function(callback) {
			feed.get('splash', function(data) {
				mainTiles = renderTiles(data);
				setupFlipper(mainTiles);
				updateAuthData();

				if (callback) {
					callback(mainTiles);
				}
			});
		},

		/**
		 * Обновляет плитки для главной страницы: запрашивает данные с сервера
		 * и, при необходимости, переделывает страницы с новыми данными
		 * @param {Element} elem Контейнер с плитками, который нужно обновить
		 * @param {Function} callback
		 */
		reload: function(elem, callback) {
			var spinner = elem.find('.swype-item_current .tiles__refresh')[0];
			var spinnerTween = animateSpinner(spinner);

			locker.lock('reload_splash');

			requestNewFeeds(elem, function(isUpdated, data) {
				spinnerTween.stop();
				spinnerTween = null;

				if (isUpdated) {
					showNewFeed(elem, data, function(newFeed) {
						locker.unlock('reload_splash');
						callback(newFeed);
					});
				} else {
					updateCommentCount(elem);
					locker.unlock('reload_splash');
					callback();
				}
			});
		}
	};
});