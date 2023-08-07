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
