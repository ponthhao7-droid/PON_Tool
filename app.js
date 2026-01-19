// Configuration
const CONFIG = {
    GEOCODING_API: 'https://geocoding-api.open-meteo.com/v1/search',
    WEATHER_API: 'https://api.open-meteo.com/v1/forecast',
    WEATHER_CODES: {
        0: { icon: '☀️', description: 'Clear sky' },
        1: { icon: '🌤️', description: 'Mainly clear' },
        2: { icon: '⛅', description: 'Partly cloudy' },
        3: { icon: '☁️', description: 'Overcast' },
        45: { icon: '🌫️', description: 'Foggy' },
        48: { icon: '🌫️', description: 'Depositing rime fog' },
        51: { icon: '🌧️', description: 'Light drizzle' },
        53: { icon: '🌧️', description: 'Moderate drizzle' },
        55: { icon: '🌧️', description: 'Dense drizzle' },
        61: { icon: '🌧️', description: 'Slight rain' },
        63: { icon: '🌧️', description: 'Moderate rain' },
        65: { icon: '🌧️', description: 'Heavy rain' },
        71: { icon: '❄️', description: 'Slight snow' },
        73: { icon: '❄️', description: 'Moderate snow' },
        75: { icon: '❄️', description: 'Heavy snow' },
        77: { icon: '❄️', description: 'Snow grains' },
        80: { icon: '🌧️', description: 'Slight rain showers' },
        81: { icon: '🌧️', description: 'Moderate rain showers' },
        82: { icon: '🌧️', description: 'Violent rain showers' },
        85: { icon: '❄️', description: 'Slight snow showers' },
        86: { icon: '❄️', description: 'Heavy snow showers' },
        95: { icon: '⛈️', description: 'Thunderstorm' },
        96: { icon: '⛈️', description: 'Thunderstorm with slight hail' },
        99: { icon: '⛈️', description: 'Thunderstorm with heavy hail' }
    }
};

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const geoBtn = document.getElementById('geoBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const weatherContainer = document.getElementById('weatherContainer');

// Event Listeners
searchBtn.addEventListener('click', () => searchByCity());
geoBtn.addEventListener('click', () => useGeolocation());
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchByCity();
});

/**
 * Get weather icon and description for a weather code
 */
function getWeatherInfo(code) {
    return CONFIG.WEATHER_CODES[code] || { icon: '🌤️', description: 'Unknown' };
}

/**
 * Convert wind direction angle to cardinal direction
 */
function getWindDirection(angle) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((angle % 360) / 22.5);
    return `${directions[index]} (${Math.round(angle)}°)`;
}

/**
 * Format date to readable day name
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Format time to readable format
 */
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    loadingSpinner.style.display = 'none';
    weatherContainer.style.display = 'none';
}

/**
 * Clear error message
 */
function clearError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
}

/**
 * Show loading spinner
 */
function showLoading() {
    loadingSpinner.style.display = 'flex';
    loadingSpinner.style.flexDirection = 'column';
    loadingSpinner.style.alignItems = 'center';
    weatherContainer.style.display = 'none';
    clearError();
}

/**
 * Display weather data
 */
function displayWeather(data, locationName) {
    const current = data.current_weather;
    const daily = data.daily;
    const timezone = data.timezone;

    // Update location info
    document.getElementById('locationName').textContent = locationName;
    document.getElementById('locationCoords').textContent = 
        `Latitude: ${current.latitude.toFixed(2)}°, Longitude: ${current.longitude.toFixed(2)}°`;

    // Get weather info
    const weatherInfo = getWeatherInfo(current.weather_code);
    
    // Update current weather
    document.getElementById('weatherIcon').textContent = weatherInfo.icon;
    document.getElementById('temperature').textContent = Math.round(current.temperature);
    document.getElementById('weatherDescription').textContent = weatherInfo.description;
    document.getElementById('windSpeed').textContent = `${current.windspeed} ${current.windspeed_units}`;
    document.getElementById('windDirection').textContent = getWindDirection(current.winddirection);
    document.getElementById('updateTime').textContent = formatTime(current.time);

    // Update forecast
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    for (let i = 0; i < daily.time.length; i++) {
        const day = daily.time[i];
        const weatherCode = daily.weather_code[i];
        const minTemp = daily.temperature_2m_min[i];
        const maxTemp = daily.temperature_2m_max[i];
        const condition = getWeatherInfo(weatherCode);

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="day">${formatDate(day)}</div>
            <div class="icon">${condition.icon}</div>
            <div class="temp-range">
                <strong>${Math.round(maxTemp)}°</strong>
                <span style="opacity: 0.6;">${Math.round(minTemp)}°</span>
            </div>
            <div class="condition">${condition.description}</div>
        `;
        forecastContainer.appendChild(forecastItem);
    }

    // Show weather container
    loadingSpinner.style.display = 'none';
    weatherContainer.style.display = 'block';
}

/**
 * Fetch weather for coordinates
 */
async function fetchWeather(latitude, longitude, locationName) {
    try {
        showLoading();
        
        const response = await fetch(
            `${CONFIG.WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();
        displayWeather(data, locationName);
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError('Failed to fetch weather data. Please try again.');
    }
}

/**
 * Search for city by name
 */
async function searchByCity() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        showLoading();
        clearError();
        
        const response = await fetch(
            `${CONFIG.GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            showError(`No location found for "${city}". Please try another search.`);
            return;
        }

        const location = data.results[0];
        const locationName = `${location.name}${location.admin1 ? ', ' + location.admin1 : ''}${location.country ? ', ' + location.country : ''}`;
        
        fetchWeather(location.latitude, location.longitude, locationName);
    } catch (error) {
        console.error('Geocoding error:', error);
        showError('Failed to search for location. Please try again.');
    }
}

/**
 * Use browser geolocation
 */
function useGeolocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading();
    geoBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                // Try to get location name from reverse geocoding
                const response = await fetch(
                    `${CONFIG.GEOCODING_API}?latitude=${latitude}&longitude=${longitude}&language=en&format=json`
                );
                
                let locationName = `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`;
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        const location = data.results[0];
                        locationName = `${location.name}${location.admin1 ? ', ' + location.admin1 : ''}${location.country ? ', ' + location.country : ''}`;
                    }
                }
                
                fetchWeather(latitude, longitude, locationName);
            } catch (error) {
                console.error('Reverse geocoding error:', error);
                fetchWeather(latitude, longitude, `Your Location`);
            } finally {
                geoBtn.disabled = false;
            }
        },
        (error) => {
            geoBtn.disabled = false;
            let errorMsg = 'Unable to get your location';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = 'Location permission denied. Please enable location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMsg = 'Location request timed out.';
                    break;
            }
            
            showError(errorMsg);
        }
    );
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    clearError();
    // Optional: Load weather for a default city on startup
    // cityInput.value = 'London';
    // searchByCity();
});
