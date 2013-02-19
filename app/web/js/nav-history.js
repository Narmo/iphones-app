/**
 * Простой навигационный контроллер с историей переходов.
 * Переходом считается отображение указанного блока на странице.
 */
define(['utils'], function(utils) {
	var history = [];
	var target = 'body';

	function detach(elem) {
		var el = $(elem)[0];
		if (el && el.parentNode) {
			el.parentNode.removeChild(el);
		}
	}

	return {
		/**
		 * Переходм «вперёд»: показываем переданный элемент
		 * на странице
		 * @param  {Element} elem Элемент, который нужно показать
		 */
		go: function(elem) {
			var lastItem = _.last(history);
			if (lastItem) {
				// удаляем последний элемент из дерева
				// потом добавим анимацию
				detach(lastItem);
			}

			history.push(elem);
			$(target).append(elem);
		},

		/**
		 * Переходим на один шаг назад: показываем предыдущий элемент
		 * @return {Element} Элемент шага, с которого перешли
		 */
		back: function() {
			var curItem = history.pop();
			if (curItem) {
				detach(curItem);
			}

			var prevItem = _.last(history);
			if (prevItem) {
				$(target).append(prevItem);
			}

			return curItem;
		},

		/**
		 * Очищает всю историю
		 */
		purge: function() {
			$(history).detach();
			history.length = 0;
		}
	}
});