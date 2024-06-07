// src/example.ts
import WeatherService from './mock/weather';

import OpenAI from 'openai';
import {getResponse} from './utils/llm';
import DateTimeService from './mock/datetime';

const openai = new OpenAI();

const msg: OpenAI.ChatCompletionMessageParam = {
    role: 'user',
    content: 'Hi, I am Evi.'
};

const memory = [
    msg
];

const response = getResponse('What time is it now? and what is the weather in Lisbon?', memory, {
    model: 'gpt-4o',
    client: openai,
    tools: [
        new DateTimeService().getDateAndTime,
        new WeatherService().getNDayWeatherForecast
    ]
});

for await (const chunk of response)
{
    console.log(chunk);
}

console.log(memory);




