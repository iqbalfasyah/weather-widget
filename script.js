$(document).ready(function() {
    const appId = '';
    // Function to get user's location based on IP address
    function getUserLocation() {
        return new Promise((resolve, reject) => {
            $.get("https://ipinfo.io", function(response) {
                resolve(response);
            }, "json");
        });
    }

    // Function to get weather data based on coordinates
    function getWeatherData(latitude, longitude) {
        return new Promise((resolve, reject) => {
            $.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${appId}`, function(response) {
                resolve(response);
            }, "json");
        });
    }

    // Fetch user's location
    getUserLocation().then(function(location) {
        // Extract coordinates
        var coordinates = location.loc.split(',');
        var latitude = coordinates[0];
        var longitude = coordinates[1];

        // Fetch weather data based on coordinates
        getWeatherData(latitude, longitude).then(function(weatherData) {
            // Extract temperature in Celsius and Fahrenheit
            var tempInCelsius = (weatherData.main.temp - 273.15).toFixed(2);
            var tempInFahrenheit = ((weatherData.main.temp - 273.15) * 9 / 5 + 32).toFixed(2);

            // Create HTML structure for weather widget
            var weatherWidget = $("#weather-widget");
            weatherWidget.html(`
                <h2>${weatherData.name}, ${weatherData.sys.country}</h2>
                <p>${weatherData.weather[0].description}</p>
                <div class="temperature">
                    <p>${tempInCelsius} °C</p>
                    <p>${tempInFahrenheit} °F</p>
                </div>
                <p>Humidity: ${weatherData.main.humidity}%</p>
                <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
            `);
        });
    });
});
