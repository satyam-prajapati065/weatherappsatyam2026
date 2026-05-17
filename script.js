let msg_box = document.querySelector(".msg-box");
const today_content = document.querySelector(".today-content");
let area = document.querySelectorAll(".location-box span");
let current_date = document.querySelectorAll("#day-date span");
let current_temp = document.getElementById("temprature");
let curr_img = document.querySelectorAll("#curr-img")[1];
let rain_val = document.querySelectorAll("#rain-val");
const overlay = document.getElementById("overlay");

const current_page = document.querySelector(".current-page");
const main_page = document.querySelector(".main-page");
const main_content = document.querySelector(".main-content");

const apiKey = "2870f5996f1748459db30500261705";
const apiUrl = "https://api.weatherapi.com/v1/forecast.json?key=";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const degree = "°C";

function set_img_url(url_text) {
  url_text = url_text.toLowerCase().trim();
  if (url_text === "partly cloudy") {
    url_text = "partly-cloudy";
  } else if (
    url_text === "patchy rain nearby" ||
    url_text === "light freezing rain"
  ) {
    url_text = "patchy-rain-possible";
  } else if (
    url_text === "light snow" ||
    url_text === "heavy snow" ||
    url_text === "blowing snow"
  ) {
    url_text = "light-snow";
  } else if (url_text === "rain") {
    url_text = "patchy-rain-possible";
  }
  let url = `https://www.aqi.in/media/weather-icons/${url_text}.svg`;
  return url;
}

async function checkWeather(city) {
  overlay.style.display = "flex";

  try {
    const response = await fetch(`${apiUrl}${apiKey}&q=${city}&days=7&aqi=yes`);
    const data = await response.json();

    if (data.error) {
      msg_box.innerText = "👉 City not found!";
      msg_box.style.color = "red";
      return false;
    }

    area[0].innerText = data.location.name;
    area[1].innerText = data.location.region;
    area[2].innerText = data.location.country;

    let full_date = new Date(data.location.localtime);
    let current_time = full_date.getHours();
    let day = full_date.getDate();

    current_date[0].innerText = `${days[full_date.getDay()]},`;
    current_date[1].innerText = `${day} ${months[full_date.getMonth()]}`;

    current_temp.innerText = `${data.current.temp_c}°`;
    if (curr_img) curr_img.src = set_img_url(data.current.condition.text);

    rain_val[0].innerText = `${data.forecast.forecastday[0].day.daily_chance_of_rain}%`;
    rain_val[1].innerText = `${data.current.wind_kph} km/h`;
    rain_val[2].innerText = `${data.current.humidity}%`;

    today_content.innerHTML = "";

    let combined_hours = [...data.forecast.forecastday[0].hour];
    if (data.forecast.forecastday[1]) {
      combined_hours = combined_hours.concat(data.forecast.forecastday[1].hour);
    }

    for (let i = current_time + 1; i < current_time + 9; i++) {
      if (!combined_hours[i]) break;

      let hour_data = combined_hours[i];

      let time_zone = document.createElement("div");
      time_zone.classList.add("time-zone");

      let time_temp = document.createElement("span");
      time_temp.id = "time-temp";
      time_temp.innerText = `${hour_data.temp_c}${degree}`;

      let time_zone_img = document.createElement("img");
      time_zone_img.src = set_img_url(hour_data.condition.text);

      let today_time = new Date(hour_data.time);
      let hh = today_time.getHours().toString().padStart(2, "0");
      let mm = today_time.getMinutes().toString().padStart(2, "0");

      let time_zone_time = document.createElement("span");
      time_zone_time.innerText = `${hh}:${mm}`;

      time_zone.append(time_temp, time_zone_img, time_zone_time);
      today_content.appendChild(time_zone);
    }

    let next_forecast_con = document.querySelector(
      ".next-forecast-con .next-content",
    );
    next_forecast_con.innerHTML = "";

    for (let i = 1; i < 7; i++) {
      if (!data.forecast.forecastday[i]) break;

      let days_forecast = document.createElement("div");
      days_forecast.classList.add("days-forecast");

      let next_date = new Date(data.forecast.forecastday[i].date);
      let day1 = document.createElement("span");
      day1.id = "day1";
      day1.innerText = days[next_date.getDay()];

      let nextDateImg = document.createElement("img");
      nextDateImg.src = set_img_url(
        data.forecast.forecastday[i].day.condition.text,
      );

      let day_temp = document.createElement("span");
      day_temp.id = "day-temp";
      day_temp.innerText = `${data.forecast.forecastday[i].day.avgtemp_c}${degree}`;

      days_forecast.append(day1, nextDateImg, day_temp);
      next_forecast_con.appendChild(days_forecast);
    }

    return true;
  } catch (err) {
    console.error(err);
    msg_box.innerText = "⚠️ Something went wrong. Try again.";
    return false;
  } finally {
    overlay.style.display = "none";
  }
}

const start = async () => {
  let search_val = document.querySelector("#search").value.trim();
  if (search_val === "") {
    msg_box.innerText = "👉 Please search any city";
    msg_box.style.color = "red";
    return;
  }

  msg_box.innerText = "";
  let isSuccess = await checkWeather(search_val);

  if (isSuccess) {
    current_page.style.display = "none";
    main_page.style.display = "block";
    main_content.scrollTop = 0;
    today_content.scrollLeft = 0;
  }
};

const st_btn = document.querySelector("#st-btn");
st_btn.addEventListener("click", start);

const change_btn = document.querySelector("#change-btn");
change_btn.addEventListener("click", () => {
  current_page.style.display = "";
  main_page.style.display = "none";
  msg_box.innerText = "";
  let search = document.querySelector("#search");
  search.value = "";
  search.focus();
});

document.addEventListener("contextmenu", (event) => event.preventDefault());
document.addEventListener("keydown", (e) => {
  if (e.key === "F12" || (e.ctrlKey && e.key.toLowerCase() === "u")) {
    e.preventDefault();
    return false;
  }
  if (e.key === "Enter") {
    start();
  }
});
