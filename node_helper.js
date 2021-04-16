var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
    start: function() {
        this.config = null;
        this.initial = true;
        this.isrunning = false;
    },

    log: function (msg) {
        if (this.config && this.config.debug) {
            console.log(this.name + ": ", (msg));
        }
    }
});