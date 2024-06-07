// src/types.ts
export interface Parameter
{
    type: string;
    description?: string;
    enum?: string[];
}

export interface FunctionMetadata
{
    type: string;
    properties: { [key: string]: Parameter };
    required: string[];
}

export const TYPE_MAP: { [key: string]: string } = {
    'String': 'string',
    'Number': 'integer',  // Change to "integer" to match the schema example
    'Boolean': 'boolean',
    'Array': 'array',
    'Object': 'object'
};
