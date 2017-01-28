var denon = require('denon-avr'),
    Promise = require('bluebird'),
    CONFIG = require('../config');

Promise.promisifyAll(denon);
Promise.promisifyAll(denon.prototype);

function connect_to_avr() {
    return new Promise((resolve, reject) => {
        const transport = new denon.transports.telnet({
            host: CONFIG.RECEIVER.IP_ADDRESS,
            debug: true
        })

        transport.connection.on('error', reject);
        var avr = new denon(transport);

        avr.on('connect', resolve.bind(this, avr));
        avr.on('error', reject);
        avr.connect();
    }).disposer((avr) => avr.getConnection().destroy());
}

function turn_on_avr(newSource) {
    return Promise.using(connect_to_avr(), avr => newSource ? avr.sendAsync('SI' + newSource, '') : avr.setPowerStateAsync(true));
}

function turn_off_avr() {
    return Promise.using(connect_to_avr(), avr => avr.setPowerStateAsync(false));
}

function setVolume(percentage) {
    return Promise.using(connect_to_avr(), avr => setVolumeForAvr(avr, percentage));
}

function setVolumeForAvr(avr, percentage) {
    return percentage == 0
        ? avr.setMuteStateAsync(true)
        : avr.setVolumeDbAsync(-60 + ((percentage * 60) / 100));
}

function deltaVolume(delta) {
    return Promise.using(connect_to_avr(), avr =>
        avr.getVolumeLevelAsync()
        .then(volume => {
            const curVol = ((avr.parseAsciiVolume(volume) + 60) / 60) * 100;
            let newVol = curVol + delta;
            newVol = newVol > 100 ? 100 : newVol < 0 ? 0 : newVol;
            return setVolumeForAvr(avr, newVol);
        })
    );
}

module.exports = {
    name: 'Receiver',
    description: 'Switches between stuff',
    id: 'cde66704-2ed2-4bde-bda4-340b256b13fd',
    controllable: true,
    turnOn: turn_on_avr,
    turnOff: turn_off_avr,
    setPercentage: setVolume,
    incrementPercentage: deltaVolume,
    decrementPercentage: d => deltaVolume(-d),
    switchToPc: () => turn_on_avr('DVR'),
    switchToXbox: () => turn_on_avr('GAME'),
    switchToSonos: () => turn_on_avr('BD')
}