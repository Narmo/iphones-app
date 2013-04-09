/**
 * Простой навигационный контроллер с историей переходов.
 * Переходом считается отображение указанного блока на странице.
 */
define(
['utils', 'locker'],
/**
 * @constructor
 * @memberOf __navModule
 * @param {utilsModule} utils 
 */
function(utils, locker) {
	var history = [];
	var target = 'body';

	var animDefaults = {
		duration: 500,
		easing: 'easeInOutCubic',
		autostart: true
	};

	var outOpacity = .7;
	var outScale = .8;
	var module = null;

	var transEndEventNames = {
		'WebkitTransition' : 'webkitTransitionEnd',
		'MozTransition'    : 'transitionend',
		'OTransition'      : 'oTransitionEnd',
		'msTransition'     : 'MSTransitionEnd',
		'transition'       : 'transitionend'
	},
	transEndEventName = transEndEventNames[Modernizr.prefixed('transition')];
	
	function trigger(event, elem) {
		$(elem).trigger('history:' + event);
		module.trigger(event, elem);
	}

	function detach(elem) {
		if (!elem) {
			return;
		}

		elem = $(elem);
		var el = elem[0];
		if (el && el.parentNode) {
			el.parentNode.removeChild(el);
			trigger('detach', elem);
		}
	}

	function attach(target, item) {
		if (item && target) {
			$(target).append(item);
			trigger('attach', item);
		}
	}

	/**
	 * Анимация перехода по истории назад
	 * @param  {Element} prev
	 * @param  {Element} cur
	 */
	function animateBackwardTransition(prev, cur) {
		prev = $(prev);
		cur = $(cur);

		var prevEl = prev[0], curEl = cur[0];

		var transformCSS = Modernizr.prefixed('transform');
		var distance = curEl.offsetWidth + 63;

		prev.css('zIndex', 99);
		cur.css('zIndex', 100);
		
		curEl.style[transformCSS] = 'translate3d(0, 0, 0)';
		prevEl.style[transformCSS] = 'scale(' + outScale + ')';
		prevEl.style.opacity = outOpacity;
		attach(target, prevEl);

		locker.lock('nav-backward');

		cur.one(transEndEventName, function() {
			locker.unlock('nav-backward');

			cur.css('zIndex', '').removeClass('nav-animate');
			curEl.style[transformCSS] = '';

			detach(cur);

			trigger('remove', cur);
			trigger('anim-backward', cur);
			trigger('anim-complete', cur);
		});

		prev.one(transEndEventName, function() {
			prev.css({
				zIndex: '',
				opacity: ''
			}).removeClass('nav-animate');
			prevEl.style[transformCSS] = '';
		});

		setTimeout(function() {
			prev.addClass('nav-animate');
			cur.addClass('nav-animate');

			prevEl.style.opacity = 1;
			prevEl.style[transformCSS] = 'scale(1)';

			curEl.style[transformCSS] = 'translate3d(' + distance + 'px, 0, 0)';
		}, 1);
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

		locker.lock('nav-backward');
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
				locker.unlock('nav-backward');

				trigger('remove', cur);
				trigger('anim-backward', cur);
				trigger('anim-complete', cur);
			}
		}));
	}

	function animateForwardTransition(prev, cur) {
		prev = $(prev);
		cur = $(cur);

		attach(target, cur);

		var prevEl = prev[0], curEl = cur[0];
		var transformCSS = Modernizr.prefixed('transform');

		var distance = curEl.offsetWidth + 63;

		prev.css('zIndex', 99);
		cur.css('zIndex', 100);

		curEl.style[transformCSS] = 'translate3d(' + distance + 'px, 0, 0)';

		locker.lock('nav-forward');
		cur.one(transEndEventName, function() {
			cur.css('zIndex', '').removeClass('nav-animate');
			curEl.style[transformCSS] = '';
			locker.unlock('nav-forward');

			trigger('anim-forward', cur);
			trigger('anim-complete', cur);
		});

		prev.one(transEndEventName, function() {
			prev.css({
				zIndex: '',
				opacity: ''
			}).removeClass('nav-animate');
			prevEl.style[transformCSS] = '';
			detach(prev);
		});

		setTimeout(function() {
			prev.addClass('nav-animate');
			cur.addClass('nav-animate');

			prevEl.style.opacity = outOpacity;
			prevEl.style[transformCSS] = 'scale(' + outScale + ')';

			curEl.style[transformCSS] = 'translate3d(0,0,0)';
		}, 1);
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

		locker.lock('nav-forward');
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
				prevEl.style[transformCSS] = curEl.style[transformCSS] = '';
				detach(prev);

				locker.unlock('nav-forward');

				trigger('anim-forward', cur);
				trigger('anim-complete', cur);
			}
		}));
	}

	module = {
		/**
		 * @memberOf navModule
		 * Переходмм «вперёд»: показываем переданный элемент
		 * на странице
		 * @param  {Element} elem Элемент, который нужно показать
		 */
		go: function(elem) {
			elem = $(elem)[0];
			var prev = _.last(history);
			history.push(elem);
			
			trigger('willAttach', elem);
			if (prev && elem) {
				animateForwardTransition(prev, elem);
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
			
			trigger('willAttach', prev);
			
			if (cur && prev) {
				animateBackwardTransition(prev, cur);
			} else {
				attach(target, prev);
				detach(cur);
				trigger('remove', cur);	
			}

			return cur;
		},

		replace: function(oldElem, newElem) {
			_.each(history, function(item, i) {
				if (item === oldElem) {
					detach(oldElem);
					trigger('remove', oldElem);
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
	
	return _.extend(module, _.events);
});