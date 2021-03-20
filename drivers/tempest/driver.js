'use strict';

const Homey = require('homey');
const DeviceLookup = require('../device-lookup');

class TempestDriver extends Homey.Driver {

    onInit() {
        this._deviceLookup = new DeviceLookup('ST', this);
        // this._initFlows();
        this.log('TempestDriver has been inited');
    }

    async onPairListDevices() {
        await this._sleep(20000);

        const tempestDevices = this.homey.app.devices.filter(device => device.name.startsWith('ST'));
        return tempestDevices;
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

module.exports = TempestDriver;