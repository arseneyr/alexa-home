var ping = require('ping'),
    Promise = require('bluebird'),
    wol = Promise.promisifyAll(require('wake_on_lan')),
    rp = require('request-promise'),
    avr = require('./receiver'),
    CONFIG = require('../config');

function turnOff() {
    var sendRequest = function(ipAddress, type, action, command, options) {
        var url, urn;
        if(type == "command") {
            url = "/nrc/control_0";
            urn = "panasonic-com:service:p00NetworkControl:1";
        } else if (type == "render") {
            url = "/dmr/control_0";
            urn = "schemas-upnp-org:service:RenderingControl:1";
        }

        var body = "<?xml version='1.0' encoding='utf-8'?> \
        <s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/' s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/'> \
            <s:Body> \
            <u:"+action+" xmlns:u='urn:"+urn+"'> \
            "+command+" \
            </u:"+action+"> \
            </s:Body> \
        </s:Envelope>";

        var postRequest = {
            uri: 'http://' + ipAddress + ':55000' + url,
            method: "POST",
            encoding: 'utf8',
            body: body,
            headers: {
            'Content-Length': body.length,
            'Content-Type': 'text/xml; charset="utf-8"',
            'SOAPACTION': '"urn:'+urn+'#'+action+'"'
            }
        };

        return rp(postRequest);
    };

    return sendRequest(CONFIG.TV.IP_ADDRESS, 'command', 'X_SendKey', '<X_KeyEvent>NRC_POWER-ONOFF</X_KeyEvent>');
}

function checkStatus() {
    return new Promise((resolve,reject) => {
        ping.sys.probe(CONFIG.TV.IP_ADDRESS, isAlive => isAlive ? resolve() : reject());
    });
}

module.exports = {
    name: 'TV',
    description: 'Bigass TV',
    id: '86a9fc2a-afd9-41fa-b3c9-3a6d2d71d91a',
    controllable: true,
    checkStatus,
    turnOn: function() {
        wol.wakeAsync(CONFIG.TV.MAC_ADDRESS);
        return new Promise((resolve, reject) => {
            let count = 0;
            let interval = setInterval(() => {
                checkStatus()
                    .then(() => {clearInterval(interval); resolve()})
                    .catch(() => {if (count++ > 10) {clearInterval(interval); reject()}})
            }, 1000);
        });
    },

    turnOff,
    setPercentage: avr.setPercentage,
    incrementPercentage: avr.incrementPercentage,
    decrementPercentage: avr.decrementPercentage
}