import { OpenApiValidatorOpts } from 'express-openapi-validator/dist/framework/types';
import { LoggingOptions } from './logging.options';
import { SwaggerUiOptions } from './swagger.ui.options';
export declare type MiddlewareInjectors = {
    initial?: Function[];
    firstRequests?: Function[];
    lastRequests?: Function[];
    errorHandlers?: Function[];
    final?: Function[];
};
export declare class Oas3AppOptions {
    middlewareInjectors?: MiddlewareInjectors;
    routing: any;
    openApiValidator: OpenApiValidatorOpts;
    logging?: LoggingOptions;
    swaggerUI: SwaggerUiOptions;
    constructor(routingOpts: any, openApiValidatorOpts: OpenApiValidatorOpts, logging: LoggingOptions, swaggerUI: SwaggerUiOptions);
}
