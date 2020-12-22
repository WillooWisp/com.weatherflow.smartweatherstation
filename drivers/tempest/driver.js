'use strict';

const Homey = require('homey');
const DeviceLookup = require('../device-lookup');

class TempestDriver extends Homey.Driver {

    onInit() {
        this._deviceLookup = new DeviceLookup('ST', this);
        this._initFlows();
        this.log('TempestDriver has been inited');
    }

    async onPairListDevices(data, callback) {
        await this._sleep(20000);

        const tempestDevices = Homey.app.devices.filter(device => device.name.startsWith('ST'));

        callback(null, tempestDevices);
    }

    updateObservations(message) {
        const device = this._deviceLookup.getDevice(message.serial_number);
        if (!device)
            return;

        device.updateObservations(message);
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

    async rapidWindEvent(message) {
        const device = this._deviceLookup.getDevice(message.serial_number);
        if (!device)
            return;

        device.rapidWindEvent(message);
    }

    _initFlows() {
        this.rainStartTrigger = new Homey.FlowCardTriggerDevice('rain_start')
            .register();

        this.rainStopTrigger = new Homey.FlowCardTriggerDevice('rain_stop')
            .register();

        this.windAboveTrigger = new Homey.FlowCardTriggerDevice('wind_above')
            .registerRunListener((args, state) => {
                return Promise.resolve(state.windSpeed > args.wind_speed);
            }).register();

        this.windBelowTrigger = new Homey.FlowCardTriggerDevice('wind_below')
            .registerRunListener((args, state) => {
                return Promise.resolve(state.windSpeed <= args.wind_speed);
            }).register();

        this._rainCondition = new Homey.FlowCardCondition('is_raining')
            .register()
            .registerRunListener((args, state) => {
                return Promise.resolve(args.device.checkIsRaining);
            });

        this._windCondition = new Homey.FlowCardCondition('is_windy')
            .register()
            .registerRunListener((args, state) => {
                return Promise.resolve(args.device.checkIsWindy(args.wind_speed));
            });
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = TempestDriver;