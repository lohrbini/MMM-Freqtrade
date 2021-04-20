var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({

	start: function () {
		console.log('MMM-Freqtrade helper started...');
	},

	socketNotificationReceived: function (notification, payload) 
    {
        var self = this;
        switch (notification) 
        {
            case "MMM-Freqtrade_RESULT_Performance":
                this.jsonData = payload;
                this.sendSocketNotification("MMM-Freqtrade_JSON_DATA_PERFORMANCE", this.jsonData);
                console.log("Performance Data Arrived:" + this.jsonData);
                break;
            
            case "MMM-Freqtrade_RESULT_Count":
                this.jsonData = [payload.current, payload.max, payload.total_stake];
                this.sendSocketNotification("MMM-Freqtrade_JSON_DATA_COUNT", this.jsonData);
                console.log("Count Data Arrived:" + this.jsonData);
                break;
            
            case "MMM-Freqtrade_RESULT_Balance":
                this.jsonData = [payload.currency, payload.balance, payload.stake];
                this.sendSocketNotification("MMM-Freqtrade_JSON_DATA_BALANCE", this.jsonData);
                console.log("Balance Data Arrived:" + this.jsonData);
                break;
            
            default:
                this.jsonData = ["NO", "DATA", "Available"]
                this.sendSocketNotification("MMM-Freqtrade_JSON_DATA", this.jsonData);1
                console.log("Undefined Data Arrived:" + this.jsonData);

        }
        if (notification === "MMM-Freqtrade_RESULT") 
        {
            
            
            
        }

    },

    log: function (msg) {
        if (this.config && this.config.debug) {
            console.log(this.name + ": ", (msg));
        }
    }
});