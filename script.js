$(document).ready(function() {
    
    function getLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
          alert("Geolocation is not supported by this browser.");
        }
      }
  
      function showPosition(position) {
        const currLat = position.coords.latitude;
        const currLong = position.coords.longitude;
        
        findClosestCity(currLat, currLong);
      }
  
      function showError(error) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            console.error("The request to get user location timed out.");
            break;
          case error.UNKNOWN_ERROR:
            console.error("An unknown error occurred.");
            break;
        }

        findClosestCity(0, 0);

      }
  
      // Example: Request location when the page loads
      getLocation();

    function findClosestCity(latitude, longitude) {
        // Function to calculate the distance between two sets of coordinates
        function calculateDistance(lat1, lon1, lat2, lon2) {
          const R = 6371; // Radius of the Earth in kilometers
          const dLat = (lat2 - lat1) * (Math.PI / 180);
          const dLon = (lon2 - lon1) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c; // Distance in kilometers
          return distance;
        }
      
        // Initialize variables to store closest city and minimum distance
        let closestCity = 'Sydney';
        let minDistance = Number.MAX_VALUE;
      
        const cities = {
            "Sydney": { "lat": -33.8679, "long": 151.2073 },
            "Melbourne": { "lat": -37.814, "long": 144.9633 },
            "Brisbane": { "lat": -27.4679, "long": 153.0281 },
            "Perth": { "lat": -31.9333, "long": 115.8333 },
            "Adelaide": { "lat": -34.9333, "long": 138.6 },
            "Canberra": { "lat": -35.2835, "long": 149.1281 },
            "Hobart": { "lat": -42.8794, "long": 147.3294 },
            "Darwin": { "lat": -12.4611, "long": 130.8418 }
          };

        // Iterate through each city in the weather data
        for (const cityName in cities) {
            const cityData = cities[cityName];
            const cityLat = cityData.lat;
            const cityLon = cityData.long;
        
            // Calculate the distance between the provided location and the city
            const distance = calculateDistance(latitude, longitude, cityLat, cityLon);
        
            // Check if the current city is closer than the previous closest city
            if (distance < minDistance) {
                minDistance = distance;
                closestCity = cityName;
            }
        }
        
        $("#select-city").val(closestCity);

        syncWeatherData();

    }
      
    const appId = 'fc464c0cf8adce4c9dbd6a16e276f04a';

    // Function to get weather data based on city name
    function getAPIWeatherData(city) {
        return new Promise((resolve, reject) => {
            $.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},au&units=metric&appid=${appId}`, function(response) {
                resolve(response);
            }, "json").fail(function(error) {
                reject(error);
            });
        });
    }

    // Get weather data and check expiration
    function getWeatherDataLocal(city) {
        const storedData = localStorage.getItem('weatherData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            const currentTime = new Date().getTime();
            const elapsedTime = currentTime - parsedData.timestamp;
        
            // Check if data has expired
            if (elapsedTime < 0 || elapsedTime >= 15 * 60 * 1000) {
                // Data has expired, remove it from local storage
                localStorage.removeItem('weatherData');
                return null;
            } else {
                // Data is still valid, filter by city and return it
                const cityData = parsedData.data.find(item => item.city.toLowerCase() === city.toLowerCase());
                return cityData || null;
            }
        } else {
            // No data in local storage
            return null;
        }
    }
    
    function setWeatherData(data) {
        const currentTime = new Date().getTime();

        const dataWithExpiration = {
          timestamp: currentTime,
          data: data
        };
        localStorage.setItem('weatherData', JSON.stringify(dataWithExpiration));
    }

    async function syncWeatherData(){
        const selectedCity = $("#select-city").val();

        let isSync = true;
        const isSyncLocal = getWeatherDataLocal(selectedCity) == null;

        console.log(`isSyncLocal: ${isSyncLocal}`);

        if(isSync && isSyncLocal){
            var listCity = $(".es-list li").map(function() {
                return $(this).text();
              }).get();
    
            let listDataWeatherCity = [];
            for (let i = 0; i < listCity.length; i++) {
                const city = listCity[i];
                
                const weatherData = await getAPIWeatherData(city);
                
                if(weatherData.cod == 200){
    
                    // Extract temperature in Celsius
                    const tempInCelsius = Math.round(weatherData.main.temp)+ 'ºC';
                    const weatherCoord = weatherData.coord;
                    const weatherSys = weatherData.sys;
                    const weather = weatherData.weather[0];
                    
                    // Extract relevant information
                    const sunrise = new Date(weatherSys.sunrise * 1000);
                    const sunset = new Date(weatherSys.sunset * 1000);
                    const currTimeZone = `Australia/${city}`; 
    
                    // Convert times to local time
                    const sunriseLocal = sunrise.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: currTimeZone });
                    const sunsetLocal = sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: currTimeZone });
    
                    const newObject = {
                        updated_at: new Date(), 
                        city: city,
                        temp_celsius: tempInCelsius,
                        weather_desc: weather.description.replace(/\w\S*/g, function (txt) {
                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                        }),
                        sunrise_time: sunriseLocal,
                        sunset_time: sunsetLocal,
                        icon: weather.icon,
                        long: weatherCoord.lon,
                        lat: weatherCoord.lat,
                        data_json: weatherData
                    };
    
                    //Update API
                    console.log(`${city}: ${newObject}`);
                    listDataWeatherCity.push(newObject);
                }
    
            }
    
            // set the item in localStorage in 15minutes
            setWeatherData(listDataWeatherCity);
            console.log(listDataWeatherCity);
        }else{
           
        }
        
        populateWeatherData(selectedCity);

    }

    function populateWeatherData(city){

        const weatherData = getWeatherDataLocal(city);

        if(weatherData != null){
            console.info(weatherData);

            // Update HTML structure for weather widget
            var weatherWidget = $("#weather-widget");

            weatherWidget.find(".curr-temp-text-val").text(weatherData.temp_celsius);
            weatherWidget.find(".curr-temp-text-name").text(weatherData.weather_desc);
            weatherWidget.find(".sunrise-time").text(weatherData.sunrise_time);
            weatherWidget.find(".sunset-time").text(weatherData.sunset_time);

            weatherWidget.find(".curr-temp-icon img").attr('src', 'https://openweathermap.org/img/wn/' + weatherData.icon + '@2x.png');

        }else{
            syncWeatherData();
        }
    }

    $('#select-city').editableSelect({
        effects: 'fade',
        filter:false
    }).on('select.editable-select', function (e, result) {
        var selectedCity = result.text();
        
        populateWeatherData(selectedCity);

        setTimeout(() => {
            $("ul.es-list").hide();
        }, 1);

        setTimeout(() => {
            $('#select-city').blur();
        }, 100);
    });
    
});
