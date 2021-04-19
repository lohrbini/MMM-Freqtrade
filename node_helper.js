var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({

	start: function () {
		console.log('MMM-JsonTable helper started...');
	},

	socketNotificationReceived: function (notification, payload) 
    {
        console.log("MMM-Freqtrade:"+ " " + "NOTIFICATION ARRIVED");
        var self = this;
        if (notification === "MMM-Freqtrade_RESULT") 
        {
            this.jsonData = payload;
            this.sendSocketNotification("MMM-Freqtrade_JSON_DATA", this.jsonData);
            console.log(this.jsonData);
        }

    },

    log: function (msg) {
        if (this.config && this.config.debug) {
            console.log(this.name + ": ", (msg));
        }
    }
});