'use strict';

class DeviceLookup {

    constructor(idPrefix, driver) {
        this._driver = driver;
        this._idPrefix = idPrefix;
    }

    getDevice(deviceSerialNumber) {
        if (!deviceSerialNumber.startsWith(this._idPrefix))
            return undefined;

        try {
            const device = this._driver.getDevice({ "serialNumber": deviceSerialNumber });
            return device;
        } catch (error) {
            console.warn(`No device found with serialnumber '${deviceSerialNumber}'.`);
            return undefined;
        }
    }
}

module.exports = DeviceLookup;