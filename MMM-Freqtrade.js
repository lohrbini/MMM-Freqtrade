Module.register("MMM-Freqtrade", {

    result: null,
    login_token: null,
    jsonData: null,

    defaults: 
    {
        freqtrade_url: "",      // freqtrade ui 'http://my.freqtrade-ui.de'
        freqtrade_user: "r",         // freqtrade username
        freqtrade_password: "",      // freqtrade password
        freqtrade_category: "",         // which module is getting targeted 'balance, trades, daily, count etc'
        fetchInterval: 30000,            // query in ms
        freqtrade_update_token: 120000    // refresh token in ms
    },

    start: function ()
    {
        this.getToken();
        this.scheduleUpdate();
        this.loaded = true;
	},

	scheduleUpdate: function ()
    {
		var self = this;
		setInterval(function () { self.getState(); }, this.config.fetchInterval);
        setInterval(function () { self.getToken() }, this.config.freqtrade_update_token);
	},

    getStyles: function() {
        return ["MMM-Freqtrade.css"];
    },

    getDom: function()
        {
            var wrapper = document.createElement("div");
            var tablerow, tabledata, table;
            wrapper.className = "xsmall"
            
            table = document.createElement("table");
            table.id = "MMM-Freqtrade"
            


            console.log("Items: " + this.items);
           
            switch (this.config.freqtrade_category)
            {
                case "performance":
                    this.items = [];
                    for (var i = 0; i < jsonData.length; i++)
                    {
                        var object = jsonData[i];
                        for (var property in object)
                        {
                            this.items.push(object[property]);
                        }
                    }

                    // create headlines
                    var header = table.createTHead();
                    var header_row = header.insertRow(0);
                    var header_topic_0 = header_row.insertCell(0);
                    var header_topic_1 = header_row.insertCell(0);
                    var header_topic_2 = header_row.insertCell(0);
                    header_topic_0.innerHTML = "Pair";
                    header_topic_1.innerHTML = "Profit";
                    header_topic_2.innerHTML = "Count";
                    table.appendChild(header);

                    for (var i = 0; i <= this.items.length; i++) 
                    {
                        if (i % 3 === 0)
                        {
                            tablerow = table.insertRow();
                        }
                     
                        tabledata = tablerow.insertCell();
                        tabledata.appendChild(document.createTextNode(this.items[i]));
                    }
                    wrapper.appendChild(table);
                    break;

                case "count":
                    this.items = [];
                    this.items.push(jsonData);

                    // create headlines
                    var header = table.createTHead();
                    var header_row = header.insertRow(0);
                    var header_topic_0 = header_row.insertCell(0);
                    var header_topic_1 = header_row.insertCell(0);
                    var header_topic_2 = header_row.insertCell(0);
                    header_topic_0.innerHTML = "Current";
                    header_topic_1.innerHTML = "Max";
                    header_topic_2.innerHTML = "Total Stake";
                    table.appendChild(header);

                    for (var i = 0; i <= this.items.length; i++) 
                    {
                        if (i % 3 === 0)
                        {
                            tablerow = table.insertRow();
                        }
                     
                        tabledata = tablerow.insertCell();
                        tabledata.appendChild(document.createTextNode(this.items[i]));
                    }
                    wrapper.appendChild(table);
                    break;
                
                default:
                    wrapper.innerHTML = "Awaiting Freqtrade data..";

            }
            return wrapper;          
        },

        socketNotificationReceived: function (notification, payload) 
        {
            Log.info("JSON DATA ARRIVED");
            switch (notification)
              {
                case "MMM-Freqtrade_JSON_DATA_PERFORMANCE":
                    jsonData = payload.data;
                    Log.info("MMM-Freqtrade_JSON_DATA_PERFORMANCE:" + jsonData);
                    this.updateDom();
                    break;

                case "MMM-Freqtrade_JSON_DATA_COUNT":
                    jsonData = [payload.current, payload.max, payload.total_stake];
                    Log.info("MMM-Freqtrade_JSON_DATA_COUNT:" + jsonData);
                    this.updateDom();
                    break;              

                case "MMM-Freqtrade_JSON_DATA_BALANCE":
                    jsonData = [payload.currency, payload.balance, payload.stake];
                    Log.info("MMM-Freqtrade_JSON_DATA_BALANCE:" + jsonData);
                    this.updateDom();                
                    break;

                default:
                    jsonData = null;
                    this.updateDom();                 
                }
        },

        //fetch token from API endpoint
        getToken: function() 
        {
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
                    Log.info(this.name + ": " + "Fetching Token");
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
                    Log.info(this.name + ": " + "Fetching Data for Category [" + `${this.config.freqtrade_category}` + "]");
                    var switch_me = this.config.freqtrade_category;
                    switch (switch_me)
                    {
                        case "performance":
                            this.sendSocketNotification("MMM-Freqtrade_RESULT_Performance", {data: this.result});
                            Log.info("[MMM-Freqtrade] RESULT_Performance:" + this.result);
                            break;

                        case "count":
                            this.sendSocketNotification("MMM-Freqtrade_RESULT_Count", {current: (this.result.current).toString() , max: (this.result.max).toString() , stake: (this.result.total_stake).toString()});
                            Log.info("[MMM-Freqtrade] RESULT_Count:" + "Current" + this.result.current + "|     |" + "Max" + this.result.max + "|     |" + "Stake" + this.result.total_stake);
                            break;

                        case "balance":
                            for (var currencies in this.result.currencies)
                            {
                                currencies = this.result.currencies[currencies];
                                this.sendSocketNotification("MMM-Freqtrade_RESULT_Balance", {currency: this.currencies.currency, balance: this.currencies.balance, stake: this.currencies.est_stake});
                                Log.info("[MMM-Freqtrade] RESULT_Balance:" + "Currency" + this.currencies.currency + "|     |" + "Balance" + this.currencies.balance  + "|     |" + "Stake" + this.currencies.est_stake);
                            }
                            break;

                        default:
                            this.result = null;
                            this.sendSocketNotification("MMM-Freqtrade_RESULT_Default", {data: this.result});
                    }
                });
            });
        }
    });