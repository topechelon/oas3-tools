import { OpenApiValidatorOpts } from 'express-openapi-validator/dist/framework/types';
import { LoggingOptions } from './logging.options';
import { SwaggerUiOptions } from './swagger.ui.options';
export declare type MiddlewareLists = {
    initial?: any[][];
    firstRequests?: any[][];
    lastRequests?: any[][];
    errorHandlers?: any[][];
    final?: any[][];
};
export declare class Oas3AppOptions {
    middlewareLists?: MiddlewareLists;
    routing: any;
    openApiValidator: OpenApiValidatorOpts;
    logging?: LoggingOptions;
    swaggerUI: SwaggerUiOptions;
    constructor(routingOpts: any, openApiValidatorOpts: OpenApiValidatorOpts, logging: LoggingOptions, swaggerUI: SwaggerUiOptions);
}
