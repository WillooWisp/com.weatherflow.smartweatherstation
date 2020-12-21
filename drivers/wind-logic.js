'use strict';

class WindLogic {
    
    constructor(device) {
        this._lastWindSpeed = 0;
        this._device = device;
    }

    isWindy(windSpeedLimit) {
        return this._lastWindSpeed > windSpeedLimit;
    }    
    
    rapidWindEvent(message, windAboveTrigger, windBelowTrigger) {
        const values = message.ob;
        if (!values || values.length === 0)
            return;

        const timestamp = values[0];
        const windSpeed = values[1];
        const windDirection = values[2];

        let tokens = {}
        let state = { 'wind_speed': windSpeed }

        windAboveTrigger.trigger(this._device, tokens, state)
            .then()
            .catch(this.error)

        windBelowTrigger.trigger(this._device, tokens, state)
            .then()
            .catch(this.error)

        this._lastWindSpeed = windSpeed;
    }
}

module.exports = WindLogic;