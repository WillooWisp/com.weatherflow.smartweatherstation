'use strict';

class WindLogic {
    
    constructor(homey, device) {
        this._homey = homey;
        this._device = device;
        this._lastWindSpeed = 0;
        this._lastWindAboveTriggerState = false;
        this._lastWindBelowTriggerState = false;
    }

    isWindy(windSpeedLimit) {
        return this._lastWindSpeed > windSpeedLimit;
    }

    checkWindAbove(windSpeed, windSpeedLimit) {
        const newTriggerState = !this._lastWindAboveTriggerState && (windSpeed > windSpeedLimit);
        if (newTriggerState) {
            this._lastWindBelowTriggerState = false;
            this._lastWindAboveTriggerState = true;
        }

        // if (newTriggerState) {
        //     this._homey.log(`Triggering wind above '${windSpeed}'...`);
        // } else {
        //     this._homey.log(`Not triggering wind above '${windSpeed}'...`);
        // }

        return newTriggerState;
    }

    checkWindBelow(windSpeed, windSpeedLimit) {
        const newTriggerState = !this._lastWindBelowTriggerState && (windSpeed <= windSpeedLimit);
        if (newTriggerState) {
            this._lastWindBelowTriggerState = true;
            this._lastWindAboveTriggerState = false;
        }

        // if (newTriggerState) {
        //     this._homey.log(`Triggering wind below '${windSpeed}'...`);
        // } else {
        //     this._homey.log(`Not triggering wind below '${windSpeed}'...`);
        // }

        return newTriggerState;
    }
    
    rapidWindEvent(message) {
        const values = message.ob;
        if (!values || values.length === 0)
            return;

        // const timestamp = values[0];
        const windSpeed = values[1];
        // const windDirection = values[2];

        let tokens = {}
        let state = { 'windSpeed': windSpeed }

        this._homey.app.windAboveTrigger.trigger(this._device, tokens, state)
            .then()
            .catch(this.error)

        this._homey.app.windBelowTrigger.trigger(this._device, tokens, state)
            .then()
            .catch(this.error)

        this._lastWindSpeed = windSpeed;
    }
}

module.exports = WindLogic;