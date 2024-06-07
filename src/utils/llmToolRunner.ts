import OpenAI from 'openai';
import {LlmConfig} from './llm';

export interface ToolCalled
{
    name: string,
    arguments: string
}

async function* llmToolRunner(
    toolsCalled: ToolCalled[],
    chatMemory: OpenAI.ChatCompletionMessageParam[] = [],
    llmConfig: LlmConfig = {
        model: 'gpt-4o',
        client: new OpenAI()
    })
{
    const {
        model,
        client,
        systemPrompt,
        tools
    } = llmConfig;

    let toolsRunResult = '';

    for (const toolCalled of toolsCalled)
    {
        const functionName = toolCalled.name;
        const functionArgs = JSON.parse(toolCalled.arguments || '{}');

        if (tools.some(fn => fn.name === functionName))
        {
            yield {
                message: `Calling ${functionName}...`,
                role: 'tool'
            };
            const func = tools.find(fn => fn.name === functionName);

            const outputData = await func(functionArgs);

            let content = outputData;
            if (typeof outputData === 'object')
            {
                content = JSON.stringify(outputData);
            }
            chatMemory.push({
                role: 'function',
                name: functionName,
                content: content
            });

            const responseTool = await client.chat.completions.create({
                model,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    ...chatMemory
                ],
                stream: true
            });

            let toolReplies = '';

            for await (const responseChunk of responseTool)
            {
                if (responseChunk.choices)
                {
                    const toolChoice = responseChunk.choices[0];
                    if (toolChoice.delta.content)
                    {
                        toolReplies += toolChoice.delta.content;
                    }
                }
            }

            toolsRunResult = toolReplies;
        }
    }

    yield {
        message: toolsRunResult,
        role: 'llm'
    };
}

export default llmToolRunner;