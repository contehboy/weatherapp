const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const historyList = document.getElementById("historyList");
const currentWeatherDiv = document.getElementById("currentWeather");
const forecastCardsDiv = document.getElementById("forecastCards");

const apiKey = "3e2ecf03878372a7628c5d6619393916";
const historyKey = "weather_search_history";
let searchHistory = [];

// Load search history from localStorage, if available
const savedHistory = localStorage.getItem(historyKey);
if (savedHistory) {
  searchHistory = JSON.parse(savedHistory);
  renderHistory();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (city === "") {
    alert("Please enter a city name.");
    return;
  }

  getWeatherData(city);
  cityInput.value = "";
});

function getWeatherData(city) {
  fetchCoordinates(city)
    .then((coordinates) => fetchWeatherData(coordinates))
    .then((data) => displayWeatherData(data))
    .catch((error) => {
      console.error("Error fetching data:", error);
      alert("An error occurred. Please try again later.");
    });
}

async function fetchCoordinates(city) {
  const geocodingURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`;
  const geocodingResponse = await fetch(geocodingURL);
  const [locationData] = await geocodingResponse.json();

  if (!locationData) {
    throw new Error("City not found. Please enter a valid city name.");
  }

  return { lat: locationData.lat, lon: locationData.lon };
}

async function fetchWeatherData(coordinates) {
  const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}`;
  const weatherResponse = await fetch(weatherURL);
  const weatherData = await weatherResponse.json();

  return weatherData;
}

function displayWeatherData(data) {
  // Display current weather conditions
  const currentWeather = data.list[0];
  const currentTempCelsius = Math.round(currentWeather.main.temp - 273.15); // Convert Kelvin to Celsius
  const currentTempFahrenheit = Math.round((currentTempCelsius * 9) / 5 + 32); // Convert Celsius to Fahrenheit
  const iconURL = `https://openweathermap.org/img/w/${currentWeather.weather[0].icon}.png`;

  const currentWeatherHTML = `
    <h2>${data.city.name}</h2>
    <p>Date: ${new Date(currentWeather.dt * 1000).toLocaleDateString()}</p>
    <p><img src="${iconURL}" alt="Weather Icon"></p>
    <p>Temperature: ${currentTempFahrenheit}°F (${currentTempCelsius}°C)</p>
    <p>Humidity: ${currentWeather.main.humidity}%</p>
    <p>Wind Speed: ${currentWeather.wind.speed} m/s</p>
  `;

  currentWeatherDiv.innerHTML = currentWeatherHTML;

  // Display 5-day forecast

  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  const forecastHTML = data.list
    .slice(1, 6)
    .map((item) => {
      const date = currentDate.toLocaleDateString();
      currentDate.setDate(currentDate.getDate() + 1);
      const tempCelsius = Math.round(item.main.temp - 273.15); // Convert Kelvin to Celsius
      const tempFahrenheit = Math.round((tempCelsius * 9) / 5 + 32); // Convert Celsius to Fahrenheit
      const iconURL = `https://openweathermap.org/img/w/${item.weather[0].icon}.png`;

      return `
      <div class="forecast-card">
        <p>Date: ${date}</p>
        <p><img src="${iconURL}" alt="Weather Icon"></p>
        <p>Temperature: ${tempFahrenheit}°F (${tempCelsius}°C)</p>
        <p>Wind Speed: ${item.wind.speed} m/s</p>
        <p>Humidity: ${item.main.humidity}%</p>
      </div>
    `;
    })
    .join("");

  forecastCardsDiv.innerHTML = forecastHTML;

  // Add the city to the search history
  addToSearchHistory(data.city.name);
}

function addToSearchHistory(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    // Limit the history to the last 8 searched cities
    if (searchHistory.length > 8) {
      searchHistory.shift();
    }
    renderHistory();
    // Save the updated history to localStorage
    localStorage.setItem(historyKey, JSON.stringify(searchHistory));
  }
}

function renderHistory() {
  historyList.innerHTML = "";
  searchHistory.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => getWeatherData(city));
    historyList.appendChild(li);
  });
}
