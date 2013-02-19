/**
 * Модуль для работы с листами: рисует страницу с указанными данными
 * и возвращает DOM-элемент, который можно поместить на страницу
 */
define(['require', 'utils', 'nav-history'], function(require, utils, nav) {
	var defaultOptions = {
		/**
		 * Функция, вызываемая по тапу на ссылку «Назад»
		 */
		onBack: function(evt) {
			nav.back();
		},

		/**
		 * Функция, вызываемая по тапу на заголовок листа
		 * @param  {Event} evt
		 */
		onTitleTap: function(evt) {
			return;
		},

		/**
		 * Функция, вызываемая по тапу на секцию с опциями.
		 * Сам обработчик не проверяет, на что именно в секции тапнули,
		 * этим должен заниматься делегатю
		 * @param  {Event} evt
		 */
		onOptionTap: function(evt) {
			return;
		}

	}
	return {
		create: function(data, options) {
			options = _.extend({}, defaultOptions, options || {});
			var sheet = $(utils.render('sheet', data));
			sheet.find('.sheet__h').on('pointertap', function(evt) {
				var target = $(evt.target);
				if (target.closest('.sheet__h-back').length) {
					return options.onBack(evt);
				}

				if (target.closest('.sheet__h-opt').length) {
					return options.onOptionTap(evt);
				}

				return options.onTitleTap(evt);
			});

			return sheet;
		}
	};
});