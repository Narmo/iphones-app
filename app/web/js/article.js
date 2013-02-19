/**
 * Модуль для отрисовки содержимого статьи
 */
define(['sheet', 'utils'], function(sheet, utils) {
	return {
		create: function(data, options) {
			return sheet.create({
				title: 'Статья',
				options: '<i class="icon icon_comment icon_comment_dark">' + data.comment_count + '</i>',
				content: utils.render('article', data)
			}, options);
		}
	}
});