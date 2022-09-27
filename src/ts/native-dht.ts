import sensor from 'node-dht-sensor';

sensor.read(22, 2, function (err, temperature, humidity) {
    if (!err) {
        console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);
    }
});