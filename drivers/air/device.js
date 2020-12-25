'use strict';

const Homey = require('homey');
// const CloudLogger = require('../cloud-logger');

class AirDevice extends Homey.Device {
	
	onInit() {
        // this._cloudLogger = new CloudLogger();
		this.log('AirDevice has been inited');
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
        // console.log(`Air observation: ${JSON.stringify(message)}`);

        const observations = message.obs;
        if (!observations || observations.length === 0)
            return;

        var values = observations[0];
        if (!values || values.length === 0)
            return;

        const timestamp = values[0];

        // this._cloudLogger.sendLog(
        //     { 
        //         temperature: values[2],
        //         pressure: values[1],
        //         humidity: values[3],
        //     },
        //     timestamp, message.type, message.serial_number
        // );

        // Station Pressure: (MB)
        this.setCapabilityValue('measure_pressure', values[1]).catch(this.error);
        // Air Temperature: (C)
        this.setCapabilityValue('measure_temperature', values[2]).catch(this.error);
        // Relative Humidity: (%)
        this.setCapabilityValue('measure_humidity', values[3]).catch(this.error);
        // Lightning Strike Count
        this.setCapabilityValue('measure_lightningstrike_count', values[4]).catch(this.error);
        // Lightning Strike Avg Distance: (km)
        this.setCapabilityValue('measure_lightningstrike_distance', values[5]).catch(this.error);
        // Battery: (V)
        this.setCapabilityValue('measure_voltage', values[6]).catch(this.error);
        
        // UpdateValue("air.reportinterval", values[7]);
    }
}

module.exports = AirDevice;