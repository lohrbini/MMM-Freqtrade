// Define Plugin defaults
Module.register("MMM-Freqtrade", {
    defaults: {
        freqtrade_url: "have you",
        freqtrade_user: "read",
        freqtrade_password: "the",
        freqtrade_state: "ReadMe",
        fetchInterval: 600000
    },

    getDom: function()
        {
            var wrapper = document.createElement("div");
            wrapper.id ="MMM-Freqtrade";
            this.setupHTMLStructure(wrapper);
            return wrapper;
        },

    result: "",
    login_token: "",

    getStyles: function() {
        return [
            this.file('style.css')
        ]
    },

    notificationReceived: function(notification, payload, sender) {
        if (notification === 'MODULE_DOM_CREATED') {
            this.getToken();
            setInterval(() => {
                this.getToken()
            }, this.config.fetchInterval);
        }
    },

    setupHTMLStructure: function(wrapper) {
            const result = document.createElement("h1");
            result.className = "bright medium light fadeIn";
            for(trade in this.result.trades) {
		trade = this.result.trades[trade]
                out = document.createElement('p');
                wrapper.appendChild(out);
                out.appendChild(document.createTextNode(trade.pair + ", " + trade.profit_pct + "% (" + trade.open_date + ")"))
            }
    },
    getToken: function() {
        fetch(`${this.config.freqtrade_url}/api/v1/token/login`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                "Content-Type": "text/plain",
                'Authorization': 'Basic ' + btoa(`${this.config.freqtrade_user}` + ":" + `${this.config.freqtrade_password}`),
            }
        }).then((response) => {
            response.json().then((login_token) => {
                this.login_token = login_token['access_token'];
                this.getState()
            });
        });
    },
    getState: function() {
        console.log("getState()")
        fetch(`${this.config.freqtrade_url}/api/v1/${this.config.category}`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                "Content-Type": "text/plain",
                "Authorization": `Bearer ${this.login_token}`
            }
        }).then((response) => {
            response.json().then((result) => {
                this.result = result;
                this.updateDom();
            });
        });
    }
});
