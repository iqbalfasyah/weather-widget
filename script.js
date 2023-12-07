$(document).ready(function() {
    const appId = 'fc464c0cf8adce4c9dbd6a16e276f04a';

    // Function to get weather data based on city name
    function getWeatherData(city) {
        return new Promise((resolve, reject) => {
            $.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},au&units=metric&appid=${appId}`, function(response) {
                resolve(response);
            }, "json").fail(function(error) {
                reject(error);
            });
        });
    }

    // Event listener for dropdown change
    $("#select-city").change(function() {
        var selectedCity = $(this).val();

        console.info(selectedCity);

        // Fetch weather data based on the selected city
        getWeatherData(selectedCity).then(function(weatherData) {

            console.info(weatherData);
            // Extract temperature in Celsius and Fahrenheit
            const tempInCelsius = Math.round(weatherData.main.temp)+ 'ºC';
            const weatherDesc = weatherData.weather[0].main;
            
            // Extract relevant information
            var dt = new Date(weatherData.dt * 1000);
            var sunrise = new Date(weatherData.sys.sunrise * 1000);
            var sunset = new Date(weatherData.sys.sunset * 1000);
            const currTimeZone = `Australia/${selectedCity}`; 
            // Convert times to local time
            var dtLocal = dt.toLocaleString('en-AU', { timeZone: currTimeZone });
            var sunriseLocal = sunrise.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: currTimeZone });
            var sunsetLocal = sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: currTimeZone });

            // Update HTML structure for weather widget
            var weatherWidget = $("#weather-widget");

            weatherWidget.find(".curr-temp-text-val").text(tempInCelsius);
            weatherWidget.find(".curr-temp-text-name").text(weatherDesc);
            weatherWidget.find(".sunrise-time").text(sunriseLocal);
            weatherWidget.find(".sunset-time").text(sunsetLocal);

        }).catch(function(error) {
            console.error("Error fetching weather data:", error);
        });
    });

    // $('#select-city').editableSelect();

});
