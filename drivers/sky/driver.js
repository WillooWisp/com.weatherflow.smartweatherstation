'use strict';

const Homey = require('homey');

class SkyDriver extends Homey.Driver {

    onInit() {
        this.log('SkyDriver has been inited');

        this._initFlows();
    }

    async onPairListDevices(data, callback) {
        await this._sleep(20000);

        const skyDevices = Homey.app.devices.filter(device => device.name.startsWith("SK"));

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

        callback(null, skyDevices);
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

        // console.log( JSON.stringify(values) )

        const timestamp = values[0];

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
        // Solar radiation: (W/m^2)
        device.setCapabilityValue('measure_solarradiation', values[10]).catch(this.error);
        // Battery: (V)
        device.setCapabilityValue('measure_voltage', values[8]).catch(this.error);

        // Wind lull: {values[4]} m/s
        // Report interval: {values[9]} minutes
        // Local Day Rain Accumulation: {values[11]} mm - always null with UDP API
        // Precipitation type: {values[12]}
        // Wind sample interval: {values[13]} seconds
        
        const dayRain = this.updateDayRain(timestamp, rain);
        device.setCapabilityValue('measure_rain_day', dayRain).catch(this.error);

        this._updateRainFlow(rain);
    }

    updateDayRain(timestamp, rain) {
        const dayRainAmountKey = 'DayRainAmount';
        const dayRainDateKey = 'DayRainDate';

        // New date based on the observations epoch.
        const todaysDate = new Date(timestamp * 1000).getDate();
        let dayRainAmount = Homey.ManagerSettings.get(dayRainAmountKey); 
        let dayRainDate = Homey.ManagerSettings.get(dayRainDateKey);                       
        
        // Reset day rain amount if new day.
        if (dayRainDate != todaysDate) {         
            dayRainAmount = 0;             
            Homey.ManagerSettings.set(dayRainDateKey, todaysDate); 
        }

        // Add the rain over the last period to the day rain amount.
        dayRainAmount = dayRainAmount + rain;
        Homey.ManagerSettings.set(dayRainAmountKey, dayRainAmount);

        return dayRainAmount;
    }

    rainStartEvent(message) {
        // console.log(`Sky rain start: ${JSON.stringify(message)}`);

        const device = this._getDevice(message.serial_number);
        if (!device)
            return;

        const values = message.evt;
        if (!values || values.length === 0)
            return;

        let tokens = {}
        let state = {}

        this._isRaining = true;

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
        let state = { 'wind_speed': windSpeed }

        this._windAboveTrigger.trigger(device, tokens, state)
            .then()
            .catch(this.error)

        this._windBelowTrigger.trigger(device, tokens, state)
            .then()
            .catch(this.error)

        this._lastWindSpeed = windSpeed;
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
                return Promise.resolve(this._isRaining);
            });

        this._windCondition = new Homey.FlowCardCondition('is_windy')
            .register()
            .registerRunListener((args, state) => {
                return Promise.resolve(this._lastWindSpeed > args.wind_speed);
            });
    }

    _updateRainFlow(rain) {
        this._isRaining = rain > 0;
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