var Promise = require('bluebird'),
    xb = require('xbox-on'),
    avr = require('./receiver'),
    tv = require('./tv'),
    CONFIG = require('../config');

module.exports = {
    name: 'X Box',
    id: '63d166ee-b2de-4b4d-8f63-f6a592080dff',
    description: 'Downstairs XBox One',
    controllable: true,
    turnOn: function() {
        return Promise.all([
            new Promise(resolve => {
                let myxb = new xb(CONFIG.XBOX.IP_ADDRESS, CONFIG.XBOX.LIVE_ID);
                let counter = 0;
                let timeout = setInterval(() => {
                    myxb.powerOn();
                    if (counter++ > 50) {
                        clearInterval(timeout);
                    }
                }, 500)

                resolve();
            }),
            tv.turnOn().then(() => avr.switchToXbox())
        ]);
    },
    setPercentage: avr.setPercentage,
    incrementPercentage: avr.incrementPercentage,
    decrementPercentage: avr.decrementPercentage
}