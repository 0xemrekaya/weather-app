
export interface WeatherCondition {
    id: number;

    main: string;

    description: string;

    icon: string;
}

export interface WeatherMain {
    temp: number;

    feels_like: number;

    temp_min: number;

    temp_max: number;

    humidity: number;
}

export interface WeatherData {
    weather: WeatherCondition[];

    main: WeatherMain;

    id: number;
}