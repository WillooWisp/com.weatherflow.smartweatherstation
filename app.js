'use strict';

const Homey = require('homey');
const dgram = require('dgram');
const server = dgram.createSocket({type: 'udp4', reuseAddr: true });

const airDriverName = "air";
const skyDriverName = "sky";
const tempestDriverName = "tempest";

class SmartWeatherStationApp extends Homey.App {	

	onInit() {
		this.log('SmartWeatherStationApp is running...');

		this.devices = [];

		this._airDriver = Homey.ManagerDrivers.getDriver(airDriverName);
		this._skyDriver = Homey.ManagerDrivers.getDriver(skyDriverName);
		this._tempestDriver = Homey.ManagerDrivers.getDriver(tempestDriverName);

		server.on('error', (err) => {
			console.log(`server error:\n${err.stack}`);
			server.close();
		});
	
		server.on('message', (msg, rinfo) => {
			var udpMessage = JSON.parse(msg);

			switch (udpMessage.type) {
				case 'hub_status':
					 this._hubStatus(udpMessage);
					break;
				case 'device_status':
					this._addDevice(udpMessage.serial_number);
					this._deviceStatus(udpMessage);
					break;
				case 'obs_air':
					this._airDriver.updateObservations(udpMessage);
					break;
				case 'obs_sky':
					this._skyDriver.updateObservations(udpMessage);
					break;
				case 'obs_st':
					this._tempestDriver.updateObservations(udpMessage);
					break;
				case 'evt_strike':
					this._airDriver.lightningStrikeEvent(udpMessage);
					break;	
				case 'evt_precip':
					this._skyDriver.rainStartEvent(udpMessage);
					this._tempestDriver.rainStartEvent(udpMessage);
					break;
				case 'rapid_wind':
					this._skyDriver.rapidWindEvent(udpMessage);
					this._tempestDriver.rapidWindEvent(udpMessage);
					break;
			}
		});
	
		server.bind(50222);
	}

	_addDevice(deviceSerialNumber) {
        if (!deviceSerialNumber)
            return;

        if (this.devices.find(device => device.name === deviceSerialNumber))
            return;

        console.log(`hub device found ${deviceSerialNumber}`);

        this.devices.push({
            "name": deviceSerialNumber,
            "data": { 
				"serialNumber": deviceSerialNumber
			}
        });
    }

    _deviceStatus(message) {
		// console.log(`Device status: ${JSON.stringify(message)}`);

		// Serial number: {udpResponseMessage.SerialNumber}
		// Hub serial number: {udpResponseMessage.HubSerialNumber}
		// Uptime: {TimeSpan.FromSeconds(udpResponseMessage.Uptime).TotalHours} hours
		// Voltage: {udpResponseMessage.Voltage}
		// Firmware revision: {udpResponseMessage.FirmwareRevision}
		// Rssi: {udpResponseMessage.Rssi}
		// Hub rssi: {udpResponseMessage.HubRssi}
		// Sensor status: {udpResponseMessage.SensorStatus}
		// Debug: {udpResponseMessage.Debug}
	}

	_hubStatus(message) {
		// console.log(`Hub status: ${JSON.stringify(message)}`);

		// Serial number: {udpResponseMessage.SerialNumber}
		// Uptime: {TimeSpan.FromSeconds(udpResponseMessage.Uptime).TotalHours} hours
		// Voltage: {udpResponseMessage.Voltage}
		// Firmware revision: {udpResponseMessage.FirmwareRevision}
		// Rssi: {udpResponseMessage.Rssi}
		// Reset flags: {udpResponseMessage.ResetFlags}
		// Seq: {udpResponseMessage.Seq}
		// Radio stat version: { udpResponseMessage.RadioStats[0]}
		// Radio stat reboot count: { udpResponseMessage.RadioStats[1]}
	}
}

module.exports = SmartWeatherStationApp;