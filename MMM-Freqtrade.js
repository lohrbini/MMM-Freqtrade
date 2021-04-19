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
        setInterval(function() { self.updateDom()}, this.config.fetchInterval);
	},

    getDom: function()
        {
            var wrapper = document.createElement("div");
            wrapper.className = "wrapper"
            
            var table = document.createElement('table');
            var tablerow, tabledata;


            var items = [];
            for (var i = 0; i < jsonData.length; i++)
            {
                var object = jsonData[i];
                for (var property in object)
                {
                    items.push(object[property]);
                }
            }

            // display "maintenance" if there is no data available
            if (!(jsonData instanceof Array || typeof jsonData === 'undefined' || jsonData === 'null')) 
            {
                wrapper.innerHTML = "Awaiting Freqtrade data..";
                return wrapper;
            } 
            // return the formatted data in a table
            else
            {
                for (var i = 0; i <= items.length; i++) 
                {
                    if(this.config.freqtrade_category === "performance")
                    {
                        if (i % 3 === 0)
                        {
                            tablerow = table.insertRow();
                        }
                        tabledata = tablerow.insertCell();
                        tabledata.appendChild(document.createTextNode(items[i]));
                    }
                }
                wrapper.appendChild(table);
                return wrapper;
            }
        },


        getTableRow: function(jsonObject) 
        {
            console.log("jsonObject:" + jsonObject)

            var row = document.createElement("tr");
            var cell = document.createElement("td");
            var cellText = document.createTextNode(jsonObject)
            cell.appendChild(cellText);
            row.appendChild(cell);
            return row;
        },

        socketNotificationReceived: function (notification, payload) 
        {
            if (notification === "MMM-Freqtrade_JSON_DATA") 
            {
                console.log("JSON DATA ARRIVED");
                jsonData = payload.data;
                console.log(jsonData);
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
                    this.sendSocketNotification("MMM-Freqtrade_RESULT", {data: this.result});
                });
            });
        }
    });