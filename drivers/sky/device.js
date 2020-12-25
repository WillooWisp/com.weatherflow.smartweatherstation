'use strict';

const Homey = require('homey');
const RainLogic = require('../rain-logic');
const WindLogic = require('../wind-logic');
// const CloudLogger = require('../cloud-logger');

class SkyDevice extends Homey.Device {
	
	onInit() {
		this._rainLogic = new RainLogic(this);
		this._windLogic = new WindLogic(this);
        // this._cloudLogger = new CloudLogger();
		this.log('SkyDevice has been inited');
	}
		
	// this method is called when the Device is added
	onAdded() {
		this.log('device added');
	}

	// this method is called when the Device is deleted
	onDeleted() {
		this.log('device deleted');
	}

	updateObservations(message) {
		const observations = message.obs;
        if (!observations || observations.length === 0)
            return;

        var values = observations[0];
        if (!values || values.length === 0)
            return;

        const timestamp = values[0];

        // console.log(JSON.stringify(values));

        // this._cloudLogger.sendLog(
        //     { 
        //         luminance: values[1], 
        //         uv: values[2], 
        //         rain: values[3], 
        //         precipitationType: values[12], 
        //         windLull: values[4],
        //         windStrength: values[5],            
        //         windGust: values[6],
        //         windDirection: values[7]
        //     },
        //     timestamp, message.type, message.serial_number
        // );

        this.setCapabilityValue('measure_luminance', values[1]).catch(this.error);
        // UV (Index)
        this.setCapabilityValue('measure_uv', values[2]).catch(this.error);
        // Wind average (m/s)
        this.setCapabilityValue('measure_wind_strength', values[5] * 3.6).catch(this.error);
        // Wind direction (degrees)
        this.setCapabilityValue('measure_wind_angle', values[7]).catch(this.error);
        // Wind gust (m/s)
        this.setCapabilityValue('measure_gust_strength', values[6] * 3.6).catch(this.error);
        // Rain accumulated (mm)
        const rain = values[3];
        this.setCapabilityValue('measure_rain', rain).catch(this.error);
        // Solar radiation: (W/m^2)
        this.setCapabilityValue('measure_solarradiation', values[10]).catch(this.error);
        // Battery: (V)
        this.setCapabilityValue('measure_voltage', values[8]).catch(this.error);

        // Wind lull: {values[4]} m/s
        // Report interval: {values[9]} minutes
        // Local Day Rain Accumulation: {values[11]} mm - always null with UDP API
        // Precipitation type: {values[12]}
        // Wind sample interval: {values[13]} seconds

        const dayRain = this._rainLogic.updateDayRain(message.serial_number, timestamp, rain);
        this.setCapabilityValue('measure_rain_day', dayRain).catch(this.error);

        this._rainLogic.updateRainFlow(rain);
	}

	rainStartEvent(message) {
        // console.log(`Sky rain start: ${JSON.stringify(message)}`);

        // this._cloudLogger.sendLog(
        //     {}, message.evt[0], message.type, message.serial_number
        // );

        this._rainLogic.rainStartEvent(message);
    }

    rapidWindEvent(message) {
        // console.log(`Sky rapid wind: ${JSON.stringify(message)}`);

        // this._cloudLogger.sendLog(
        //     { 
        //         windStrength: message.ob[1],
        //         windDirection: message.ob[2]
        //     },
        //     message.ob[0], message.type, message.serial_number
        // );

        this._windLogic.rapidWindEvent(message);
	}

	checkIsRaining() {
		return this._rainLogic.isRaining;
	}
	
	checkIsWindy(windSpeedLimit) {
        const isWindy = this._windLogic.isWindy(windSpeedLimit);
        return isWindy;
	}
}

module.exports = SkyDevice;