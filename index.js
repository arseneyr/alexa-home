var express = require('express'),
    https = require('https'),
    fs = require('fs'),
    body_parser = require('body-parser'),
    devices = require('./devices'),
    CONFIG = require('./config');

var app = express();

app.set('x-powered-by', false);

function processRequest(req) {
    var res = {
        header: {
            messageId: req.header.messageId,
            namespace: req.header.namespace,
            payloadVersion: req.header.payloadVersion
        },
        payload: {}
    };

    switch(req.header.name) {
    	case "DiscoverAppliancesRequest":
            res.header['name'] = 'DiscoverAppliancesResponse';
            res['payload'] = {
                discoveredAppliances: devices.generateDiscoveryPacket()
            };
            break;
        case "TurnOnRequest":
            console.log("turning on " + req.payload.appliance.applianceId);
            res.header['name'] = 'TurnOnConfirmation';
            devices.byId[req.payload.appliance.applianceId].turnOn();
            break;
        case "TurnOffRequest":
            console.log("turning off " + req.payload.appliance.applianceId);
            res.header['name'] = 'TurnOffConfirmation';
            devices.byId[req.payload.appliance.applianceId].turnOff();
            break;
        case "SetPercentageRequest":
            console.log(`setting ${req.payload.appliance.applianceId} to ${req.payload.percentageState.value}%`);
            res.header['name'] = 'SetPercentageConfirmation';
            devices.byId[req.payload.appliance.applianceId].setPercentage(req.payload.percentageState.value);
            break;
        case "IncrementPercentageRequest":
            console.log(`increasing ${req.payload.appliance.applianceId} by ${req.payload.deltaPercentage.value}%`);
            res.header['name'] = 'IncrementPercentageConfirmation';
            devices.byId[req.payload.appliance.applianceId].incrementPercentage(req.payload.deltaPercentage.value);
            break;
        case "DecrementPercentageRequest":
            console.log(`decreasing ${req.payload.appliance.applianceId} by ${req.payload.deltaPercentage.value}%`);
            res.header['name'] = 'DecrementPercentageConfirmation';
            devices.byId[req.payload.appliance.applianceId].decrementPercentage(req.payload.deltaPercentage.value);
            break;
    }

    return res;
}

app.use((req,res,next) => {
    if (req.query.api_key === CONFIG.API_KEY) {
	    next();
    }
});

app.get('/smarthome', body_parser.json(), (req,res) => {
    console.log(req.body);
    res.status(200).json(processRequest(req.body));
});

app.use((req,res) => {
    //res.sendStatus(404);
});

https.createServer({
    key: fs.readFileSync(CONFIG.PATH_TO_TLS_KEY),
    cert: fs.readFileSync(CONFIG.PATH_TO_TLS_CERT)
}, app).listen(8443);
