/*
 * Контроллер для работы со сплэш-страницей
 */
define(
	['feed', 'tiles', 'utils', 'flipper'], 
	function(feed, tiles, utils, flipper) {

	function renderTiles(data) {
		var result = $(tiles.create(data));

		// вешаем триггеры на плитку
		result.find('.tiles__item').each(function() {
			var tile = $(this);
			var itemId = $(this).attr('data-post-id');
			var post = feed.getPost(itemId);
			var trigger = (post.type == 'page' ? 'show_post:' : 'show_category_for_post:') + itemId;
			tile.attr('data-trigger', trigger);
		});

		return result;
	}

	function animateSpinner(spinner) {
		var deg = 0;
		var degStep = 4;
		var transformCSS = Modernizr.prefixed('transform');
		return new Tween({
			duration: 'infinite',
			autostart: true,
			step: function() {
				deg = (deg + degStep) % 360;
				spinner.style[transformCSS] = 'rotate(' + deg + 'deg) translate3d(0,0,0)';
			},
			complete: function() {
				spinner.style[transformCSS] = 'none';
			}
		});
	}

	return {
		/**
		 * Генерирует данные для главной страницы приложения
		 * @param  {Function} callback
		 */
		create: function(callback) {
			feed.get('splash', function(data) {
				var mainTiles = renderTiles(data.posts);
				flipper.attach(mainTiles, '.tiles');
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
			// получаем идентификаторы последних новостей
			elem = $(elem);
			var curIds = elem.find('.tiles__item').map(function(i, tile) {
				return $(tile).attr('data-post-id');
			});

			var spinnerTween = animateSpinner(elem.find('.swype-item_current .tiles__refresh')[0]);

			feed.get('splash', {nocache: true, withDelay: 2000}, function(data) {
				var isUpdated = !!_.find(data.posts, function(post, i) {
					return post.id != curIds[i];
				});

				// XXX debug
//				 isUpdated = true;

				spinnerTween.stop();
				spinnerTween = null;

				if (isUpdated) {
					var newTiles = renderTiles(data.posts);

					flipper.attach(newTiles, '.tiles', {
						swypeOnInit: true
					});

					var transformCSS = Modernizr.prefixed('transform');
					
					newTiles[0].style[transformCSS] = 'rotateY(-180deg)'
					newTiles.css({
						zIndex: 100
					}).after(elem);

					new Tween({
						duration: 1300,
						easing: 'easeInOutCubic',
						autostart: true,
						step: function(pos) {
							var deg = pos * 180;
							var scale = 1 - Math.sin(pos * Math.PI) * 0.3;
							newTiles[0].style[transformCSS] = 'rotateY(' + (deg - 180) + 'deg) scale(' + scale +')';
							elem[0].style[transformCSS] = 'rotateY(' + (deg) + 'deg) scale(' + scale +')';
						},
						complete: function() {
							callback(newTiles);
						}
					});
				} else {
					// ничего не поменялось: на всякий случай обновим количество
					// комментариев
					elem.find('.tiles__item').each(function(i, tile) {
						tile = $(tile);
						var post = feed.getPost(tile.attr('data-post-id'));
						tile.find('.icon_comment').text(post.comment_count);
					});
					callback();
				}
			});
		}
	};
});