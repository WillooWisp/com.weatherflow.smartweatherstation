'use strict';

const Homey = require('homey');
const DeviceLookup = require('../device-lookup');

class AirDriver extends Homey.Driver {

    onInit() {
        this._deviceLookup = new DeviceLookup('AR', this);
        this.homey.log('AirDriver has been inited');
    }

    async onPairListDevices() {
        await this._sleep(20000);

        const airDevices = this.homey.app.devices.filter(device => device.name.startsWith('AR'));
        return airDevices;
    }

    updateObservations(message) {
        const device = this._deviceLookup.getDevice(message.serial_number);
        if (!device)
            return;

        device.updateObservations(message);
    }

    lightningStrikeEvent(message) {
        this.homey.log(`Air lightning strike: ${JSON.stringify(message)}`);

        const device = this._deviceLookup.getDevice(message.serial_number);
        if (!device)
            return;

        const values = message.evt;
        if (!values || values.length === 0)
            return;

        const timestamp = values[0];
        const distance = values[1];
        const energy = values[2];
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = AirDriver;