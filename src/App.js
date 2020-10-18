import React from "react";
import Select from "react-select";
import "./App.css";
import axios from "axios";
import moment from "moment";
import Rain from "../images/rainy.svg";
import Clear from "../images/sunny.svg";
import Cloudy from "../images/cloudy.svg";
import Search from "../images/search-glass.svg";
import Location from "../images/location-pin.svg";
import { getAjaxCall } from "./Ajax";
import {
	AreaChart,
	Area,
	linearGradient,
	ResponsiveContainer,
	ReferenceLine,
	Line,
	CartesianGrid,
	XAxis,
	Tooltip,
	YAxis,
} from "recharts";
import cities from "./cities";
import { isNotEmpty } from "./Helper";

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loader: true,
			weather: {
				appid: "751859150fe4bc46f39254a09262798b",
				unit: "metric",
				lon: "",
				lat: "",
			},
		};
		this.getPosition = this.getPosition.bind(this);
		this.error = this.error.bind(this);
		this.timeLine = this.timeLine.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		let { loader } = this.state;
		if ("geolocation" in navigator) {
			// check if geolocation is supported/enabled on current browser
			navigator.geolocation.getCurrentPosition(this.getPosition, this.error);
		}
		getAjaxCall(
			"http://ip-api.com/json",
			function (data, error) {
				console.log(data);
			}.bind(this)
		);
	}

	error(error_message) {
		console.error(
			"An error has occured while retrieving location",
			error_message
		);
	}
	getPosition(position) {
		let { weather } = this.state;
		let weatherData;
		let weekData = [];
		let daySelect;
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;
		weather.lon = longitude;
		weather.lat = latitude;
		let api = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=${weather.unit}&appid=${weather.appid}`;

		getAjaxCall(
			api,
			function (data, error) {
				if (data) {
					data["daily"].map((res) => {
						let temp = {};
						temp.day = moment.unix(res.dt).format("ddd");
						temp.date = moment.unix(res.dt).format("Do");
						temp.min = res.temp.min.toFixed();
						temp.max = res.temp.max.toFixed();
						temp.pressure = res.pressure;
						temp.humidity = res.humidity;
						temp.sunrise = moment.unix(res.sunrise).format("h:mma");
						temp.sunset = moment.unix(res.sunset).format("h:mma");
						temp.current =
							moment.unix(data["current"].dt).format("Do") ==
							moment.unix(res.dt).format("Do");
						temp.type = res.weather[0].main;
						switch (res.weather[0].main) {
							case "Rain":
								temp.img = <img src={Rain} alt={data.type} />;
								break;
							case "Clear":
								temp.img = <img src={Clear} alt={data.type} />;
								break;
							case "Clouds":
								temp.img = <img src={Cloudy} alt={data.type} />;
								break;

							default:
								break;
						}
						weekData.push(temp);
						temp.current ? (daySelect = temp) : null;
					});
					weatherData = data;
					this.setState(
						{
							weather,
							loader: false,
							weekData: weekData,
							weatherData: weatherData,
							daySelect: daySelect,
						},
						() => this.timeLine(daySelect)
					);
				} else {
					console.log(error);
				}
			}.bind(this)
		);
	}

	timeLine(data) {
		let { weatherData } = this.state;
		let timeFrame = [];
		weatherData.hourly.map((hour) => {
			let date = moment.unix(hour.dt).format("Do");
			if (date == data.date) {
				let temp = {};
				temp.temperature = hour.temp.toFixed(1);
				temp.time = moment.unix(hour.dt).format("ha");
				timeFrame.push(temp);
			}
		});

		let dayFrame = [
			{ time: "5am", value: data.sunrise },
			{ time: "3pm", value: "12pm" },
			{ time: "7pm", value: data.sunset },
		];

		this.setState({
			timeFrame: timeFrame,
			daySelect: data,
			dayFrame: dayFrame,
		});
	}

	handleChange(e) {
		let { weather } = this.state;
		let filtered;
		if (e.target.value) {
			filtered = cities.filter((ct, index) => {
				if (ct.name.toLowerCase().includes(e.target.value)) {
					return ct;
				}
			});

			if (filtered.length > 1) {
				filtered.map((city, index) => {
					if (index < 10) {
						let api = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=${weather.unit}&appid=${weather.appid}`;
						getAjaxCall(
							api,
							function (data, error) {
								if (data) {
									filtered[index].temp = data.main.temp.toFixed();
									filtered[index].type = data.weather[0].main;
								} else {
									console.log(error);
								}
							}.bind(this)
						);
					}
				});
			}
		}
		this.setState({
			filtered: filtered,
			value: e.target.value,
		});
	}

	render() {
		let {
			loader,
			weatherData,
			weekData,
			timeFrame,
			dayFrame,
			daySelect,
			value,
			hide,
			filtered,
		} = this.state;

		if (loader) {
			return <div className="loader"></div>;
		} else {
			return (
				<div>
					<div className="searchBarContainer">
						<img className="searchBarIcon locationIcon" src={Location} />
						<input
							type="text"
							onBlur={() => this.setState({ hide: true })}
							onFocus={() => this.setState({ hide: false })}
							className="searchBar"
							onChange={this.handleChange}
							placeholder="Search"
						/>

						<button className="searchButton">
							<img className="searchBarIcon" src={Search} />
						</button>
						<section
							style={hide ? { display: "none" } : {}}
							className="searchList">
							{isNotEmpty(filtered) &&
								filtered.map((city) => {
									if (city.temp) {
										return (
											<div className="searchListTab">
												<span>
													<span className="text-capitalize">
														{city.name.split(value)[0].bold[1]}
													</span>
													,<span className="text-lighter">{city.state}</span>
												</span>
												<div>
													<div className="d-flex justify-space-between">
														<div className="d-flex fd-column">
															<span>{city.temp}&deg;C</span>
															<span className="text-lighter">{city.type}</span>
														</div>
														<img
															className="searchListIcon"
															src={
																city.type == "Clear"
																	? Clear
																	: city.type == "Rain"
																	? Rain
																	: Cloudy
															}
														/>
													</div>
												</div>
											</div>
										);
									}
								})}
						</section>
					</div>
					<section className="forecastContainer">
						{isNotEmpty(weekData) &&
							weekData.map((data, index) => {
								return (
									<div key={index} className="dailyForecast">
										<input
											onClick={() => this.timeLine(data)}
											className="activeForecast"
											type="radio"
											name="active_day"
											value={data.date}
											checked={daySelect.date == data.date}
											readOnly
										/>
										<div className="dailyForecastDetail">
											<p>{data.day}</p>
											<p>
												<span>
													{data.max}
													&deg;
												</span>
												&nbsp;
												<span className="text-lighter">{data.min}&deg;</span>
											</p>
											<span className="dailyForecastImg">{data.img}</span>
											<p className="text-lighter">{data.type}</p>
										</div>
									</div>
								);
							})}
					</section>
					<section className="detailedContainer">
						<div className="detailedHeader">
							<h1>{daySelect.max}&deg;C</h1>
							{daySelect.img}
						</div>
						<div className="detailedGraph">
							<AreaChart width={1400} height={250} data={timeFrame}>
								<defs>
									<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#00a6fa" stopOpacity={0.6} />
										<stop offset="50%" stopColor="#00a6fa" stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis
									axisLine={false}
									tickLine={false}
									dataKey="time"
									domain={[0, "dataMax"]}
								/>
								<CartesianGrid
									horizontal={false}
									strokeWidth="3"
									strokeOpacity="0.4"
									fill="none"
									fill="none"
									stroke="#ccc"
								/>
								<Tooltip />

								<Area
									dataKey="temperature"
									stroke="#00a6fa"
									fillOpacity={1}
									fill="url(#colorUv)"
									dot={{
										r: 5,
										stroke: "#00a6fa",
										strokeWidth: "2",
										fillOpacity: "1",
										fill: "white",
										width: "1360",
										height: "210",
										class: "recharts-dot recharts-area-dot",
										cx: "10",
										cy: "76.74062500000002",
									}}
								/>
							</AreaChart>
						</div>
						<div className="detailedStats">
							<div>
								<span className="bold">Pressure</span>
								<span>{daySelect.pressure} hpa</span>
							</div>
							<div>
								<span className="bold">Humidity</span>
								<span>{daySelect.humidity}%</span>
							</div>
						</div>
						<div className="d-flex justify-space-between">
							<div className="d-flex fd-column">
								<span className="bold">Sunrise </span>
								<span className="text-lighter">{daySelect.sunrise}</span>
							</div>
							<div className="d-flex fd-column">
								<span className="bold">Sunset </span>
								<span className="text-lighter">{daySelect.sunset}</span>
							</div>
						</div>
						<div style={{ height: "200px" }}>
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={dayFrame}>
									<defs>
										<linearGradient id="time" x1="0" y1="0" x2="0" y2="1">
											<stop
												offset="5%"
												stopColor="#F7E0AF"
												stopOpacity="0.6"></stop>
											<stop
												offset="90%"
												stopColor="#F7E0AF"
												stopOpacity="0.1"></stop>
										</linearGradient>
									</defs>
									<XAxis dataKey={"time"} tickLine={false} />

									<Area
										type="monotone"
										dataKey="value"
										stroke="#F7E0AF"
										fill="time"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</section>
				</div>
			);
		}
	}
}
