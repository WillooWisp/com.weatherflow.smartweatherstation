# WeatherFlow's Smart Weather Station

Adds support for WeatherFlow's Smart Weather Station

First version, with quite limited functionality.
Upcoming versions will support more measurement values and flow triggers.

# Changelog 

* 0.2.1 Fixed bug in rain sensor reading. For some reason, the daily rain still reports no value using the WeatherFlow's UDP API.
* 0.2.0 Added more sensor readings on both Air and Sky devices. Air and Sky devices must be removed and added again in order for the new sensor readings to show up. Flow triggers and conditions added for rain started and wind above/below specified threshold.
* 0.1.1 Increased the time searching for Air and Sky devices when pairing.
* 0.1.0 Initial release with support for some sensor readings on Air and Sky devices.

# Note

Whenever the app has been updated with new sensor readings, both Air and Sky devices must be removed and paired once again in order for the new sensor readings to show up (limitation in Homey).