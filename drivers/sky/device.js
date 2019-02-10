'use strict';

const Homey = require('homey');

class SkyDevice extends Homey.Device {
	
	onInit() {
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
}

module.exports = SkyDevice;