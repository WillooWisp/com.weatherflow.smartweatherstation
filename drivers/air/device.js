'use strict';

const Homey = require('homey');

class AirDevice extends Homey.Device {
	
	onInit() {
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
}

module.exports = AirDevice;