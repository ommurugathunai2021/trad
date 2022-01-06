function campaignSource(cookieName, domain) {
	var COOKIE_DATA_SEPARATOR = '||';
	var trackingGetParams = {'cn': 'utm_campaign', 'cs': 'utm_source', 'cm': 'utm_medium', 'cc': 'utm_content'};

	function getCookie(cookieName) {
		var name = cookieName + '=';
		var cookieArray = document.cookie.split(';');
		for (var i = 0; i < cookieArray.length; i++) {
			var cookie = cookieArray[i].replace(/^\s+|\s+$/g, '');;
			if (cookie.indexOf(name)==0) {
				return cookie.substring(name.length, cookie.length);
			}
		}
		return null;
	}

	function setCookie(cookieName, value) {
		var expires = new Date();
		expires.setTime(expires.getTime() + 62208000000); //1000*60*60*24*30*24 (2 years)
		document.cookie = cookieName + "=" + value + "; expires=" + expires.toGMTString() + "; domain=" + domain + "; path=/";
	}

	function getUrlParams() {
		var paramsString = window.location.search.substring(1);
		var paramsArray = paramsString.split('&');
		var params = {};
		for (var i = 0; i < paramsArray.length; i++) {
			var nameValue = paramsArray[i].split('=');
			params[nameValue[0]] = decodeURIComponent(nameValue[1]);
		}
		return params;
	}

	function onDomainChange(cookieName) {
		var cookieValue = getCookie(cookieName);
		if (cookieValue) {
			$('.change-lang').click(function() {
				var $this = $(this);
				var href = $this.attr('href');
				if (!href) {
					return true;
				}
				var hrefArray = href.split('#');
				hrefArray[0] += ((hrefArray[0].indexOf('?') != -1) ? '&' : '?') + cookieName + '=' + encodeURIComponent(cookieValue);
				$this.attr('href', hrefArray.join('#'));
			});
		}
	}

	// pass cookie to get params on domain change
	onDomainChange(cookieName);

	var urlParams = getUrlParams();
	// save cookie from get param
	if (typeof urlParams[cookieName] !== 'undefined') {
		setCookie(cookieName, urlParams[cookieName]);
	}
	// process get params
	var cookieParams = {};
	var saveCookie = false;
	for (var i in trackingGetParams) {
		if (typeof urlParams[trackingGetParams[i]] !== 'undefined') {
			cookieParams[i] = urlParams[trackingGetParams[i]];
			saveCookie = true;
		}
	}
	if (!saveCookie) {
		return;
	}

	// save data into cookie
	var cookieParamsArray = [];
	for (var i in cookieParams) {
		cookieParamsArray.push(i + '=' + cookieParams[i]);
	}
	setCookie(cookieName, cookieParamsArray.join(COOKIE_DATA_SEPARATOR));
}
