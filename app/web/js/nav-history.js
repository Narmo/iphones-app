/**
 * Простой навигационный контроллер с историей переходов.
 * Переходом считается отображение указанного блока на странице.
 */
define(['utils'], function(utils) {
	var history = [];
	var target = 'body';

	var animDefaults = {
		duration: 400,
		easing: 'easeOutCubic',
		autostart: true
	};

	function detach(elem) {
		if (!elem) {
			return;
		}

		elem = $(elem);
		var el = elem[0];
		if (el && el.parentNode) {
			el.parentNode.removeChild(el);
			elem.trigger('history:detach');
		}
	}

	function attach(target, item) {
		if (item && target) {
			$(target).append(item);
			$(item).trigger('history:attach');
		}
	}

	/**
	 * Анимация перехода по истории назад
	 * @param  {Element} prev
	 * @param  {Element} cur
	 */
	function animateBackward(prev, cur) {
		prev = $(prev);
		cur = $(cur);

		var prevEl = prev[0], curEl = cur[0];

		var transformCSS = Modernizr.prefixed('transform');
		var distance = curEl.offsetWidth;

		prev.css('zIndex', 99);
		cur.css('zIndex', 100);
		
		curEl.style[transformCSS] = 'translate3d(0, 0, 0)';

		return new Tween(_.extend({}, animDefaults, {
			step: function(pos) {
				prevEl.style.opacity = 0.6 + 0.4 * pos;
				prevEl.style[transformCSS] = 'scale(' + (0.7 + 0.3 * pos) + ')';

				curEl.style[transformCSS] = 'translate3d(' + (distance * pos) + 'px, 0, 0)';
			},
			complete: function() {
				prev.css({
					zIndex: '',
					opacity: ''
				});

				cur.css('zIndex', '');
				prevEl.style[transformCSS] = curEl.style[transformCSS] = 'none';
				detach(cur);
				cur.trigger('history:remove');
			}
		}));
	}

	/**
	 * Анимация перехода по истории вперед
	 * @param  {Element} prev
	 * @param  {Element} cur
	 */
	function animateForward(prev, cur) {
		prev = $(prev);
		cur = $(cur);

		var prevEl = prev[0], curEl = cur[0];

		var transformCSS = Modernizr.prefixed('transform');
		var distance = curEl.offsetWidth;

		prev.css('zIndex', 99);
		cur.css('zIndex', 100);
		
		curEl.style[transformCSS] = 'translate3d(' + distance + 'px, 0, 0)';

		return new Tween(_.extend({}, animDefaults, {
			step: function(pos) {
				prevEl.style.opacity = 1 - 0.6 * pos;
				prevEl.style[transformCSS] = 'scale(' + (1 - 0.3 * pos) + ')';

				curEl.style[transformCSS] = 'translate3d(' + (distance * (1 - pos)) + 'px, 0, 0)';
			},
			complete: function() {
				prev.css({
					zIndex: '',
					opacity: ''
				});

				cur.css('zIndex', '');
				prevEl.style[transformCSS] = curEl.style[transformCSS] = 'none';
				detach(prev);
			}
		}));
	}

	return {
		/**
		 * Переходм «вперёд»: показываем переданный элемент
		 * на странице
		 * @param  {Element} elem Элемент, который нужно показать
		 */
		go: function(elem) {
			var prev = _.last(history);
			history.push(elem);
			attach(target, elem);
			if (prev && elem) {
				animateForward(prev, elem);
			} else {
				detach(prev);
			}
		},

		/**
		 * Переходим на один шаг назад: показываем предыдущий элемент
		 * @return {Element} Элемент шага, с которого перешли
		 */
		back: function() {
			var cur = history.pop();
			var prev = _.last(history);
			
			attach(target, prev);

			if (cur && prev) {
				animateBackward(prev, cur)
			} else {
				detach(cur);
				$(cur).trigger('history:remove');	
			}

			return cur;
		},

		/**
		 * Очищает всю историю
		 */
		purge: function() {
			_.each(history, detach);
			history.length = 0;
		}
	}
});