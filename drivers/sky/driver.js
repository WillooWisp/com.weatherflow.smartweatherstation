'use strict';

const Homey = require('homey');

class SkyDriver extends Homey.Driver {
	
	onInit() {
		this.log('SkyDriver has been inited');
    }
    
    async onPairListDevices(data, callback) {
        await this._sleep(5000);

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
        console.log(`Sky observation: ${JSON.stringify(message)}`);

        const deviceSerialNumber = message.serial_number;
        const device = this.getDevice({ "serialNumber": deviceSerialNumber });
        if (device instanceof Error) {
            console.warn(`No device found with serialnumber '${deviceSerialNumber}'.`);
            return;
        }

        console.log(`Device?: ${JSON.stringify(device)}`);

        const observations = message.obs;
		if (!observations || observations.length === 0)
			return;		

		var values = observations[0];
		if (!values || values.length === 0)
			return;

		device.setCapabilityValue('measure_luminance', values[1]).catch(error => this._onError(error));		
		device.setCapabilityValue('measure_wind_strength', values[5]).catch(error => this._onError(error));		
		device.setCapabilityValue('measure_wind_angle', values[7]).catch(error => this._onError(error));		
		device.setCapabilityValue('measure_gust_strength', values[6]).catch(error => this._onError(error));
		device.setCapabilityValue('measure_gust_angle', values[7]).catch(error => this._onError(error));
		device.setCapabilityValue('measure_rain', values[3]).catch(error => this._onError(error));	
		device.setCapabilityValue('meter_rain', values[3]).catch(error => this._onError(error));

		// UV: {values[2]} Index
		// Rain accumulated: {values[3]} mm
		// Wind lull: {values[4]} m/s
		// Wind average: {values[5]} m/s
		// Wind gust: {values[6]} m/s
		// Wind direction: {values[7]} degrees
		// Battery: {values[8]} volt
		// Report interval: {values[9]} minutes
		// Solar radiation: {values[10]} W/m^2
		// Local day rain accumulation: {values[11]} mm
		// Precipitation type: {values[12]}
		// Wind sample interval: {values[13]} seconds
    }
    
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
	
	_onError(error) {
        console.error(error);
    }
}

module.exports = SkyDriver;