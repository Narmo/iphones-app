define(['network'], function(network) {
	return {
		init: function() {

		},
		/**
		 * @param  {String} url
		 */
		trackPageView: function(url) {
			if (url.charAt(0) !== '/') {
				url = '/' + url;
			}

			if (typeof MOBILE_APP != 'undefined') {
				location.href = 'analytics://_trackPageview' + url;
			} else {
				console.log('Tracking', url);
			}
		}
	}
});