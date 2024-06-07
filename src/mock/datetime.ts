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