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
        
        device.rainStartEvent(message, this._rainStartTrigger);
    }

    async rapidWindEvent(message) {
        const device = this._deviceLookup.getDevice(message.serial_number);
        if (!device)
            return;

        device.rapidWindEvent(message, this._windAboveTrigger, this._windBelowTrigger);
    }

    _initFlows() {
        this._rainStartTrigger = new Homey.FlowCardTriggerDevice('rain_start')
            .register();

        this._windAboveTrigger = new Homey.FlowCardTriggerDevice('wind_above')
            .registerRunListener((args, state) => {
                return Promise.resolve(state.wind_speed > args.wind_speed);
            }).register();

        this._windBelowTrigger = new Homey.FlowCardTriggerDevice('wind_below')
            .registerRunListener((args, state) => {
                return Promise.resolve(state.wind_speed <= args.wind_speed);
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