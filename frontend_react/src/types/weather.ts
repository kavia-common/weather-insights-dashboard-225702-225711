export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph';
export type PrecipUnit = 'mm' | 'inch';

export interface UnitsSettings {
  temperature: TemperatureUnit;
  wind: WindSpeedUnit;
  precip: PrecipUnit;
}

export interface GeoResult {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export interface CurrentWeather {
  temperature_2m: number | null;
  apparent_temperature: number | null;
  wind_speed_10m: number | null;
  relative_humidity_2m: number | null;
  weather_code: number | null;
}

export interface DailyForecastItem {
  date: string;
  weather_code: number | null;
  temperature_2m_max: number | null;
  temperature_2m_min: number | null;
  precipitation_sum: number | null;
  wind_speed_10m_max: number | null;
  precipitation_probability_max?: number | null;
}

export interface HourlyPoint {
  time: string;
  temperature_2m: number | null;
  precip_mm?: number | null;
  precip_prob?: number | null; // percentage 0-100
  wind_speed?: number | null;  // per selected units (km/h or mph)
  wind_gust?: number | null;   // per selected units (km/h or mph)
  humidity?: number | null;    // percentage
}

export interface ForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  daily: DailyForecastItem[];
  hourly: HourlyPoint[];
}
