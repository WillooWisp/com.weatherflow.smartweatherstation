'use strict';

class DeviceLookup {

    constructor(idPrefix, driver) {
        this._driver = driver;
        this._idPrefix = idPrefix;
    }

    getDevice(deviceSerialNumber) {
        if (!deviceSerialNumber.startsWith(this._idPrefix))
            return undefined;

        const device = this._driver.getDevice({ "serialNumber": deviceSerialNumber });
        if (device instanceof Error) {
            console.warn(`No device found with serialnumber '${deviceSerialNumber}'.`);
            return undefined;
        }

        return device;
    }
}

module.exports = DeviceLookup;