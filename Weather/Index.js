const apiKey = 'acc7c33d9829b7b9f019a4ac025c077b';
const cityInput = document.getElementById('city-input');
const locationBtn = document.getElementById('location-btn');
const unitToggle = document.getElementById('unit-toggle');
const forecastContainer = document.getElementById('forecast-container');
const hourlyContainer = document.getElementById('hourly-container');
const suggestionsBox = document.getElementById('suggestions');
let isCelsius = true;


//init event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    locationBtn.addEventListener('click', getCurrentLocationWeather);
    cityInput.addEventListener('input', showSuggestions);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchWeatherByCity(cityInput.value);
        }
    });
    unitToggle.addEventListener('click', toggleUnits);
});

//fetch weather data by city name
function fetchWeatherByCity(city) {
    const units = isCelsius ? 'metric' : 'imperial';
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
            fetchFiveDayForecast(data.coord.lat, data.coord.lon);
            fetchHourlyForecast(data.coord.lat, data.coord.lon);
        })
        .catch(error => alert('City not found'));
}

//fetch and display 5-day weather forecast
function fetchFiveDayForecast(lat, lon) {
    const units = isCelsius ? 'metric' : 'imperial';
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            forecastContainer.innerHTML = ''; //clear previous forecast data or override
            const daysMap = {};  //track unique days

            data.list.forEach((item) => {
                const date = item.dt_txt.split(' ')[0];
                if (!daysMap[date]) {
                    daysMap[date] = item; //save one forecast per day
                }
            });

            //display up to 5 days of forecast
            Object.values(daysMap).slice(0, 5).forEach((forecast) => {
                const forecastEl = document.createElement('div');
                forecastEl.classList.add('forecast-item');
                forecastEl.innerHTML = `
                    <p>${new Date(forecast.dt_txt).toLocaleDateString()}</p>
                    <p>${Math.round(forecast.main.temp)}°</p>
                    <p>${forecast.weather[0].description}</p>
                    <span>${getWeatherIcon(forecast.weather[0].id)}</span>
                `;
                forecastContainer.appendChild(forecastEl);
            });
        });
}

//fetch and display hourly weather forecast
function fetchHourlyForecast(lat, lon) {
    const units = isCelsius ? 'metric' : 'imperial';
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            hourlyContainer.innerHTML = ''; //clear previous hourly data or override
            //limit to 5 items by slice
            data.list.slice(0, 5).forEach((item) => {
                const hourlyEl = document.createElement('div');
                hourlyEl.classList.add('hourly-item');
                hourlyEl.innerHTML = `
                    <p>${new Date(item.dt_txt).getHours()}:00</p>
                    <p>${Math.round(item.main.temp)}°</p>
                    <p>${item.weather[0].description}</p>
                    <span>${getWeatherIcon(item.weather[0].id)}</span>
                `;
                hourlyContainer.appendChild(hourlyEl);
            });
        });
}

//get current location weather using geolocation
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoordinates(latitude, longitude); //fetch by coordinates
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

//fetch weather by coordinates
function fetchWeatherByCoordinates(lat, lon) {
    const units = isCelsius ? 'metric' : 'imperial';
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data); //display current weather
            fetchFiveDayForecast(lat, lon);//fetch 5-day forecast
            fetchHourlyForecast(lat, lon);//fetch hourly forecast
        })
        .catch(error => alert('Error fetching weather data'));
}

//display current weather information
function displayCurrentWeather(data) {
    document.getElementById('city-name').innerText = data.name;
    document.getElementById('country-name').innerText = data.sys.country;
    document.getElementById('current-temp').innerText = `${Math.round(data.main.temp)}°`;
    document.getElementById('weather-icon').innerText = getWeatherIcon(data.weather[0].id);
    document.getElementById('weather-desc').innerText = data.weather[0].description;
    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
    document.getElementById('wind-speed').innerText = `${Math.round(data.wind.speed)} km/h`;
    document.getElementById('pressure').innerText = `${data.main.pressure} hPa`;
    document.getElementById('current-time').innerText = `Time: ${new Date().toLocaleTimeString()}`;
}

//get corresponding weather icon (smilikss) based on weather ID
function getWeatherIcon(id) {
    if (id >= 200 && id < 300) {
        return '⛈️';
    } else if (id >= 300 && id < 400) {
        return '🌦️';
    } else if (id >= 500 && id < 600) {
        return '🌧️';
    } else if (id >= 600 && id < 700) {
        return '❄️';
    } else if (id >= 700 && id < 800) {
        return '🌫️';
    } else if (id === 800) {
        return '☀️';
    } else if (id > 800) {
        return '☁️';
    }
    return '';
}

//display city suggestions as user types
function showSuggestions() {
    const query = cityInput.value;
    if (query.length < 3) {
        suggestionsBox.style.display = 'none'; //dont show  if query is short
        return;
    }
    suggestionsBox.style.display = 'block';
    suggestionsBox.innerHTML = '';//clear old suggestions
    fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.list) {
                data.list.forEach(city => {
                    const suggestion = document.createElement('div');
                    suggestion.textContent = `${city.name}, ${city.sys.country}`;
                    suggestion.addEventListener('click', () => {
                        cityInput.value = suggestion.textContent;
                        fetchWeatherByCity(city.name);//Fetch weather on click
                    });
                    suggestionsBox.appendChild(suggestion);
                });
            }
        });
}

//toggle between Celsius and Fahrenheit units
function toggleUnits() {
    isCelsius = !isCelsius;
    unitToggle.innerText = isCelsius ? '°C/°F' : '°F/°C';
    const city = cityInput.value;
    if (city) {
        fetchWeatherByCity(city);//refresh weather in new units
    }
}
