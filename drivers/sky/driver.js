'use strict';

const Homey = require('homey');

class SkyDriver extends Homey.Driver {

    onInit() {
        this.log('SkyDriver has been inited');

        this._initFlows();
    }

    async onPairListDevices(data, callback) {
        await this._sleep(20000);

        const airDevices = Homey.app.devices.filter(device => device.name.startsWith("SK"));

        // Required properties:
        // "data": { "id": "abcd" },

        // Optional properties, these overwrite those specified in app.json:
        // "name": "My Device",
        // "icon": "/my_icon.svg", // relative to: /drivers/<driver_id>/assets/
        // "capabilities": [ "onoff", "dim" ],
        // "capabilitiesOptions: { "onoff": {} },

        // Optional properties, device-specific:
        // "store": { "foo": "bar" },
        // "settings": { "my_setting": "my_value" },

        callback(null, airDevices);
    }

    updateObservations(message) {
        // console.log(`Sky observation: ${JSON.stringify(message)}`);

        const device = this._getDevice(message.serial_number);
        if (!device)
            return;

        const observations = message.obs;
        if (!observations || observations.length === 0)
            return;

        var values = observations[0];
        if (!values || values.length === 0)
            return;

        device.setCapabilityValue('measure_luminance', values[1]).catch(this.error);
        // UV (Index)
        device.setCapabilityValue('measure_uv', values[2]).catch(this.error);
        // Wind average (m/s)
        device.setCapabilityValue('measure_wind_strength', values[5] * 3.6).catch(this.error);
        // Wind direction (degrees)
        device.setCapabilityValue('measure_wind_angle', values[7]).catch(this.error);
        // Wind gust (m/s)
        device.setCapabilityValue('measure_gust_strength', values[6] * 3.6).catch(this.error);
        // Rain accumulated (mm)
        const rain = values[3];
        device.setCapabilityValue('measure_rain', rain).catch(this.error);
        // Local Day Rain Accumulation (mm)
        let dayRain = values[11];
        if (!dayRain) {
            dayRain = 0;
        }
        device.setCapabilityValue('measure_rain_day', dayRain).catch(this.error);
        // Solar radiation: (W/m^2)
        device.setCapabilityValue('measure_solarradiation', values[10]).catch(this.error);
        // Battery: (V)
        device.setCapabilityValue('measure_voltage', values[8]).catch(this.error);

        // Wind lull: {values[4]} m/s
        // Report interval: {values[9]} minutes
        // Precipitation type: {values[12]}
        // Wind sample interval: {values[13]} seconds

        this._isRaining = rain > 0;
    }

    rainStartEvent(message) {
        console.log(`Sky rain start: ${JSON.stringify(message)}`);

        const device = this._getDevice(message.serial_number);
        if (!device)
            return;

        const values = message.evt;
        if (!values || values.length === 0)
            return;

        const timestamp = values[0];

        this._isRaining = true;

        let tokens = {}
        let state = { 'serial_number': message.serialNumber }

        this._rainStartTrigger.trigger(device, tokens, state)
            .then()
            .catch(this.error)
    }

    async rapidWindEvent(message) {
        // console.log(`Sky rapid wind: ${JSON.stringify(message)}`);

        const device = this._getDevice(message.serial_number);
        if (!device)
            return;

        const values = message.ob;
        if (!values || values.length === 0)
            return;

        const timestamp = values[0];
        const windSpeed = values[1];
        const windDirection = values[2];

        let tokens = {}
        let state = { 'serial_number': message.serialNumber, 'wind_speed': windSpeed, 'last_triggered_wind_speed': this._lastRapidWindSpeed }

        this._windAboveTrigger.trigger(device, tokens, state)
            .then()
            .catch(this.error)

        this._windBelowTrigger.trigger(device, tokens, state)
            .then()
            .catch(this.error)

        this._lastRapidWindSpeed = windSpeed;
    }

    _initFlows() {
        this._rainStartTrigger = new Homey.FlowCardTriggerDevice('rain_start').register();

        this._windAboveTrigger = new Homey.FlowCardTriggerDevice('wind_above')
            .registerRunListener((args, state) => {
                // console.log(`Evaluate wind trigger condition ${state.last_triggered_wind_speed} <= ${args.wind_speed} && ${state.wind_speed} > ${args.wind_speed}...`);

                // args parameter, this is the user input
                // state parameter, as passed in trigger()

                // console.log(args.sky);
                // console.log(args.sky.data);

                // TODO: Only resolve true for correct serial number.

                // If true, this flow should run
                return Promise.resolve(state.last_triggered_wind_speed <= args.wind_speed && state.wind_speed > args.wind_speed);
            }).register();

        this._windBelowTrigger = new Homey.FlowCardTriggerDevice('wind_below')
            .registerRunListener((args, state) => {
                // TODO: Only resolve true for correct serial number.

                // If true, this flow should run
                return Promise.resolve(state.last_triggered_wind_speed > args.wind_speed && state.wind_speed <= args.wind_speed);
            }).register();

        this._rainCondition = new Homey.FlowCardCondition('is_raining')
            .register()
            .registerRunListener((args, state) => {
                return Promise.resolve(this._isRaining);
            });

        this._windCondition = new Homey.FlowCardCondition('is_windy')
            .register()
            .registerRunListener((args, state) => {

                // console.log(`Wind condition run: ${args}, ${state} for ${args.my_device}`);
                return Promise.resolve(this._lastRapidWindSpeed > args.wind_speed);
            });
    }

    _getDevice(deviceSerialNumber) {
        const device = this.getDevice({ "serialNumber": deviceSerialNumber });
        if (device instanceof Error) {
            console.warn(`No device found with serialnumber '${deviceSerialNumber}'.`);
            return undefined;
        }

        return device;
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    _onError(error) {
        console.error(error);
    }
}

module.exports = SkyDriver;