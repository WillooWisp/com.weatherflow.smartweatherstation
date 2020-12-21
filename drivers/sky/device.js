'use strict';

const Homey = require('homey');
const RainLogic = require('../rain-logic');
const WindLogic = require('../wind-logic');

class SkyDevice extends Homey.Device {
	
	onInit() {
		this._rainLogic = new RainLogic(this);
		this._windLogic = new WindLogic(this);
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

        // console.log( JSON.stringify(values) )

        const timestamp = values[0];

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

	rainStartEvent(message, rainStartTrigger) {
        // console.log(`Sky rain start: ${JSON.stringify(message)}`);

        this._rainLogic.rainStartEvent(message, rainStartTrigger);
    }

    rapidWindEvent(message, windAboveTrigger, windBelowTrigger) {
        // console.log(`Sky rapid wind: ${JSON.stringify(message)}`);

        this._windLogic.rapidWindEvent(message, windAboveTrigger, windBelowTrigger);
	}

	checkIsRaining() {
		return this._rainLogic.isRaining;
	}
	
	checkIsWindy(windSpeedLimit) {
		this._windLogic.isWindy(windSpeedLimit);
	}
}

module.exports = SkyDevice;