import OpenAI from 'openai';
import llmToolRunner from './llmToolRunner';

export interface LlmConfig
{
    model: string;
    client: OpenAI;
    systemPrompt?: string;
    tools?: Function[];
}

const defaultSystemPrompt = `
    You are an assistant that helps users by utilizing available tools whenever possible. 
    Before generating a response, always check if there is a relevant tool available that can 
    provide the necessary information.
    When a user asks for specific details (like product details), extract the necessary 
    information (such as product IDs) from the user's input and use the corresponding tool to get 
    the details.
    Only generate a response directly if no tool is available or applicable.
    `;

export async function* getResponse(userInput: string,
                                   chatMemory: OpenAI.ChatCompletionMessageParam[] = [],
                                   llmConfig: LlmConfig = {
                                       model: 'gpt-4o',
                                       client: new OpenAI()
                                   })
{
    const {
        model,
        client,
        systemPrompt = defaultSystemPrompt,
        tools
    } = llmConfig;

    chatMemory.push({
        role: 'user',
        content: userInput
    });

    const response = await client.chat.completions.create({
        model,
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            ...chatMemory
        ],
        stream: true,
        tools: Object.keys(tools).map(toolName => tools[toolName].tool)
    });

    let replies = '';

    const toolsToBeCalled = {};

    try
    {
        for await (const chunk of response)
        {
            if (chunk.choices)
            {
                const choice = chunk.choices[0];

                if (choice.delta.tool_calls)
                {
                    for (const toolCall of choice.delta.tool_calls)
                    {
                        const {
                            name,
                            arguments: functionArguments
                        } = toolCall.function;
                        if (!toolsToBeCalled[toolCall.index])
                        {
                            toolsToBeCalled[toolCall.index] = {};
                        }
                        if (name)
                        {
                            toolsToBeCalled[toolCall.index].name = name;
                        }
                        if (functionArguments)
                        {
                            toolsToBeCalled[toolCall.index].arguments = toolsToBeCalled[toolCall.index].arguments ? toolsToBeCalled[toolCall.index].arguments + functionArguments : functionArguments;
                        }
                    }
                }

                if (choice.finish_reason === 'tool_calls')
                {
                    for await (const toolReply of llmToolRunner(Object.values(toolsToBeCalled), chatMemory, {
                        ...llmConfig,
                        systemPrompt: defaultSystemPrompt
                    }))
                    {
                        if (toolReply.role === 'llm')
                        {
                            chatMemory.push({
                                role: 'assistant',
                                content: toolReply.message
                            });

                            yield {
                                message: toolReply.message,
                                role: 'llm'
                            };
                        }
                    }
                }

                if (choice.delta.content)
                {
                    replies += choice.delta.content;

                    yield {
                        message: replies,
                        role: 'llm'
                    };
                }

                if ('end' in chunk && chunk.end)
                {
                    break;
                }
            }
        }
    }

    finally
    {
        if (replies)
        {
            chatMemory.push({
                role: 'assistant',
                content: replies
            });
        }
    }
}
