var arr = [];

require("fs").readdirSync(__dirname).forEach(function(file) {
    if (file !== 'index.js') {
        arr.push(require("./" + file));
    }
});

var exp = {
    byId: {},
    generateDiscoveryPacket: function() {
        return arr.filter(e => e.controllable).map(e => {
            return {
                applianceId: e.id,
                manufacturerName: e.manufacturer || 'contoso',
                modelName: e.modelName || 'shitbox',
                version: e.version || '1',
                friendlyName: e.name,
                friendlyDescription: e.description || e.name,
                isReachable: true,
                actions: ['turnOn', 'turnOff', 'setPercentage', 'incrementPercentage', 'decrementPercentage'].filter(f => e[f])
            }
        });
    }
};

arr.forEach(e => {
    exp[e.name.replace(/\s/g, '').toLowerCase()] = e;
    exp.byId[e.id] = e;
})

module.exports = exp;