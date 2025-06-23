
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherInfo = document.getElementById('weather-info');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const currentTime = document.getElementById('current-time');

// Update current time
function updateCurrentTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    currentTime.textContent = `Updated: ${now.toLocaleDateString('en-US', options)}`;
}

// Initialize current time
updateCurrentTime();
setInterval(updateCurrentTime, 60000); // Update every minute

searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
});

function setWeatherBackground(temp, weatherMain, description) {
    const body = document.body;
    body.className = ''; // Clear existing classes

    const weatherMainLower = weatherMain.toLowerCase();
    let condition = 'moderate'; // Default

    // Determine weather condition and icon
    if (temp < 15 || weatherMainLower.includes('snow') || weatherMainLower.includes('rain') || description.includes('cold')) {
        condition = 'cold';
        weatherIcon.textContent = '❄️';
    } else if (temp > 25 || weatherMainLower.includes('clear') || description.includes('sunny')) {
        condition = 'hot';
        weatherIcon.textContent = '☀️';
    } else {
        condition = 'moderate';
        weatherIcon.textContent = '⛅';
    }

    // Override icons for specific conditions
    const weatherIcons = {
        rain: '🌧️',
        drizzle: '🌦️',
        snow: '🌨️',
        thunderstorm: '⛈️',
        clouds: '☁️',
        clear: '☀️',
        mist: '🌫️',
        fog: '🌫️',
        haze: '🌫️',
        smoke: '🌫️'
    };
    weatherIcon.textContent = weatherIcons[weatherMainLower] || weatherIcon.textContent;

    // Apply condition class
    body.classList.add(condition);
}

function createWeatherDetails(data) {
    // Remove existing details
    const existingDetails = document.querySelector('.weather-details');
    if (existingDetails) {
        existingDetails.remove();
    }

    // Create new details container
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'weather-details';

    const details = [
        { label: 'Feels Like', value: `${Math.round(data.main.feels_like)}°C`, icon: '🌡️' },
        { label: 'Humidity', value: `${data.main.humidity}%`, icon: '💧' },
        { label: 'Wind Speed', value: `${Math.round(data.wind?.speed || 0)} m/s`, icon: '💨' },
        { label: 'Pressure', value: `${data.main.pressure} hPa`, icon: '🌀' },
        { label: 'Visibility', value: `${Math.round((data.visibility || 10000) / 1000)} km`, icon: '👁️' },
        { label: 'UV Index', value: 'N/A', icon: '☀️' } // Note: UV index requires separate API call
    ];

    details.forEach(detail => {
        const detailItem = document.createElement('div');
        detailItem.className = 'detail-item';
        detailItem.innerHTML = `
                    <div class="detail-label">${detail.icon} ${detail.label}</div>
                    <div class="detail-value">${detail.value}</div>
                `;
        detailsContainer.appendChild(detailItem);
    });

    weatherInfo.appendChild(detailsContainer);
}

async function getWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        alert('Please enter a city name');
        return;
    }

    // Show loading state
    cityName.innerHTML = '<span class="spinner"></span> Loading...';
    cityName.classList.add('loading');
    temperature.textContent = '';
    description.textContent = 'Fetching weather data...';
    weatherIcon.textContent = '⏳';

    // Remove existing details
    const existingDetails = document.querySelector('.weather-details');
    if (existingDetails) {
        existingDetails.remove();
    }

    // Working API key (this is a public demo key)
    const apikey = 'fb82cf1d561418421640706e72ac1f52';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apikey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(response.status === 404 ? 'City not found. Please check the spelling and try again.' : 'Failed to fetch weather data. Please try again later.');
        }
        const data = await response.json();

        // Update UI with weather data
        cityName.textContent = `${data.name}${data.sys?.country ? ', ' + data.sys.country : ''}`;
        temperature.textContent = `${Math.round(data.main.temp)}°C`;
        description.textContent = data.weather[0].description;

        // Set background and icon
        setWeatherBackground(data.main.temp, data.weather[0].main, data.weather[0].description);

        // Create detailed weather information
        createWeatherDetails(data);

        // Update current time
        updateCurrentTime();

        // Apply animations
        cityName.classList.remove('error', 'loading');
        weatherInfo.classList.add('fade-in');
        weatherIcon.classList.add('pulse');

        // Remove animation classes after animation completes
        setTimeout(() => {
            weatherInfo.classList.remove('fade-in');
            weatherIcon.classList.remove('pulse');
        }, 600);

        // Clear input
        cityInput.value = '';

    } catch (error) {
        console.error('Error fetching weather:', error);
        cityName.textContent = error.message || 'An error occurred. Please try again.';
        cityName.classList.remove('loading');
        cityName.classList.add('error');
        temperature.textContent = '';
        description.textContent = 'Unable to fetch weather data';
        weatherIcon.textContent = '❌';
        document.body.className = '';

        // Remove details if they exist
        const existingDetails = document.querySelector('.weather-details');
        if (existingDetails) {
            existingDetails.remove();
        }
    }
}

// Add some example cities on page load
window.addEventListener('load', () => {
    const examples = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney'];
    const randomCity = examples[Math.floor(Math.random() * examples.length)];
    cityInput.placeholder = `Enter city name (e.g., ${randomCity})`;
});
