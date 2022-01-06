(function () {
    function CookieStorage(){}

    CookieStorage.prototype.get = function (name, def) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));

        return matches ? decodeURIComponent(matches[1]) : def;
    };

    CookieStorage.prototype.set = function (name, value, options) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var date = new Date();

            date.setTime(date.getTime() + expires * 1000);
            expires = options.expires = date;
        }

        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;

            var propValue = options[propName];

            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    };

    CookieStorage.prototype.isValidData = function (data) {
        if (typeof data != "string") {
            data = JSON.stringify(data);
        }

        return encodeURIComponent(data).length <= 4096;
    };

    CookieStorage.prototype.push = function (key, data, options) {
        var list, json;

        try {
            list = JSON.parse(this.get(key));
        } catch (e) {}

        if (!(list instanceof Array)) {
            list = [];
        }

        list.push(data);

        while (!this.isValidData(list)) {
            list.shift();
        }

        this.set(key, JSON.stringify(list), options);
    };

    function ReferrersHistory(cookieOptions, namespace) {
        this.cookieStorage = new CookieStorage();
        this.options   = cookieOptions || {};
        this.namespace = namespace || "referenceHistory";
    }

    ReferrersHistory.prototype.get = function () {
        var referrersHistory = [];

        try {
            referrersHistory = JSON.parse(this.cookieStorage.get(this.namespace));
        } catch (e) {}

        return referrersHistory instanceof Array ? referrersHistory : [];
    };

    ReferrersHistory.prototype.push = function (data) {
        var history  = this.get(),
            previous = history[history.length - 1];

        if (previous && previous.referrer == data.referrer) {
            return this;
        }

        this.cookieStorage.push(this.namespace, data, this.options);

        return this;
    };

    ReferrersHistory.prototype.flush = function () {
        var options = {};

        for (var k in this.options) {
            options[k] = this.options[k];
        }

        options.expires = -1;

        this.cookieStorage.set(this.namespace, "", options);

        return this;
    };

    window.ReferrersHistory = ReferrersHistory;
})();