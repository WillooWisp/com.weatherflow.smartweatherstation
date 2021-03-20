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

		this._initFlows();

		let airDriver;
		let skyDriver;
		let tempestDriver;

		server.on('error', (err) => {
			this.homey.log(`server error:\n${err.stack}`);
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
					airDriver = this._getDriver(airDriverName);
					if (airDriver) {
						airDriver.updateObservations(udpMessage);
					}
					break;
				case 'obs_sky':
					skyDriver = this._getDriver(skyDriverName);
					if (skyDriver) {
						skyDriver.updateObservations(udpMessage);
					}
					break;
				case 'obs_st':
					tempestDriver = this._getDriver(tempestDriverName);
					if (tempestDriver) {
						tempestDriver.updateObservations(udpMessage);
					}
					break;
				case 'evt_strike':
					airDriver = this._getDriver(airDriverName);
					if (airDriver) {
						airDriver.lightningStrikeEvent(udpMessage);
					}
					break;	
				case 'evt_precip':
					skyDriver = this._getDriver(skyDriverName);
					if (skyDriver) {
						skyDriver.rainStartEvent(udpMessage);
					}
					tempestDriver = this._getDriver(tempestDriverName);
					if (tempestDriver) {
						tempestDriver.rainStartEvent(udpMessage);
					}
					break;
				case 'rapid_wind':
					skyDriver = this._getDriver(skyDriverName);
					if (skyDriver) {
						skyDriver.rapidWindEvent(udpMessage);
					}
					tempestDriver = this._getDriver(tempestDriverName);
					if (tempestDriver) {
						tempestDriver.rapidWindEvent(udpMessage);
					}
					break;
			}
		});
	
		server.bind(50222);
	}

	_initFlows() {
        this.rainStartTrigger = this.homey.flow.getDeviceTriggerCard('rain_start');

        this.rainStopTrigger = this.homey.flow.getDeviceTriggerCard('rain_stop');

        this.windAboveTrigger = this.homey.flow.getDeviceTriggerCard('wind_above')
            .registerRunListener(async (args, state) => {
				this.homey.log(`Triggering wind above '${state.windSpeed}' (${state.windSpeed > args.wind_speed})...`);
                return state.windSpeed > args.wind_speed;
            });

        this.windBelowTrigger = this.homey.flow.getDeviceTriggerCard('wind_below')
            .registerRunListener(async (args, state) => {
				this.homey.log(`Triggering wind below '${state.windSpeed}' (${state.windSpeed <= args.wind_speed})...`);
                return state.windSpeed <= args.wind_speed;
            });

        this._rainCondition = this.homey.flow.getConditionCard('is_raining')
            .registerRunListener(async (args, state) => {
				// this.homey.log(`Is raining condition '${args.device.checkIsRaining()}'...`);
                return args.device.checkIsRaining();
            });

        this._windCondition = this.homey.flow.getConditionCard('is_windy')
            .registerRunListener(async (args, state) => {
				// this.homey.log(`Is windy condition '${args.device.checkIsWindy(args.wind_speed)}'...`);
                return args.device.checkIsWindy(args.wind_speed);
            });
    }
	
	_getDriver(driverName) {
		try {
			return this.homey.drivers.getDriver(driverName);
		} catch (error) {
			this.homey.error(`Driver '${driverName}' not initialized yet.`)
			return undefined;
		}
	}

	_addDevice(deviceSerialNumber) {
        if (!deviceSerialNumber)
            return;

        if (this.devices.find(device => device.name === deviceSerialNumber))
            return;

        this.homey.log(`hub device found ${deviceSerialNumber}`);

        this.devices.push({
            "name": deviceSerialNumber,
            "data": { 
				"serialNumber": deviceSerialNumber
			}
        });
    }

    _deviceStatus(message) {
		// this.homey.log(`Device status: ${JSON.stringify(message)}`);

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
		// this.homey.log(`Hub status: ${JSON.stringify(message)}`);

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