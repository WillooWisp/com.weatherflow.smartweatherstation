'use strict';

const Homey = require('homey');
const RainLogic = require('../rain-logic');
const WindLogic = require('../wind-logic');
// const CloudLogger = require('../cloud-logger');

class TempestDevice extends Homey.Device {
	
	onInit() {
        this._rainLogic = new RainLogic(this);
        this._windLogic = new WindLogic(this);
        // this._cloudLogger = new CloudLogger();
        this.log('TempestDevice has been inited');
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
		//console.log(`Tempest observation: ${JSON.stringify(message)}`);
		
		const observations = message.obs;
        if (!observations || observations.length === 0)
            return;

        var values = observations[0];
        if (!values || values.length === 0)
            return;

        const timestamp = values[0];

        //console.log(JSON.stringify(values));

        // this._cloudLogger.sendLog(
        //     { 
        //         luminance: values[9], 
        //         uv: values[10], 
        //         rain: values[12], 
        //         precipitationType: values[13], 
        //         windLull: values[1],
        //         windStrength: values[2],            
        //         windGust: values[3],
        //         windDirection: values[4]
        //     },
        //     timestamp, message.type, message.serial_number
        // );

        // Air Temperature: (C)
        this.setCapabilityValue('measure_temperature', values[7]).catch(this.error);
        // Station Pressure: (MB)
        this.setCapabilityValue('measure_pressure', values[6]).catch(this.error);
        // Relative Humidity: (%)
        this.setCapabilityValue('measure_humidity', values[8]).catch(this.error);
        // Luminance
        this.setCapabilityValue('measure_luminance', values[9]).catch(this.error);
        // UV (Index)
        this.setCapabilityValue('measure_uv', values[10]).catch(this.error);
        // Wind average (m/s)
        this.setCapabilityValue('measure_wind_strength', values[2] * 3.6).catch(this.error);
        // Wind direction (degrees)
        this.setCapabilityValue('measure_wind_angle', values[4]).catch(this.error);
        // Wind gust (m/s)
        this.setCapabilityValue('measure_gust_strength', values[3] * 3.6).catch(this.error);
        // Lightning strike count
        this.setCapabilityValue('measure_lightningstrike_count', values[15]).catch(this.error);
        // Lightning strike distance
        this.setCapabilityValue('measure_lightningstrike_distance', values[14]).catch(this.error);
        // Rain accumulated (mm)
        const rain = values[12];
        this.setCapabilityValue('measure_rain', rain).catch(this.error);
        // Solar radiation: (W/m^2)
        this.setCapabilityValue('measure_solarradiation', values[11]).catch(this.error);
        // Battery: (V)
        this.setCapabilityValue('measure_voltage', values[16]).catch(this.error);

        const dayRain = this._rainLogic.updateDayRain(message.serial_number, timestamp, rain);
        this.setCapabilityValue('measure_rain_day', dayRain).catch(this.error);

        this._rainLogic.updateRainFlow(rain);
	}

	rainStartEvent(message) {
        // console.log(`Tempest rain start: ${JSON.stringify(message)}`);

        // this._cloudLogger.sendLog(
        //     {}, message.evt[0], message.type, message.serial_number
        // );

        this._rainLogic.rainStartEvent(message);
    }

    rapidWindEvent(message) {
        // console.log(`Tempest rapid wind: ${JSON.stringify(message)}`);

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

module.exports = TempestDevice;