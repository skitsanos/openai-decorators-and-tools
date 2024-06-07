import {describe, describeReturn, openaiTool} from '../decorators/openai';

class WeatherService
{
    /**
     * Get an N-day weather forecast
     */
    @openaiTool
    @describeReturn('The weather forecast for the specified number of days')
    getNDayWeatherForecast(
        @describe({
            description: 'The city and state, e.g. San Francisco, CA',
            required: true
        }) location: string
    ): string
    {
        return JSON.stringify({
            location,
            temperature: 25,
            wind: '25m/s',
            condition: 'sunny'
        });
    }
}

export default WeatherService;