const avr = require('./receiver');
const Promise = require('bluebird');
const tv = require('./tv');
const wol = Promise.promisifyAll(require('wake_on_lan'));
const CONFIG = require('../config');

module.exports = {
    name: 'PC',
    description: 'Intel NUC',
    id: '59f6391c-ed59-4e09-b3d1-adc23b941ef7',
    controllable: true,
    turnOn: () => Promise.all([
      tv.turnOn().then(() => avr.switchToPc()),
      wol.wakeAsync(CONFIG.PC.MAC_ADDRESS)
    ]),
    turnOff: () => tv.turnOff()
}