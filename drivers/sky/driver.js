'use strict';

const Homey = require('homey');
const DeviceLookup = require('../device-lookup');

class SkyDriver extends Homey.Driver {
    
    onInit() {
        this._deviceLookup = new DeviceLookup('SK', this);
        // this._initFlows();
        this.log('SkyDriver has been inited');
    }

    async onPairListDevices() {
        await this._sleep(20000);

        const skyDevices = this.homey.app.devices.filter(device => device.name.startsWith('SK'));
        return skyDevices;
    }

    updateObservations(message) {
        const device = this._deviceLookup.getDevice(message.serial_number);
        if (!device)
            return;
            
        device.updateObservations(message);
    }

    rainStartEvent(message) {
        const device = this._deviceLookup.getDevice(message.serial_number);
        if (!device)
            return;
        
        device.rainStartEvent(message);
    }

    rapidWindEvent(message) {
        const device = this._deviceLookup.getDevice(message.serial_number);
        if (!device)
            return;

        device.rapidWindEvent(message);
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = SkyDriver;