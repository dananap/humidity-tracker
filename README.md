# humidity-tracker
Humidity and temperature tracker for Raspberry Pi. It uses node.js to collect data on the device and save it to redis or call an API endpoint.

## Usage
You need a .env file that contains the config:
```env
REDIS_URI=[SERVER URI]
ROOM=[room name]
```
