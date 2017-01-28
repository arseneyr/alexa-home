const avr = require('./receiver')

module.exports = {
    name: 'Sonos',
    description: 'Expensive home audio products',
    id: 'e369df7f-f8f6-428c-988c-d240eb4d57d9',
    controllable: true,
    turnOn: () => avr.switchToSonos(),
    turnOff: () => avr.turnOff(),
    setPercentage: avr.setPercentage,
    incrementPercentage: avr.incrementPercentage,
    decrementPercentage: avr.decrementPercentage
}