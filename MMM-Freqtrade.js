// Define Plugin defaults
Module.register("MMM-Freqtrade", {
    defaults: {
        freqtrade_url: "have you",      // freqtrade ui 'http://my.freqtrade-ui.de'
        freqtrade_user: "read",         // freqtrade username
        freqtrade_password: "the",      // freqtrade password
        freqtrade_category: "",         // which module is getting targeted 'balance, trades, daily, count etc'
        fetchInterval: 600000           // query in ms
    },

    getDom: function()
        {
            var wrapper = document.createElement("div");
            wrapper.id ="MMM-Freqtrade";
            this.setupHTMLStructure(wrapper);
            return wrapper;
        },

    // define global vars
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

    //output on MagicMirror
    setupHTMLStructure: function(wrapper) {
            const result = document.createElement("h1");
            // 'trades' provides: trade_id, pair, amount, amount_requested, stake_amount, strategy, timeframe, fee_open, fee close, fee_close_cost
            //                    fee_close_currency and many more
            if (this.config.freqtrade_category == "trades" ) {
                for(trade in this.result.trades) {
		            trade = this.result.trades[trade];
                    out = document.createElement('p');
                    wrapper.appendChild(out);
                    out.appendChild(document.createTextNode(trade.pair + ", " + trade.profit_pct + "% (" + trade.open_date + ")"))
                    console.log(this.name + ": " + "wrapping up data for `trades`");
                }
            // 'daily' provides: date (YYYY-MM-DD), fiat_value (USD), trade_count (ID) 
            } else if (this.config.freqtrade_category == "daily") {
                for(daily in this.result.data) {
		            daily = this.result.data[daily];
                    out = document.createElement('p');
                    wrapper.appendChild(out);
                    out.appendChild(document.createTextNode(daily.date + ", " + daily.fiat_value));
                    console.log(this.name + ": " + "wrapping up data for `daily`");
                }
            // 'count' provides: current (trades), max (trades), total_stake (amount)
            } else if (this.config.freqtrade_category == "count") {
                    out = document.createElement('p');
                    wrapper.appendChild(out);
                    out.appendChild(document.createTextNode(this.result.current + ", " + this.result.max + ", " + this.result.total_stake));
                    console.log(this.name + ": " + "wrapping up data for `count`");
            }
            // 'balance' provides: currency, free, balance, used, est_stake, stake
             else if (this.config.freqtrade_category == "balance") {
                for(currencies in this.result.currencies) {
		            currencies = this.result.currencies[currencies];
                    out = document.createElement('p');
                    wrapper.appendChild(out);
                    out.appendChild(document.createTextNode(currencies.currency + ", " + currencies.balance + "," + currencies.est_stake));
                    console.log(this.name + ": " + "wrapping up data for `balance`");
                }
             }
             // 'profit' provides: profit_all_coin, profit_all_fiat, trade_count, avg-duration, best_pair, best_rate, winning_trades, losing_trades and many more
             else if (this.config.freqtrade_category == "profit") {
                out = document.createElement('p');
                wrapper.appendChild(out);
                out.appendChild(document.createTextNode(this.result.profit_all_fiat + ", " + this.result.winning_trades + ", " + this.result.losing_trades + ", " + this.result.best_pair));
                console.log(this.name + ": " + "wrapping up data for `profit`");
            }
            // 'performance' provides: pair, profit, count
            else if (this.config.freqtrade_category == "performance") {
                for(performance in this.result) {
		            performance = this.result[performance];
                    out = document.createElement('p');
                    wrapper.appendChild(out);
                    out.appendChild(document.createTextNode(performance.pair + ", " + performance.profit + "," + performance.count));
                    console.log(this.name + ": " + "wrapping up data for `performance`");
                }
             }
    },  

    //fetch token from API endpoint
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
                console.log(this.name + ": " + "Fetching Token");
                this.getState()
            });
        });
    },

    // fetch data from endpoint
    getState: function() {
        fetch(`${this.config.freqtrade_url}/api/v1/${this.config.freqtrade_category}`, {
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
                console.log(this.name + ": " + "Fetching Data for Category [" + `${this.config.freqtrade_category}` + "]" );
            });
        });
    }
});
