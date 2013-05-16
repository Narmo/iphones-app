/**
 * Модуль для отрисовки содержимого статьи
 */
define(['sheet', 'utils', 'image-preloader'], function(sheet, utils, imagePreloader) {
	return {
		create: function(data, options) {
			var page = $(sheet.create({
				title: '',
				options: '<i class="icon icon_comment icon_comment_dark" data-trigger="show_comments:' + data.id + '">' + data.comment_count + '</i>',
				content: utils.render('article', data)
			}, options)).appendTo(document.body);

			var article = page.find('.article');

			var image = article.attr('data-image');

			if (image) {
				imagePreloader.getSize(image, function(src, size, image) {
					if (src !== 'complete') {
						var vpElem = article.find('.article__image-holder');
						utils.centerImage(image, size, vpElem[0]);
						vpElem.append(image);
					}
				});
			} else {
				article.addClass('article_no-image');
			}

			return page;
		}
	}
});