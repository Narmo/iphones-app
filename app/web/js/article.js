/**
 * Модуль для отрисовки содержимого статьи
 */
define(['sheet', 'utils', 'image-preloader'], function(sheet, utils, imagePreloader) {
	/**
	 * Заменяет текстовые рейтинги на звёздочки
	 * @param {jQuery} ctx
	 */
	function setupAppRating(ctx) {
		var starWidth = 8;
		ctx.find('.app-rating').each(function() {
			var el = $(this);
			var items = el.text().split(',').map(function(r) {
				r = r.trim();
				return '<div class="app-rating__item">' + r.replace(/(.+)(\d+\+?)/, function(str, p1, p2) {
					var rating = parseInt(p2, 10);
					var size = rating * starWidth;
						
					if (p2.indexOf('+') != -1) {
						size += Math.round(starWidth / 2);
					}
						
					return '<span class="app-rating__label">' + p1 + '</span>' 
						+ '<span class="app-rating__stars">' 
						+ '<span class="app-rating__stars-inner" style="width: ' + size + 'px">' 
						+ '</span></span>';
				}) + '</div>';
			});

			el.html(items.join(''));
		});
	}


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
				article.find('.article__image-holder').css('backgroundImage', 'url(' + image + ')');
			} else {
				article.addClass('article_no-image');
			}

			// дополнительно обрабатываем контент, чтобы привести
			// результат к нужному виду
			setupAppRating(article);

			return page;
		}
	}
});