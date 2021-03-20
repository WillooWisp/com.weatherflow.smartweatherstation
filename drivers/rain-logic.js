'use strict';

class RainLogic {
    
    constructor(homey, device) {
        this._homey = homey;
        this._device = device;
        this.isRaining = false;
    }

    updateDayRain(serialNumber, timestamp, rain) {
        const dayRainAmountKey = `${serialNumber}-DayRainAmount`;
        const dayRainDateKey = `${serialNumber}-DayRainDate`;

        // New date based on the observations epoch.
        const todaysDate = new Date(timestamp * 1000).getDate();
        let dayRainAmount = this._homey.settings.get(dayRainAmountKey); 
        let dayRainDate = this._homey.settings.get(dayRainDateKey);
        
        // Reset day rain amount if new day.
        if (dayRainDate != todaysDate) {         
            dayRainAmount = 0;             
            this._homey.settings.set(dayRainDateKey, todaysDate); 
        }

        // Add the rain over the last period to the day rain amount.
        dayRainAmount = dayRainAmount + rain;
        this._homey.settings.set(dayRainAmountKey, dayRainAmount);

        return dayRainAmount;
    }
        
    updateRainFlow(rain) {
        const isRaining = rain > 0;        
        if (this.isRaining === isRaining)
            return;

        this.isRaining = isRaining;
        this._invokeRainTrigger(this.isRaining);
    }

    rainStartEvent(message) {
        const values = message.evt;
        if (!values || values.length === 0)
            return;

        if (this.isRaining)
            return;

        this.isRaining = true;
        this._invokeRainTrigger(this.isRaining);
    }

    _invokeRainTrigger(isRaining) {
        let tokens = {}
        let state = {}

        if (isRaining)
        {
            this._homey.app.rainStartTrigger.trigger(this._device, tokens, state)
                .then()
                .catch(this.error);
        } else {
            this._homey.app.rainStopTrigger.trigger(this._device, tokens, state)
                .then()
                .catch(this.error);
        }
    }
}

module.exports = RainLogic;