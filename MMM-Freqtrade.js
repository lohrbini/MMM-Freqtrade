Module.register("MMM-Freqtrade", {

    result: null,
    login_token: null,
    jsonData: null,

    defaults: 
    {
        freqtrade_url: "have you",      // freqtrade ui 'http://my.freqtrade-ui.de'
        freqtrade_user: "read",         // freqtrade username
        freqtrade_password: "the",      // freqtrade password
        freqtrade_category: "",         // which module is getting targeted 'balance, trades, daily, count etc'
        fetchInterval: 6000,            // query in ms
        freqtrade_update_token: 7200    // refresh token in ms
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
            var tablerow, tabledata, table, tablecell;
            wrapper.className = "xsmall"
            
            table = document.createElement("table");
            table.id = "MMM-Freqtrade"
            
            this.items = [];
            for (var i = 0; i < jsonData.length; i++)
            {
                var object = jsonData[i];
                for (var property in object)
                {
                    this.items.push(object[property]);
                }
            }

            // display "maintenance" if there is no data available
            if (this.items.length === 0 ) 
            {
                wrapper.innerHTML = "Awaiting Freqtrade data..";
                return wrapper;
            } 
            // return the formatted data in a table
            else
            {

                if (this.config.freqtrade_category === "performance")
                {
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
                    return wrapper;
                }
                else if (this.config.freqtrade_category === "to_be_done")
                {
                    //to be done
                }



            }
        },

        socketNotificationReceived: function (notification, payload) 
        {
            if (notification === "MMM-Freqtrade_JSON_DATA") 
            {
                Log.info("JSON DATA ARRIVED");
                jsonData = payload.data;
                Log.info(jsonData);
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
                    this.sendSocketNotification("MMM-Freqtrade_RESULT", {data: this.result});
                });
            });
        }
    });