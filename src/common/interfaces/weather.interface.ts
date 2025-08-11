// Weather condition interface
// Represents the weather condition information
export interface WeatherCondition {
    id: number;
    main: string;
    description: string;
    icon: string;
}

// Represents the main weather information
// Contains temperature and pressure data
export interface WeatherMain {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
}

// Represents the complete weather data response
// Contains weather conditions and main weather information
export interface WeatherData {
    weather: WeatherCondition[];
    main: WeatherMain;
    id: number;
}