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
	},

	scheduleUpdate: function ()
    {
		var self = this;
		setInterval(function () { self.getState(); }, this.config.fetchInterval);
        setInterval(function () { self.getToken() }, this.config.freqtrade_update_token);
	},

    getDom: function()
        {
            var wrapper = document.createElement("div");
            
            var table = document.createElement("table");
            var tbody = document.createElement("tbody");

            var items = [];

            items = this.result;
            console.log("items:" + items);

            items.forEach(element => 
                {
                    var row = this.getTableRow(element);
                    tbody.appendChild(row);
                }),

            table.appendChild(tbody);
            wrapper.appendChild(table);

            return wrapper;
        },

        getTableRow: function(jsonObject) 
        {
            var row = document.createElement("tr");
    
            for (var key in jsonObject) {
                var cell = document.createElement("td");
                var valueToDisplay = "";
                valueToDisplay = jsonObject[key];
    
                var cellText = document.createTextNode(valueToDisplay);
                console.log("getTableRow:" + cellText );
                cell.appendChild(cellText);
                row.appendChild(cell);
            }
    
            return row;
        },

        socketNotificationReceived: function (notification, payload) 
        {
            if (notification === "MMM-Freqtrade_RESULT") 
            {
                this.jsonData = payload;
                console.log(this.jsonData);
                this.updateDom(500);
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
                    console.log(this.name + ": " + "Fetching Data for Category [" + `${this.config.freqtrade_category}` + "]");
                    this.sendSocketNotification("MMM-Freqtrade_RESULT", this.result);
                });
            });
        }
    });