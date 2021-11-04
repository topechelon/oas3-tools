'use strict';

import * as express from 'express';
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import { SwaggerUI } from './swagger.ui';
import { SwaggerRouter } from './swagger.router';
import { SwaggerParameters } from './swagger.parameters';
import * as logger from 'morgan';
import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import * as OpenApiValidator from 'express-openapi-validator';
import { Oas3AppOptions } from './oas3.options';

export class ExpressAppConfig {
    private app: express.Application;
    private routingOptions;
    private definitionPath;
    private openApiValidatorOptions;

    constructor(definitionPath: string, appOptions: Oas3AppOptions) {
        this.definitionPath = definitionPath;
        this.routingOptions = appOptions.routing;
        this.setOpenApiValidatorOptions(definitionPath, appOptions);
        this.app = express();

        const middlewareInjectors = appOptions.middlewareInjectors ?? {};

        const spec = fs.readFileSync(definitionPath, 'utf8');
        const swaggerDoc = jsyaml.safeLoad(spec);

        if (middlewareInjectors.initial ?? false) {
            middlewareInjectors.initial.forEach(fn => fn(this.app));
        }

        this.app.use(bodyParser.urlencoded());
        this.app.use(bodyParser.text());
        this.app.use(bodyParser.json());

        this.app.use(this.configureLogger(appOptions.logging));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());

        const swaggerUi = new SwaggerUI(swaggerDoc, appOptions.swaggerUI);
        this.app.use(swaggerUi.serveStaticContent());

        if (middlewareInjectors.firstRequests ?? false) {
            middlewareInjectors.firstRequests.forEach(fn => fn(this.app));
        }

        this.app.use(OpenApiValidator.middleware(this.openApiValidatorOptions));
        this.app.use(new SwaggerParameters().checkParameters());
        this.app.use(new SwaggerRouter().initialize(this.routingOptions));

        if (middlewareInjectors.lastRequests ?? false) {
            middlewareInjectors.lastRequests.forEach(fn => fn(this.app));
        }
        if (middlewareInjectors.errorHandlers ?? false) {
            middlewareInjectors.errorHandlers.forEach(fn => fn(this.app));
        }

        this.app.use(this.errorHandler);

        if (middlewareInjectors.final ?? false) {
            middlewareInjectors.final.forEach(fn => fn(this.app));
        }
    }

    private setOpenApiValidatorOptions(definitionPath: string, appOptions: Oas3AppOptions) {
        //If no options or no openApiValidator Options given, create empty options with api definition path
        if (!appOptions || !appOptions.openApiValidator) {
            this.openApiValidatorOptions = { apiSpec: definitionPath };
            return;
        }

        // use the given options
        this.openApiValidatorOptions = appOptions.openApiValidator;

        // Override apiSpec with definition Path to keep the prior behavior
        this.openApiValidatorOptions.apiSpec = definitionPath;
    }

    public configureLogger(loggerOptions) {
        let format = 'dev';
        let options:{} = {};

        if (loggerOptions != undefined) {
            if(loggerOptions.format != undefined
                && typeof loggerOptions.format === 'string'){
                    format = loggerOptions.format;
            }
    
            if(loggerOptions.errorLimit != undefined
                && (typeof loggerOptions.errorLimit === 'string' || typeof loggerOptions.errorLimit === 'number')){
                options['skip'] = function (req, res) { return res.statusCode < parseInt(loggerOptions.errorLimit); };
            }
        }

        return logger(format, options);
    }

    private errorHandler(error, request, response, next) {
        response.status(error.status || 500).json({
            message: error.message,
            errors: error.errors,
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}
