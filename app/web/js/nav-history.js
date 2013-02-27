/**
 * Простой навигационный контроллер с историей переходов.
 * Переходом считается отображение указанного блока на странице.
 */
define(['utils'], function(utils) {
	var history = [];
	var target = 'body';

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

	return {
		/**
		 * Переходм «вперёд»: показываем переданный элемент
		 * на странице
		 * @param  {Element} elem Элемент, который нужно показать
		 */
		go: function(elem) {
			detach(_.last(history));
			history.push(elem);
			attach(target, elem);
		},

		/**
		 * Переходим на один шаг назад: показываем предыдущий элемент
		 * @return {Element} Элемент шага, с которого перешли
		 */
		back: function() {
			var curItem = history.pop();
			detach(curItem);
			$(curItem).trigger('history:remove');
			attach(target, _.last(history));
			return curItem;
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