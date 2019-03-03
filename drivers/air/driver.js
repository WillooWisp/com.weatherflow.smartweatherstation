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

        const device = this._getDevice(message.serial_number);
        if (!device)
            return;

        const observations = message.obs;
        if (!observations || observations.length === 0)
            return;

        var values = observations[0];
        if (!values || values.length === 0)
            return;

        // Station Pressure: (MB)
        device.setCapabilityValue('measure_pressure', values[1]).catch(this.error);
        // Air Temperature: (C)
        device.setCapabilityValue('measure_temperature', values[2]).catch(this.error);
        // Relative Humidity: (%)
        device.setCapabilityValue('measure_humidity', values[3]).catch(this.error);
        // Lightning Strike Count
        device.setCapabilityValue('measure_lightningstrike_count', values[4]).catch(this.error);
        // Lightning Strike Avg Distance: (km)
        device.setCapabilityValue('measure_lightningstrike_distance', values[5]).catch(this.error);
        // Battery: (V)
        device.setCapabilityValue('measure_voltage', values[6]).catch(this.error);
        
        // UpdateValue("air.reportinterval", values[7]);
    }

    lightningStrikeEvent(message) {
        console.log(`Air lightning strike: ${JSON.stringify(message)}`);

        const device = this._getDevice(message.serial_number);
        if (!device)
            return;

        const values = message.evt;
        if (!values || values.length === 0)
            return;

        const timestamp = values[0];
        const distance = values[1];
        const energy = values[2];
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

module.exports = AirDriver;