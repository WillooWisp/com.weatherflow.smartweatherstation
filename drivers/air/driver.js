'use strict';

const Homey = require('homey');

class AirDriver extends Homey.Driver {

    onInit() {
        this.log('AirDriver has been inited');
    }

    // onPair(socket) {

    //     socket.on('list_devices', async (data, callback) => {
    //         await this._sleep(5000);

    //         // emit when devices are still being searched
    //         //socket.emit('list_devices', this._devices);

    //         const airDevices = Homey.app.devices.filter(device => device.name.startsWith("AR"));

    //         // fire the callback when searching is done
    //         callback( null, airDevices );

    //         // when no devices are found, return an empty array
    //         // callback( null, [] );

    //         // or fire a callback with Error to show that instead
    //         // callback( new Error('Something bad has occured!') );        

    // 		server.close();
    //     });
    // }

    async onPairListDevices(data, callback) {
        await this._sleep(20000);

        const airDevices = Homey.app.devices.filter(device => device.name.startsWith("AR"));

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
        // console.log(`Air observation: ${JSON.stringify(message)}`);

        const deviceSerialNumber = message.serial_number;
        const device = this.getDevice({ "serialNumber": deviceSerialNumber });
        if (device instanceof Error) {
            console.warn(`No device found with serialnumber '${deviceSerialNumber}'.`);
            return;
        }

        const observations = message.obs;
        if (!observations || observations.length === 0)
            return;

        var values = observations[0];
        if (!values || values.length === 0)
            return;

        device.setCapabilityValue('measure_pressure', values[1]).catch(error => this._onError(error));
        device.setCapabilityValue('measure_temperature', values[2]).catch(error => this._onError(error));
        device.setCapabilityValue('measure_humidity', values[3]).catch(error => this._onError(error));

        // "measure_gust_angle",
        // "measure_gust_strength",
        // "measure_luminance",
        // "meter_rain",
        // "measure_temperature",
        // "measure_wind_angle",
        // "measure_wind_strength"

        // UpdateValue("air.lightningstrike.count", values[4]);
        // UpdateValue("air.lightningstrike.averagedistance", values[5]);
        // UpdateValue("air.battery", values[6]);
        // UpdateValue("air.reportinterval", values[7]);
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    _onError(error) {
        console.error(error);
    }
}

module.exports = AirDriver;