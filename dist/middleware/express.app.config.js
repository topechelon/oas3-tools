'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressAppConfig = void 0;
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const swagger_ui_1 = require("./swagger.ui");
const swagger_router_1 = require("./swagger.router");
const swagger_parameters_1 = require("./swagger.parameters");
const logger = require("morgan");
const fs = require("fs");
const jsyaml = require("js-yaml");
const OpenApiValidator = require("express-openapi-validator");
class ExpressAppConfig {
    constructor(definitionPath, appOptions) {
        var _a, _b, _c, _d, _e, _f;
        this.definitionPath = definitionPath;
        this.routingOptions = appOptions.routing;
        this.setOpenApiValidatorOptions(definitionPath, appOptions);
        this.app = express();
        const middlewareLists = (_a = appOptions.middlewareLists) !== null && _a !== void 0 ? _a : {};
        const spec = fs.readFileSync(definitionPath, 'utf8');
        const swaggerDoc = jsyaml.safeLoad(spec);
        if ((_b = middlewareLists.initial) !== null && _b !== void 0 ? _b : false) {
            middlewareLists.initial.forEach(middleware => {
                this.app.use(...middleware);
            });
        }
        this.app.use(bodyParser.urlencoded());
        this.app.use(bodyParser.text());
        this.app.use(bodyParser.json());
        this.app.use(this.configureLogger(appOptions.logging));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        const swaggerUi = new swagger_ui_1.SwaggerUI(swaggerDoc, appOptions.swaggerUI);
        this.app.use(swaggerUi.serveStaticContent());
        if ((_c = middlewareLists.firstRequests) !== null && _c !== void 0 ? _c : false) {
            middlewareLists.firstRequests.forEach(middleware => {
                this.app.use(...middleware);
            });
        }
        this.app.use(OpenApiValidator.middleware(this.openApiValidatorOptions));
        this.app.use(new swagger_parameters_1.SwaggerParameters().checkParameters());
        this.app.use(new swagger_router_1.SwaggerRouter().initialize(this.routingOptions));
        if ((_d = middlewareLists.lastRequests) !== null && _d !== void 0 ? _d : false) {
            middlewareLists.lastRequests.forEach(middleware => {
                this.app.use(...middleware);
            });
        }
        if ((_e = middlewareLists.errorHandlers) !== null && _e !== void 0 ? _e : false) {
            middlewareLists.errorHandlers.forEach(middleware => {
                this.app.use(...middleware);
            });
        }
        this.app.use(this.errorHandler);
        if ((_f = middlewareLists.final) !== null && _f !== void 0 ? _f : false) {
            middlewareLists.final.forEach(middleware => {
                this.app.use(...middleware);
            });
        }
    }
    setOpenApiValidatorOptions(definitionPath, appOptions) {
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
    configureLogger(loggerOptions) {
        let format = 'dev';
        let options = {};
        if (loggerOptions != undefined) {
            if (loggerOptions.format != undefined
                && typeof loggerOptions.format === 'string') {
                format = loggerOptions.format;
            }
            if (loggerOptions.errorLimit != undefined
                && (typeof loggerOptions.errorLimit === 'string' || typeof loggerOptions.errorLimit === 'number')) {
                options['skip'] = function (req, res) { return res.statusCode < parseInt(loggerOptions.errorLimit); };
            }
        }
        return logger(format, options);
    }
    errorHandler(error, request, response, next) {
        response.status(error.status || 500).json({
            message: error.message,
            errors: error.errors,
        });
    }
    getApp() {
        return this.app;
    }
}
exports.ExpressAppConfig = ExpressAppConfig;
//# sourceMappingURL=express.app.config.js.map