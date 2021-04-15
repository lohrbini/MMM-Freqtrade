// Define Plugin defaults
Module.register("MMM-FreqtradeAPI", {
    defaults: {
        freqtrade_url: "have you",
        freqtrade_user: "read",
        freqtrade_password: "the",
        freqtrade_state: "ReadMe",
        fetchInterval: 600000
    },
// END Plugin defaults

// Define global vars
    result: "",
    login_token: "",
// END global vars

    getStyles() {
        return [
            this.file('style.css')
        ]
    },

    notificationReceived(notification, payload, sender) {
        if (notification === 'MODULE_DOM_CREATED') {
            this.getJoke();
            setInterval(() => {
                this.getFreqData()
            }, this.config.fetchInterval);
        }
    },
    getDom() {
        const wrapper = document.createElement("div");

        if(this.result === null) return wrapper;

        this.setupHTMLStructure(wrapper);

        return wrapper;
    },
    setupHTMLStructure(wrapper) {
        if (this.result.type === 'single') {

            const result = document.createElement("h1");
            result.className = "bright medium light fadeIn";
            result.innerHTML = this.result.result;
            wrapper.appendChild(result);

        } else if (this.result.type === 'twopart') {

            const setup = document.createElement("h1");
            setup.className = "bright medium light no-wrap fadeIn";
            setup.innerHTML = this.result.setup;
            wrapper.appendChild(result);

            const sec_line = document.createElement("h2");
            sec_line.className = "bright small light fadeIn";
            sec_line.innerHTML = this.result.delivery;
            wrapper.appendChild(sec_line);
        }
    },
    getToken() {
        fetch(`${this.config.freqtrade_url}/api/v1/token/login`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                "Content-Type": "text/plain",
                'Authorization': 'Basic ' + btoa(`${this.config.freqtrade_username}` + ":" + `${this.config.freqtrade_password}`),
            }
        }).then((response) => {
            response.json.parse("access_token").then((login_token) => {
                this.login_token = login_token;
                console.log(login_token)
            });
        });
    },
    getState() {
        fetch(`${this.config.freqtrade_url}/api/v1/${this.config.category}`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                "Content-Type": "text/plain",
                "Authorization": `Bearer ${access_token}`
            }
        }).then((response) => {
            response.json().then((result) => {
                this.result = result;
                console.log(result);
                this.updateDom();
            });
        });
    }
});
