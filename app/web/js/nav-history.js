/**
 * Простой навигационный контроллер с историей переходов.
 * Переходом считается отображение указанного блока на странице.
 */
define(
['utils'],
/**
 * @constructor
 * @memberOf __navModule
 * @param {utilsModule} utils 
 */
function(utils) {
	var history = [];
	var target = 'body';

	var animDefaults = {
		duration: 500,
		easing: 'easeInOutCubic',
		autostart: true
	};

	var outOpacity = .7;
	var outScale = .8;

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
		attach(target, prevEl);

		return new Tween(_.extend({}, animDefaults, {
			step: function(pos) {
				prevEl.style.opacity = outOpacity + (1 - outOpacity) * pos;
				prevEl.style[transformCSS] = 'scale(' + (outScale + (1 - outScale) * pos) + ')  translate3d(0,0,0)';

				curEl.style[transformCSS] = 'translate3d(' + (distance * pos) + 'px, 0, 0)';
			},
			complete: function() {
				prev.css({
					zIndex: '',
					opacity: ''
				});

				cur.css('zIndex', '');
				// prevEl.style[transformCSS] = curEl.style[transformCSS] = '';
				detach(cur);
				cur.trigger('history:remove');
				cur.trigger('history:anim-backward');
				cur.trigger('history:anim-complete');
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

		attach(target, cur);

		var prevEl = prev[0], curEl = cur[0];
		var transformCSS = Modernizr.prefixed('transform');
		var distance = curEl.offsetWidth;

		prev.css('zIndex', 99);
		cur.css('zIndex', 100);
		
		curEl.style[transformCSS] = 'translate3d(' + distance + 'px, 0, 0)';

		return new Tween(_.extend({}, animDefaults, {
			step: function(pos) {
				prevEl.style.opacity = 1 - (1 - outOpacity) * pos;
				prevEl.style[transformCSS] = 'scale(' + (1 - (1 - outScale) * pos) + ') translate3d(0,0,0)';

				curEl.style[transformCSS] = 'translate3d(' + (distance * (1 - pos)) + 'px, 0, 0)';
			},
			complete: function() {
				prev.css({
					zIndex: '',
					opacity: ''
				});

				cur.css('zIndex', '');
				// prevEl.style[transformCSS] = curEl.style[transformCSS] = '';
				detach(prev);

				cur.trigger('history:anim-forward');
				cur.trigger('history:anim-complete');
			}
		}));
	}

	return {
		/**
		 * @memberOf navModule
		 * Переходм «вперёд»: показываем переданный элемент
		 * на странице
		 * @param  {Element} elem Элемент, который нужно показать
		 */
		go: function(elem) {
			elem = $(elem)[0];
			var prev = _.last(history);
			history.push(elem);
			if (prev && elem) {
				animateForward(prev, elem);
			} else {
				attach(target, elem);
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
			
			if (cur && prev) {
				animateBackward(prev, cur);
			} else {
				attach(target, prev);
				detach(cur);
				$(cur).trigger('history:remove');	
			}

			return cur;
		},

		replace: function(oldElem, newElem) {
			_.each(history, function(item, i) {
				if (item === oldElem) {
					detach(oldElem);
					$(oldElem).trigger('history:remove');
					history[i] = newElem;
				}
			});
		},
		
		/**
		 * Вставляет указанный элемент в указанную позицию истории. Этот метод
		 * не вызывает никакие события и просто модифицирует массив элементов
		 * истории
		 */
		insertAt: function(elem, ix) {
			if (ix == 'last') {
				ix = history.length;
			}
			
			if (ix < 0) {
				ix = history.length + ix;
			}
			
			ix = Math.min(history.length, Math.max(0, ix));
			history.splice(ix, 0, elem);
		},

		/**
		 * Очищает всю историю
		 */
		purge: function() {
			_.each(history, detach);
			history.length = 0;
		}
	};
});