import { ErrorRequestHandler, Handler, RequestHandler } from 'express';
import { OpenApiValidatorOpts } from 'express-openapi-validator/dist/framework/types';
import { LoggingOptions } from './logging.options'
import { SwaggerUiOptions } from './swagger.ui.options';

export type MiddlewareLists = {
    initial?: any[][];
    firstRequests?: any[][];
    lastRequests?: any[][];
    errorHandlers?: any[][];
    final?: any[][];
};

export class Oas3AppOptions {
    public middlewareLists?: MiddlewareLists = {};
    public routing: any;
    public openApiValidator: OpenApiValidatorOpts;
    public logging?: LoggingOptions;
    public swaggerUI: SwaggerUiOptions;

    constructor(routingOpts: any, openApiValidatorOpts: OpenApiValidatorOpts, logging: LoggingOptions, swaggerUI: SwaggerUiOptions) {
        this.routing = routingOpts;
        this.openApiValidator = openApiValidatorOpts;
        this.swaggerUI = swaggerUI;
        if (!logging)
            logging = new LoggingOptions(null, null);
        this.logging = logging;
    }
}