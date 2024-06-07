// src/decorator.ts
import 'reflect-metadata';
import {FunctionMetadata, TYPE_MAP} from './types';

function openaiTool(target: any, propertyKey: string, descriptor: PropertyDescriptor)
{
    const func = descriptor.value;
    const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
    const paramNames = getParamNames(func);

    const parameters: FunctionMetadata = {
        type: 'object',
        properties: {},
        required: []
    };

    paramNames.forEach((name, index) =>
    {
        const paramType = paramTypes[index].name;
        const jsonType = TYPE_MAP[paramType] || 'string';
        const metadata = Reflect.getMetadata(`description:${name}`, target, propertyKey) || {};
        parameters.properties[name] = {
            type: jsonType,
            description: metadata.description || '',
            enum: metadata.enum || undefined
        };
        if (metadata.required)
        {
            parameters.required.push(name);
        }
    });

    const returnMetadata = Reflect.getMetadata(`return:description`, target, propertyKey) || '';

    func.tool = {
        type: 'function',
        function: {
            name: propertyKey,
            description: returnMetadata || '',
            parameters: parameters
        }
    };

    func.toJSON = (space: number | string) => JSON.stringify(func.tool, null, space);

    return descriptor;
}

function getParamNames(func: Function): string[]
{
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    const ARGUMENT_NAMES = /([^\s,]+)/g;
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    return result ?? [];
}

interface ParameterOptions
{
    description: string;
    enum?: string[];
    required?: boolean;
}

function describe(options: ParameterOptions)
{
    return function (target: any, propertyKey: string | symbol, parameterIndex: number)
    {
        const paramName = getParamNames(target[propertyKey])[parameterIndex];
        Reflect.defineMetadata(`description:${paramName}`, options, target, propertyKey);
    };
}

function describeReturn(description: string)
{
    return function (target: any, propertyKey: string)
    {
        Reflect.defineMetadata(`return:description`, description, target, propertyKey);
    };
}

export {openaiTool, describe, describeReturn};
