# openai decorators and tool calling

> This repository aims to provide a robust framework for integrating various tools into a language model's response generation process, making it a valuable resource for developers looking to build sophisticated AI-driven applications.

Sshowcasing an advanced implementation of a language model response handler using OpenAI's API. The core functionality is centered around the getResponse method, which dynamically integrates various tools to enhance the accuracy and relevance of responses. Below is a concise overview of the key components and their usage.

#### Key Features

1. **Dynamic Tool Integration**: The `getResponse` method allows the inclusion of external tools, such as weather services or date-time utilities, to provide precise information based on user queries.
2. **Streaming Responses**: Leveraging OpenAI's streaming capabilities, the method efficiently processes and delivers real-time responses.
3. **Extensible Configuration**: The method's configuration is highly customizable, enabling easy adjustments and the addition of new tools.

#### `getResponse` Method

The `getResponse` method is designed to process user inputs and generate responses using the OpenAI API. It supports integrating additional tools to fetch specific information and includes a default system prompt to guide the assistant's behavior.

```typescript
import OpenAI from 'openai';
import { getResponse } from './utils/llm';
import WeatherService from './mock/weather';
import DateTimeService from './mock/datetime';

const openai = new OpenAI();


const memory = [
    { role: 'user', content: 'Hi, I am Joe.' }
];

const userInput = 'What time is it now? and what is the weather in Lisbon?';

const response = getResponse(userInput, memory, {
    model: 'gpt-4o',
    client: openai,
    tools: [
        new DateTimeService().getDateAndTime,
        new WeatherService().getNDayWeatherForecast
    ]
});

for await (const chunk of response) {
    console.log(chunk);
}

console.log(memory);

```

#### Decorator Usage

This project also employs decorators to streamline and enhance the functionality of the tools integrated with the `getResponse` method. Decorators provide a clean and efficient way to manage tool execution and response handling.

```typescript
import {describeReturn, openaiTool} from '../decorators/openai';

class DateTimeService
{
    @openaiTool
    @describeReturn('Gets current date and time')
    getDateAndTime(): string
    {
        return new Date().toString();
    }
}

export default DateTimeService;
```

