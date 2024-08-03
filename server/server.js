(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('http'), require('fs'), require('crypto')) :
        typeof define === 'function' && define.amd ? define(['http', 'fs', 'crypto'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Server = factory(global.http, global.fs, global.crypto));
}(this, (function (http, fs, crypto) {
    'use strict';

    function _interopDefaultLegacy(e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
    var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
    var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

    class ServiceError extends Error {
        constructor(message = 'Service Error') {
            super(message);
            this.name = 'ServiceError';
        }
    }

    class NotFoundError extends ServiceError {
        constructor(message = 'Resource not found') {
            super(message);
            this.name = 'NotFoundError';
            this.status = 404;
        }
    }

    class RequestError extends ServiceError {
        constructor(message = 'Request error') {
            super(message);
            this.name = 'RequestError';
            this.status = 400;
        }
    }

    class ConflictError extends ServiceError {
        constructor(message = 'Resource conflict') {
            super(message);
            this.name = 'ConflictError';
            this.status = 409;
        }
    }

    class AuthorizationError extends ServiceError {
        constructor(message = 'Unauthorized') {
            super(message);
            this.name = 'AuthorizationError';
            this.status = 401;
        }
    }

    class CredentialError extends ServiceError {
        constructor(message = 'Forbidden') {
            super(message);
            this.name = 'CredentialError';
            this.status = 403;
        }
    }

    var errors = {
        ServiceError,
        NotFoundError,
        RequestError,
        ConflictError,
        AuthorizationError,
        CredentialError
    };

    const { ServiceError: ServiceError$1 } = errors;


    function createHandler(plugins, services) {
        return async function handler(req, res) {
            const method = req.method;
            console.info(`<< ${req.method} ${req.url}`);

            // Redirect fix for admin panel relative paths
            if (req.url.slice(-6) == '/admin') {
                res.writeHead(302, {
                    'Location': `http://${req.headers.host}/admin/`
                });
                return res.end();
            }

            let status = 200;
            let headers = {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            };
            let result = '';
            let context;

            // NOTE: the OPTIONS method results in undefined result and also it never processes plugins - keep this in mind
            if (method == 'OPTIONS') {
                Object.assign(headers, {
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                    'Access-Control-Allow-Credentials': false,
                    'Access-Control-Max-Age': '86400',
                    'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Authorization, X-Admin'
                });
            } else {
                try {
                    context = processPlugins();
                    await handle(context);
                } catch (err) {
                    if (err instanceof ServiceError$1) {
                        status = err.status || 400;
                        result = composeErrorObject(err.code || status, err.message);
                    } else {
                        // Unhandled exception, this is due to an error in the service code - REST consumers should never have to encounter this;
                        // If it happens, it must be debugged in a future version of the server
                        console.error(err);
                        status = 500;
                        result = composeErrorObject(500, 'Server Error');
                    }
                }
            }

            res.writeHead(status, headers);
            if (context != undefined && context.util != undefined && context.util.throttle) {
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
            res.end(result);

            function processPlugins() {
                const context = { params: {} };
                plugins.forEach(decorate => decorate(context, req));
                return context;
            }

            async function handle(context) {
                const { serviceName, tokens, query, body } = await parseRequest(req);
                if (serviceName == 'admin') {
                    return ({ headers, result } = services['admin'](method, tokens, query, body));
                } else if (serviceName == 'favicon.ico') {
                    return ({ headers, result } = services['favicon'](method, tokens, query, body));
                }

                const service = services[serviceName];

                if (service === undefined) {
                    status = 400;
                    result = composeErrorObject(400, `Service "${serviceName}" is not supported`);
                    console.error('Missing service ' + serviceName);
                } else {
                    result = await service(context, { method, tokens, query, body });
                }

                // NOTE: logout does not return a result
                // in this case the content type header should be omitted, to allow checks on the client
                if (result !== undefined) {
                    result = JSON.stringify(result);
                } else {
                    status = 204;
                    delete headers['Content-Type'];
                }
            }
        };
    }



    function composeErrorObject(code, message) {
        return JSON.stringify({
            code,
            message
        });
    }

    async function parseRequest(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const tokens = url.pathname.split('/').filter(x => x.length > 0);
        const serviceName = tokens.shift();
        const queryString = url.search.split('?')[1] || '';
        const query = queryString
            .split('&')
            .filter(s => s != '')
            .map(x => x.split('='))
            .reduce((p, [k, v]) => Object.assign(p, { [k]: decodeURIComponent(v) }), {});
        const body = await parseBody(req);

        return {
            serviceName,
            tokens,
            query,
            body
        };
    }

    function parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => body += chunk.toString());
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    resolve(body);
                }
            });
        });
    }

    var requestHandler = createHandler;

    class Service {
        constructor() {
            this._actions = [];
            this.parseRequest = this.parseRequest.bind(this);
        }

        /**
         * Handle service request, after it has been processed by a request handler
         * @param {*} context Execution context, contains result of middleware processing
         * @param {{method: string, tokens: string[], query: *, body: *}} request Request parameters
         */
        async parseRequest(context, request) {
            for (let { method, name, handler } of this._actions) {
                if (method === request.method && matchAndAssignParams(context, request.tokens[0], name)) {
                    return await handler(context, request.tokens.slice(1), request.query, request.body);
                }
            }
        }

        /**
         * Register service action
         * @param {string} method HTTP method
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        registerAction(method, name, handler) {
            this._actions.push({ method, name, handler });
        }

        /**
         * Register GET action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        get(name, handler) {
            this.registerAction('GET', name, handler);
        }

        /**
         * Register POST action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        post(name, handler) {
            this.registerAction('POST', name, handler);
        }

        /**
         * Register PUT action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        put(name, handler) {
            this.registerAction('PUT', name, handler);
        }

        /**
         * Register PATCH action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        patch(name, handler) {
            this.registerAction('PATCH', name, handler);
        }

        /**
         * Register DELETE action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        delete(name, handler) {
            this.registerAction('DELETE', name, handler);
        }
    }

    function matchAndAssignParams(context, name, pattern) {
        if (pattern == '*') {
            return true;
        } else if (pattern[0] == ':') {
            context.params[pattern.slice(1)] = name;
            return true;
        } else if (name == pattern) {
            return true;
        } else {
            return false;
        }
    }

    var Service_1 = Service;

    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var util = {
        uuid
    };

    const uuid$1 = util.uuid;


    const data = fs__default['default'].existsSync('./data') ? fs__default['default'].readdirSync('./data').reduce((p, c) => {
        const content = JSON.parse(fs__default['default'].readFileSync('./data/' + c));
        const collection = c.slice(0, -5);
        p[collection] = {};
        for (let endpoint in content) {
            p[collection][endpoint] = content[endpoint];
        }
        return p;
    }, {}) : {};

    const actions = {
        get: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            return responseData;
        },
        post: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            // TODO handle collisions, replacement
            let responseData = data;
            for (let token of tokens) {
                if (responseData.hasOwnProperty(token) == false) {
                    responseData[token] = {};
                }
                responseData = responseData[token];
            }

            const newId = uuid$1();
            responseData[newId] = Object.assign({}, body, { _id: newId });
            return responseData[newId];
        },
        put: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens.slice(0, -1)) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined && responseData[tokens.slice(-1)] !== undefined) {
                responseData[tokens.slice(-1)] = body;
            }
            return responseData[tokens.slice(-1)];
        },
        patch: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined) {
                Object.assign(responseData, body);
            }
            return responseData;
        },
        delete: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (responseData.hasOwnProperty(token) == false) {
                    return null;
                }
                if (i == tokens.length - 1) {
                    const body = responseData[token];
                    delete responseData[token];
                    return body;
                } else {
                    responseData = responseData[token];
                }
            }
        }
    };

    const dataService = new Service_1();
    dataService.get(':collection', actions.get);
    dataService.post(':collection', actions.post);
    dataService.put(':collection', actions.put);
    dataService.patch(':collection', actions.patch);
    dataService.delete(':collection', actions.delete);


    var jsonstore = dataService.parseRequest;

    /*
     * This service requires storage and auth plugins
     */

    const { AuthorizationError: AuthorizationError$1 } = errors;



    const userService = new Service_1();

    userService.get('me', getSelf);
    userService.post('register', onRegister);
    userService.post('login', onLogin);
    userService.get('logout', onLogout);


    function getSelf(context, tokens, query, body) {
        if (context.user) {
            const result = Object.assign({}, context.user);
            delete result.hashedPassword;
            return result;
        } else {
            throw new AuthorizationError$1();
        }
    }

    function onRegister(context, tokens, query, body) {
        return context.auth.register(body);
    }

    function onLogin(context, tokens, query, body) {
        return context.auth.login(body);
    }

    function onLogout(context, tokens, query, body) {
        return context.auth.logout();
    }

    var users = userService.parseRequest;

    const { NotFoundError: NotFoundError$1, RequestError: RequestError$1 } = errors;


    var crud = {
        get,
        post,
        put,
        patch,
        delete: del
    };


    function validateRequest(context, tokens, query) {
        /*
        if (context.params.collection == undefined) {
            throw new RequestError('Please, specify collection name');
        }
        */
        if (tokens.length > 1) {
            throw new RequestError$1();
        }
    }

    function parseWhere(query) {
        const operators = {
            '<=': (prop, value) => record => record[prop] <= JSON.parse(value),
            '<': (prop, value) => record => record[prop] < JSON.parse(value),
            '>=': (prop, value) => record => record[prop] >= JSON.parse(value),
            '>': (prop, value) => record => record[prop] > JSON.parse(value),
            '=': (prop, value) => record => record[prop] == JSON.parse(value),
            ' like ': (prop, value) => record => record[prop].toLowerCase().includes(JSON.parse(value).toLowerCase()),
            ' in ': (prop, value) => record => JSON.parse(`[${/\((.+?)\)/.exec(value)[1]}]`).includes(record[prop]),
        };
        const pattern = new RegExp(`^(.+?)(${Object.keys(operators).join('|')})(.+?)$`, 'i');

        try {
            let clauses = [query.trim()];
            let check = (a, b) => b;
            let acc = true;
            if (query.match(/ and /gi)) {
                // inclusive
                clauses = query.split(/ and /gi);
                check = (a, b) => a && b;
                acc = true;
            } else if (query.match(/ or /gi)) {
                // optional
                clauses = query.split(/ or /gi);
                check = (a, b) => a || b;
                acc = false;
            }
            clauses = clauses.map(createChecker);

            return (record) => clauses
                .map(c => c(record))
                .reduce(check, acc);
        } catch (err) {
            throw new Error('Could not parse WHERE clause, check your syntax.');
        }

        function createChecker(clause) {
            let [match, prop, operator, value] = pattern.exec(clause);
            [prop, value] = [prop.trim(), value.trim()];

            return operators[operator.toLowerCase()](prop, value);
        }
    }


    function get(context, tokens, query, body) {
        validateRequest(context, tokens);

        let responseData;

        try {
            if (query.where) {
                responseData = context.storage.get(context.params.collection).filter(parseWhere(query.where));
            } else if (context.params.collection) {
                responseData = context.storage.get(context.params.collection, tokens[0]);
            } else {
                // Get list of collections
                return context.storage.get();
            }

            if (query.sortBy) {
                const props = query.sortBy
                    .split(',')
                    .filter(p => p != '')
                    .map(p => p.split(' ').filter(p => p != ''))
                    .map(([p, desc]) => ({ prop: p, desc: desc ? true : false }));

                // Sorting priority is from first to last, therefore we sort from last to first
                for (let i = props.length - 1; i >= 0; i--) {
                    let { prop, desc } = props[i];
                    responseData.sort(({ [prop]: propA }, { [prop]: propB }) => {
                        if (typeof propA == 'number' && typeof propB == 'number') {
                            return (propA - propB) * (desc ? -1 : 1);
                        } else {
                            return propA.localeCompare(propB) * (desc ? -1 : 1);
                        }
                    });
                }
            }

            if (query.offset) {
                responseData = responseData.slice(Number(query.offset) || 0);
            }
            const pageSize = Number(query.pageSize) || 10;
            if (query.pageSize) {
                responseData = responseData.slice(0, pageSize);
            }

            if (query.distinct) {
                const props = query.distinct.split(',').filter(p => p != '');
                responseData = Object.values(responseData.reduce((distinct, c) => {
                    const key = props.map(p => c[p]).join('::');
                    if (distinct.hasOwnProperty(key) == false) {
                        distinct[key] = c;
                    }
                    return distinct;
                }, {}));
            }

            if (query.count) {
                return responseData.length;
            }

            if (query.select) {
                const props = query.select.split(',').filter(p => p != '');
                responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                function transform(r) {
                    const result = {};
                    props.forEach(p => result[p] = r[p]);
                    return result;
                }
            }

            if (query.load) {
                const props = query.load.split(',').filter(p => p != '');
                props.map(prop => {
                    const [propName, relationTokens] = prop.split('=');
                    const [idSource, collection] = relationTokens.split(':');
                    console.log(`Loading related records from "${collection}" into "${propName}", joined on "_id"="${idSource}"`);
                    const storageSource = collection == 'users' ? context.protectedStorage : context.storage;
                    responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                    function transform(r) {
                        const seekId = r[idSource];
                        const related = storageSource.get(collection, seekId);
                        delete related.hashedPassword;
                        r[propName] = related;
                        return r;
                    }
                });
            }

        } catch (err) {
            console.error(err);
            if (err.message.includes('does not exist')) {
                throw new NotFoundError$1();
            } else {
                throw new RequestError$1(err.message);
            }
        }

        context.canAccess(responseData);

        return responseData;
    }

    function post(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length > 0) {
            throw new RequestError$1('Use PUT to update records');
        }
        context.canAccess(undefined, body);

        body._ownerId = context.user._id;
        let responseData;

        try {
            responseData = context.storage.add(context.params.collection, body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function put(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.set(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function patch(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.merge(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function del(context, tokens, query, body) {
        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing);

        try {
            responseData = context.storage.delete(context.params.collection, tokens[0]);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    /*
     * This service requires storage and auth plugins
     */

    const dataService$1 = new Service_1();
    dataService$1.get(':collection', crud.get);
    dataService$1.post(':collection', crud.post);
    dataService$1.put(':collection', crud.put);
    dataService$1.patch(':collection', crud.patch);
    dataService$1.delete(':collection', crud.delete);

    var data$1 = dataService$1.parseRequest;

    const imgdata = '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Td4DLneAwSddMiRH8tMU8nng/Yy+KQsM3AKBNbe35j5OH4A0dbV8AxwcAqMFyl73eHd3e2//nmn29wOGi3Kv+RixSgAAEkxpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOmlwdGNFeHQ9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBFeHQvMjAwOC0wMi0yOS8iCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpwbHVzPSJodHRwOi8vbnMudXNlcGx1cy5vcmcvbGRmL3htcC8xLjAvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjdjZDM3NWM3LTcwNmItNDlkMy1hOWRkLWNmM2Q3MmMwY2I4ZCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NGY2YTJlYy04ZjA5LTRkZTMtOTY3ZC05MTUyY2U5NjYxNTAiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMmE1NzI5Mi1kNmJkLTRlYjQtOGUxNi1hODEzYjMwZjU0NWYiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjEzMzAwNzI5NTMwNjQzIgogICBHSU1QOlZlcnNpb249IjIuMTAuMTIiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBwaG90b3Nob3A6Q3JlZGl0PSJHZXR0eSBJbWFnZXMvaVN0b2NrcGhvdG8iCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiPgogICA8aXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgIDxpcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvblNob3duPgogICA8aXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgIDxpcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpSZWdpc3RyeUlkPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjOTQ2M2MxMC05OWE4LTQ1NDQtYmRlOS1mNzY0ZjdhODJlZDkiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMDItMTRUMTM6MDU6MjkiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGx1czpJbWFnZVN1cHBsaWVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VTdXBwbGllcj4KICAgPHBsdXM6SW1hZ2VDcmVhdG9yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VDcmVhdG9yPgogICA8cGx1czpDb3B5cmlnaHRPd25lcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkNvcHlyaWdodE93bmVyPgogICA8cGx1czpMaWNlbnNvcj4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgcGx1czpMaWNlbnNvclVSTD0iaHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL3Bob3RvL2xpY2Vuc2UtZ20xMTUwMzQ1MzQxLT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybCIvPgogICAgPC9yZGY6U2VxPgogICA8L3BsdXM6TGljZW5zb3I+CiAgIDxkYzpjcmVhdG9yPgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaT5WbGFkeXNsYXYgU2VyZWRhPC9yZGY6bGk+CiAgICA8L3JkZjpTZXE+CiAgIDwvZGM6Y3JlYXRvcj4KICAgPGRjOmRlc2NyaXB0aW9uPgogICAgPHJkZjpBbHQ+CiAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5TZXJ2aWNlIHRvb2xzIGljb24gb24gd2hpdGUgYmFja2dyb3VuZC4gVmVjdG9yIGlsbHVzdHJhdGlvbi48L3JkZjpsaT4KICAgIDwvcmRmOkFsdD4KICAgPC9kYzpkZXNjcmlwdGlvbj4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PmWJCnkAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQflAg4LBR0CZnO/AAAARHRFWHRDb21tZW50AFNlcnZpY2UgdG9vbHMgaWNvbiBvbiB3aGl0ZSBiYWNrZ3JvdW5kLiBWZWN0b3IgaWxsdXN0cmF0aW9uLlwvEeIAAAMxSURBVHja7Z1bcuQwCEX7qrLQXlp2ynxNVWbK7dgWj3sl9JvYRhxACD369erW7UMzx/cYaychonAQvXM5ABYkpynoYIiEGdoQog6AYfywBrCxF4zNrX/7McBbuXJe8rXx/KBDULcGsMREzCbeZ4J6ME/9wVH5d95rogZp3npEgPLP3m2iUSGqXBJS5Dr6hmLm8kRuZABYti5TMaailV8LodNQwTTUWk4/WZk75l0kM0aZQdaZjMqkrQDAuyMVJWFjMB4GANXr0lbZBxQKr7IjI7QvVWkok/Jn5UHVh61CYPs+/i7eL9j3y/Au8WqoAIC34k8/9k7N8miLcaGWHwgjZXE/awyYX7h41wKMCskZM2HXAddDkTdglpSjz5bcKPbcCEKwT3+DhxtVpJvkEC7rZSgq32NMSBoXaCdiahDCKrND0fpX8oQlVsQ8IFQZ1VARdIF5wroekAjB07gsAgDUIbQHFENIDEX4CQANIVe8Iw/ASiACLXl28eaf579OPuBa9/mrELUYHQ1t3KHlZZnRcXb2/c7ygXIQZqjDMEzeSrOgCAhqYMvTUE+FKXoVxTxgk3DEPREjGzj3nAk/VaKyB9GVIu4oMyOlrQZgrBBEFG9PAZTfs3amYDGrP9Wl964IeFvtz9JFluIvlEvcdoXDOdxggbDxGwTXcxFRi/LdirKgZUBm7SUdJG69IwSUzAMWgOAq/4hyrZVaJISSNWHFVbEoCFEhyBrCtXS9L+so9oTy8wGqxbQDD350WTjNESVFEB5hdKzUGcV5QtYxVWR2Ssl4Mg9qI9u6FCBInJRXgfEEgtS9Cgrg7kKouq4mdcDNBnEHQvWFTdgdgsqP+MiluVeBM13ahx09AYSWi50gsF+I6vn7BmCEoHR3NBzkpIOw4+XdVBBGQUioblaZHbGlodtB+N/jxqwLX/x/NARfD8ADxTOCKIcwE4Lw0OIbguMYcGTlymEpHYLXIKx8zQEqIfS2lGJPaADFEBR/PMH79ErqtpnZmTBlvM4wgihPWDEEhXn1LISj50crNgfCp+dWHYQRCfb2zgfnBZmKGAyi914anK9Coi4LOMhoAn3uVtn+AGnLKxPUZnCuAAAAAElFTkSuQmCC';
    const img = Buffer.from(imgdata, 'base64');

    var favicon = (method, tokens, query, body) => {
        console.log('serving favicon...');
        const headers = {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        };
        let result = img;

        return {
            headers,
            result
        };
    };

    var require$$0 = "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n    <title>SUPS Admin Panel</title>\r\n    <style>\r\n        * {\r\n            padding: 0;\r\n            margin: 0;\r\n        }\r\n\r\n        body {\r\n            padding: 32px;\r\n            font-size: 16px;\r\n        }\r\n\r\n        .layout::after {\r\n            content: '';\r\n            clear: both;\r\n            display: table;\r\n        }\r\n\r\n        .col {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        p {\r\n            padding: 8px 16px;\r\n        }\r\n\r\n        table {\r\n            border-collapse: collapse;\r\n        }\r\n\r\n        caption {\r\n            font-size: 120%;\r\n            text-align: left;\r\n            padding: 4px 8px;\r\n            font-weight: bold;\r\n            background-color: #ddd;\r\n        }\r\n\r\n        table, tr, th, td {\r\n            border: 1px solid #ddd;\r\n        }\r\n\r\n        th, td {\r\n            padding: 4px 8px;\r\n        }\r\n\r\n        ul {\r\n            list-style: none;\r\n        }\r\n\r\n        .collection-list a {\r\n            display: block;\r\n            width: 120px;\r\n            padding: 4px 8px;\r\n            text-decoration: none;\r\n            color: black;\r\n            background-color: #ccc;\r\n        }\r\n        .collection-list a:hover {\r\n            background-color: #ddd;\r\n        }\r\n        .collection-list a:visited {\r\n            color: black;\r\n        }\r\n    </style>\r\n    <script type=\"module\">\nimport { html, render } from 'https://unpkg.com/lit-html@1.3.0?module';\nimport { until } from 'https://unpkg.com/lit-html@1.3.0/directives/until?module';\n\nconst api = {\r\n    async get(url) {\r\n        return json(url);\r\n    },\r\n    async post(url, body) {\r\n        return json(url, {\r\n            method: 'POST',\r\n            headers: { 'Content-Type': 'application/json' },\r\n            body: JSON.stringify(body)\r\n        });\r\n    }\r\n};\r\n\r\nasync function json(url, options) {\r\n    return await (await fetch('/' + url, options)).json();\r\n}\r\n\r\nasync function getCollections() {\r\n    return api.get('data');\r\n}\r\n\r\nasync function getRecords(collection) {\r\n    return api.get('data/' + collection);\r\n}\r\n\r\nasync function getThrottling() {\r\n    return api.get('util/throttle');\r\n}\r\n\r\nasync function setThrottling(throttle) {\r\n    return api.post('util', { throttle });\r\n}\n\nasync function collectionList(onSelect) {\r\n    const collections = await getCollections();\r\n\r\n    return html`\r\n    <ul class=\"collection-list\">\r\n        ${collections.map(collectionLi)}\r\n    </ul>`;\r\n\r\n    function collectionLi(name) {\r\n        return html`<li><a href=\"javascript:void(0)\" @click=${(ev) => onSelect(ev, name)}>${name}</a></li>`;\r\n    }\r\n}\n\nasync function recordTable(collectionName) {\r\n    const records = await getRecords(collectionName);\r\n    const layout = getLayout(records);\r\n\r\n    return html`\r\n    <table>\r\n        <caption>${collectionName}</caption>\r\n        <thead>\r\n            <tr>${layout.map(f => html`<th>${f}</th>`)}</tr>\r\n        </thead>\r\n        <tbody>\r\n            ${records.map(r => recordRow(r, layout))}\r\n        </tbody>\r\n    </table>`;\r\n}\r\n\r\nfunction getLayout(records) {\r\n    const result = new Set(['_id']);\r\n    records.forEach(r => Object.keys(r).forEach(k => result.add(k)));\r\n\r\n    return [...result.keys()];\r\n}\r\n\r\nfunction recordRow(record, layout) {\r\n    return html`\r\n    <tr>\r\n        ${layout.map(f => html`<td>${JSON.stringify(record[f]) || html`<span>(missing)</span>`}</td>`)}\r\n    </tr>`;\r\n}\n\nasync function throttlePanel(display) {\r\n    const active = await getThrottling();\r\n\r\n    return html`\r\n    <p>\r\n        Request throttling: </span>${active}</span>\r\n        <button @click=${(ev) => set(ev, true)}>Enable</button>\r\n        <button @click=${(ev) => set(ev, false)}>Disable</button>\r\n    </p>`;\r\n\r\n    async function set(ev, state) {\r\n        ev.target.disabled = true;\r\n        await setThrottling(state);\r\n        display();\r\n    }\r\n}\n\n//import page from '//unpkg.com/page/page.mjs';\r\n\r\n\r\nfunction start() {\r\n    const main = document.querySelector('main');\r\n    editor(main);\r\n}\r\n\r\nasync function editor(main) {\r\n    let list = html`<div class=\"col\">Loading&hellip;</div>`;\r\n    let viewer = html`<div class=\"col\">\r\n    <p>Select collection to view records</p>\r\n</div>`;\r\n    display();\r\n\r\n    list = html`<div class=\"col\">${await collectionList(onSelect)}</div>`;\r\n    display();\r\n\r\n    async function display() {\r\n        render(html`\r\n        <section class=\"layout\">\r\n            ${until(throttlePanel(display), html`<p>Loading</p>`)}\r\n        </section>\r\n        <section class=\"layout\">\r\n            ${list}\r\n            ${viewer}\r\n        </section>`, main);\r\n    }\r\n\r\n    async function onSelect(ev, name) {\r\n        ev.preventDefault();\r\n        viewer = html`<div class=\"col\">${await recordTable(name)}</div>`;\r\n        display();\r\n    }\r\n}\r\n\r\nstart();\n\n</script>\r\n</head>\r\n<body>\r\n    <main>\r\n        Loading&hellip;\r\n    </main>\r\n</body>\r\n</html>";

    const mode = process.argv[2] == '-dev' ? 'dev' : 'prod';

    const files = {
        index: mode == 'prod' ? require$$0 : fs__default['default'].readFileSync('./client/index.html', 'utf-8')
    };

    var admin = (method, tokens, query, body) => {
        const headers = {
            'Content-Type': 'text/html'
        };
        let result = '';

        const resource = tokens.join('/');
        if (resource && resource.split('.').pop() == 'js') {
            headers['Content-Type'] = 'application/javascript';

            files[resource] = files[resource] || fs__default['default'].readFileSync('./client/' + resource, 'utf-8');
            result = files[resource];
        } else {
            result = files.index;
        }

        return {
            headers,
            result
        };
    };

    /*
     * This service requires util plugin
     */

    const utilService = new Service_1();

    utilService.post('*', onRequest);
    utilService.get(':service', getStatus);

    function getStatus(context, tokens, query, body) {
        return context.util[context.params.service];
    }

    function onRequest(context, tokens, query, body) {
        Object.entries(body).forEach(([k, v]) => {
            console.log(`${k} ${v ? 'enabled' : 'disabled'}`);
            context.util[k] = v;
        });
        return '';
    }

    var util$1 = utilService.parseRequest;

    var services = {
        jsonstore,
        users,
        data: data$1,
        favicon,
        admin,
        util: util$1
    };

    const { uuid: uuid$2 } = util;


    function initPlugin(settings) {
        const storage = createInstance(settings.seedData);
        const protectedStorage = createInstance(settings.protectedData);

        return function decoreateContext(context, request) {
            context.storage = storage;
            context.protectedStorage = protectedStorage;
        };
    }


    /**
     * Create storage instance and populate with seed data
     * @param {Object=} seedData Associative array with data. Each property is an object with properties in format {key: value}
     */
    function createInstance(seedData = {}) {
        const collections = new Map();

        // Initialize seed data from file    
        for (let collectionName in seedData) {
            if (seedData.hasOwnProperty(collectionName)) {
                const collection = new Map();
                for (let recordId in seedData[collectionName]) {
                    if (seedData.hasOwnProperty(collectionName)) {
                        collection.set(recordId, seedData[collectionName][recordId]);
                    }
                }
                collections.set(collectionName, collection);
            }
        }


        // Manipulation

        /**
         * Get entry by ID or list of all entries from collection or list of all collections
         * @param {string=} collection Name of collection to access. Throws error if not found. If omitted, returns list of all collections.
         * @param {number|string=} id ID of requested entry. Throws error if not found. If omitted, returns of list all entries in collection.
         * @return {Object} Matching entry.
         */
        function get(collection, id) {
            if (!collection) {
                return [...collections.keys()];
            }
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!id) {
                const entries = [...targetCollection.entries()];
                let result = entries.map(([k, v]) => {
                    return Object.assign(deepCopy(v), { _id: k });
                });
                return result;
            }
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            const entry = targetCollection.get(id);
            return Object.assign(deepCopy(entry), { _id: id });
        }

        /**
         * Add new entry to collection. ID will be auto-generated
         * @param {string} collection Name of collection to access. If the collection does not exist, it will be created.
         * @param {Object} data Value to store.
         * @return {Object} Original value with resulting ID under _id property.
         */
        function add(collection, data) {
            const record = assignClean({ _ownerId: data._ownerId }, data);

            let targetCollection = collections.get(collection);
            if (!targetCollection) {
                targetCollection = new Map();
                collections.set(collection, targetCollection);
            }
            let id = uuid$2();
            // Make sure new ID does not match existing value
            while (targetCollection.has(id)) {
                id = uuid$2();
            }

            record._createdOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Replace entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Record will be replaced!
         * @return {Object} Updated entry.
         */
        function set(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = targetCollection.get(id);
            const record = assignSystemProps(deepCopy(data), existing);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Modify entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Shallow merge will be performed!
         * @return {Object} Updated entry.
         */
        function merge(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = deepCopy(targetCollection.get(id));
            const record = assignClean(existing, data);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Delete entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @return {{_deletedOn: number}} Server time of deletion.
         */
        function del(collection, id) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            targetCollection.delete(id);

            return { _deletedOn: Date.now() };
        }

        /**
         * Search in collection by query object
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {Object} query Query object. Format {prop: value}.
         * @return {Object[]} Array of matching entries.
         */
        function query(collection, query) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            const result = [];
            // Iterate entries of target collection and compare each property with the given query
            for (let [key, entry] of [...targetCollection.entries()]) {
                let match = true;
                for (let prop in entry) {
                    if (query.hasOwnProperty(prop)) {
                        const targetValue = query[prop];
                        // Perform lowercase search, if value is string
                        if (typeof targetValue === 'string' && typeof entry[prop] === 'string') {
                            if (targetValue.toLocaleLowerCase() !== entry[prop].toLocaleLowerCase()) {
                                match = false;
                                break;
                            }
                        } else if (targetValue != entry[prop]) {
                            match = false;
                            break;
                        }
                    }
                }

                if (match) {
                    result.push(Object.assign(deepCopy(entry), { _id: key }));
                }
            }

            return result;
        }

        return { get, add, set, merge, delete: del, query };
    }


    function assignSystemProps(target, entry, ...rest) {
        const whitelist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let prop of whitelist) {
            if (entry.hasOwnProperty(prop)) {
                target[prop] = deepCopy(entry[prop]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }


    function assignClean(target, entry, ...rest) {
        const blacklist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let key in entry) {
            if (blacklist.includes(key) == false) {
                target[key] = deepCopy(entry[key]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }

    function deepCopy(value) {
        if (Array.isArray(value)) {
            return value.map(deepCopy);
        } else if (typeof value == 'object') {
            return [...Object.entries(value)].reduce((p, [k, v]) => Object.assign(p, { [k]: deepCopy(v) }), {});
        } else {
            return value;
        }
    }

    var storage = initPlugin;

    const { ConflictError: ConflictError$1, CredentialError: CredentialError$1, RequestError: RequestError$2 } = errors;

    function initPlugin$1(settings) {
        const identity = settings.identity;

        return function decorateContext(context, request) {
            context.auth = {
                register,
                login,
                logout
            };

            const userToken = request.headers['x-authorization'];
            if (userToken !== undefined) {
                let user;
                const session = findSessionByToken(userToken);
                if (session !== undefined) {
                    const userData = context.protectedStorage.get('users', session.userId);
                    if (userData !== undefined) {
                        console.log('Authorized as ' + userData[identity]);
                        user = userData;
                    }
                }
                if (user !== undefined) {
                    context.user = user;
                } else {
                    throw new CredentialError$1('Invalid access token');
                }
            }

            function register(body) {
                if (body.hasOwnProperty(identity) === false ||
                    body.hasOwnProperty('password') === false ||
                    body[identity].length == 0 ||
                    body.password.length == 0) {
                    throw new RequestError$2('Missing fields');
                } else if (context.protectedStorage.query('users', { [identity]: body[identity] }).length !== 0) {
                    throw new ConflictError$1(`A user with the same ${identity} already exists`);
                } else {
                    const newUser = Object.assign({}, body, {
                        [identity]: body[identity],
                        hashedPassword: hash(body.password)
                    });
                    const result = context.protectedStorage.add('users', newUser);
                    delete result.hashedPassword;

                    const session = saveSession(result._id);
                    result.accessToken = session.accessToken;

                    return result;
                }
            }

            function login(body) {
                const targetUser = context.protectedStorage.query('users', { [identity]: body[identity] });
                if (targetUser.length == 1) {
                    if (hash(body.password) === targetUser[0].hashedPassword) {
                        const result = targetUser[0];
                        delete result.hashedPassword;

                        const session = saveSession(result._id);
                        result.accessToken = session.accessToken;

                        return result;
                    } else {
                        throw new CredentialError$1('Login or password don\'t match');
                    }
                } else {
                    throw new CredentialError$1('Login or password don\'t match');
                }
            }

            function logout() {
                if (context.user !== undefined) {
                    const session = findSessionByUserId(context.user._id);
                    if (session !== undefined) {
                        context.protectedStorage.delete('sessions', session._id);
                    }
                } else {
                    throw new CredentialError$1('User session does not exist');
                }
            }

            function saveSession(userId) {
                let session = context.protectedStorage.add('sessions', { userId });
                const accessToken = hash(session._id);
                session = context.protectedStorage.set('sessions', session._id, Object.assign({ accessToken }, session));
                return session;
            }

            function findSessionByToken(userToken) {
                return context.protectedStorage.query('sessions', { accessToken: userToken })[0];
            }

            function findSessionByUserId(userId) {
                return context.protectedStorage.query('sessions', { userId })[0];
            }
        };
    }


    const secret = 'This is not a production server';

    function hash(string) {
        const hash = crypto__default['default'].createHmac('sha256', secret);
        hash.update(string);
        return hash.digest('hex');
    }

    var auth = initPlugin$1;

    function initPlugin$2(settings) {
        const util = {
            throttle: false
        };

        return function decoreateContext(context, request) {
            context.util = util;
        };
    }

    var util$2 = initPlugin$2;

    /*
     * This plugin requires auth and storage plugins
     */

    const { RequestError: RequestError$3, ConflictError: ConflictError$2, CredentialError: CredentialError$2, AuthorizationError: AuthorizationError$2 } = errors;

    function initPlugin$3(settings) {
        const actions = {
            'GET': '.read',
            'POST': '.create',
            'PUT': '.update',
            'PATCH': '.update',
            'DELETE': '.delete'
        };
        const rules = Object.assign({
            '*': {
                '.create': ['User'],
                '.update': ['Owner'],
                '.delete': ['Owner']
            }
        }, settings.rules);

        return function decorateContext(context, request) {
            // special rules (evaluated at run-time)
            const get = (collectionName, id) => {
                return context.storage.get(collectionName, id);
            };
            const isOwner = (user, object) => {
                return user._id == object._ownerId;
            };
            context.rules = {
                get,
                isOwner
            };
            const isAdmin = request.headers.hasOwnProperty('x-admin');

            context.canAccess = canAccess;

            function canAccess(data, newData) {
                const user = context.user;
                const action = actions[request.method];
                let { rule, propRules } = getRule(action, context.params.collection, data);

                if (Array.isArray(rule)) {
                    rule = checkRoles(rule, data);
                } else if (typeof rule == 'string') {
                    rule = !!(eval(rule));
                }
                if (!rule && !isAdmin) {
                    throw new CredentialError$2();
                }
                propRules.map(r => applyPropRule(action, r, user, data, newData));
            }

            function applyPropRule(action, [prop, rule], user, data, newData) {
                // NOTE: user needs to be in scope for eval to work on certain rules
                if (typeof rule == 'string') {
                    rule = !!eval(rule);
                }

                if (rule == false) {
                    if (action == '.create' || action == '.update') {
                        delete newData[prop];
                    } else if (action == '.read') {
                        delete data[prop];
                    }
                }
            }

            function checkRoles(roles, data, newData) {
                if (roles.includes('Guest')) {
                    return true;
                } else if (!context.user && !isAdmin) {
                    throw new AuthorizationError$2();
                } else if (roles.includes('User')) {
                    return true;
                } else if (context.user && roles.includes('Owner')) {
                    return context.user._id == data._ownerId;
                } else {
                    return false;
                }
            }
        };



        function getRule(action, collection, data = {}) {
            let currentRule = ruleOrDefault(true, rules['*'][action]);
            let propRules = [];

            // Top-level rules for the collection
            const collectionRules = rules[collection];
            if (collectionRules !== undefined) {
                // Top-level rule for the specific action for the collection
                currentRule = ruleOrDefault(currentRule, collectionRules[action]);

                // Prop rules
                const allPropRules = collectionRules['*'];
                if (allPropRules !== undefined) {
                    propRules = ruleOrDefault(propRules, getPropRule(allPropRules, action));
                }

                // Rules by record id 
                const recordRules = collectionRules[data._id];
                if (recordRules !== undefined) {
                    currentRule = ruleOrDefault(currentRule, recordRules[action]);
                    propRules = ruleOrDefault(propRules, getPropRule(recordRules, action));
                }
            }

            return {
                rule: currentRule,
                propRules
            };
        }

        function ruleOrDefault(current, rule) {
            return (rule === undefined || rule.length === 0) ? current : rule;
        }

        function getPropRule(record, action) {
            const props = Object
                .entries(record)
                .filter(([k]) => k[0] != '.')
                .filter(([k, v]) => v.hasOwnProperty(action))
                .map(([k, v]) => [k, v[action]]);

            return props;
        }
    }

    var rules = initPlugin$3;

    var identity = "email";
    var protectedData = {
        users: {
            "35c62d76-8152-4626-8712-eeb96381bea8": {
                email: "zk_98@abv.bg",
                status: "user_admin",
                username: "Zlatina",
                hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
            },
            "60f0cf0b-34b0-4abd-9769-8c42f830dffc": {
                email: "admin@abv.bg",
                status: "user_admin",
                username: "Admin",
                hashedPassword: "fac7060c3e17e6f151f247eacb2cd5ae80b8c36aedb8764e18a41bbdc16aa302"
            },
            "916887d9-4673-4b13-8526-05a52cf6add9": {
                email: "johndoe@abv.bg",
                status: "user_logged",
                username: "John Doe",
                password: "123",
                hashedPassword: "fac7060c3e17e6f151f247eacb2cd5ae80b8c36aedb8764e18a41bbdc16aa303"
            }
        },
        sessions: {
        }
    };
    var seedData = {
        merch: {
            "868e8be0-314e-4749-9582-c68fcf962b3d": {
                title: "T-Shirts & Hoodies",
                description: "Stylish, comfortable t-shirts and hoodies with unique festival graphics. Show off your festival spirit.",
                image: "../public/images/svg/hoodie.svg",
                _id: "868e8be0-314e-4749-9582-c68fcf962b3d"
            },
            "bf36eddd-d2e6-46d2-82ab-8dc813b91261": {
                title: "Caps & Beanies",
                description: "Trendy caps and beanies for sun protection or warmth. Essential for every festival-goer.",
                image: "../public/images/svg/cap.svg",
                _id: "bf36eddd-d2e6-46d2-82ab-8dc813b91261"
            },
            "a8ec5ee2-c32c-4325-8ce9-c741bcdc0a01": {
                title: "Tote Bags & Backpacks",
                description: "Durable, stylish tote bags and backpacks featuring exclusive festival designs. Carry essentials in style.",
                image: "../public/images/svg/backpack.svg",
                _id: "a8ec5ee2-c32c-4325-8ce9-c741bcdc0a01"
            },
            "5ae1b472-feb5-4f57-88af-1796aa4dde94": {
                title: "Posters & Art Prints",
                description: "Limited edition posters and art prints with stunning festival-inspired designs. Take the festival home.",
                image: "../public/images/svg/poster.svg",
                _id: "5ae1b472-feb5-4f57-88af-1796aa4dde94"
            },
            "c6825714-88af-4c76-901f-55d5860841a6": {
                title: "Souvenirs & Collectibles",
                description: "Keychains, badges, and more. Perfect mementos of your unforgettable festival experience.",
                image: "../public/images/svg/coolectibles.svg",
                _id: "c6825714-88af-4c76-901f-55d5860841a6"
            },
            "71a45582-2851-452f-882a-32fa27c85c0b": {
                title: "Awesome Keychains",
                description: "Durable keychains with intricate festival designs. Perfect for keys, backpacks, or purses.",
                image: "../public/images/svg/keychain.svg",
                _id: "71a45582-2851-452f-882a-32fa27c85c0b"
            },
            "e70a64b4-5caf-4d25-afe5-709fba5e24fc": {
                title: "Phone Cases",
                description: "High-quality phone cases with vibrant festival artwork. Excellent protection and slim design.",
                image: "../public/images/svg/phone-case.svg",
                _id: "e70a64b4-5caf-4d25-afe5-709fba5e24fc"
            },
            "6787e646-749e-498a-8768-15276a8cf303": {
                title: "Eco-Friendly Water Bottles",
                description: "Reusable water bottles with festival designs. Stay hydrated and environmentally conscious.",
                image: "../public/images/svg/water-bottle.svg",
                _id: "6787e646-749e-498a-8768-15276a8cf303"
            }

        },
        singers: {
            "3987279d-0ad4-4afb-8ca9-5b256ae3b298": {
                name: "Lady Gaga",
                _id: "3987279d-0ad4-4afb-8ca9-5b256ae3b298",
                image: "/public/images/temp/lady-gaga.png",
                details: {
                    bio: "Lady Gaga, born Stefani Joanne Angelina Germanotta on March 28, 1986, in New York City, is a globally acclaimed singer, songwriter, and actress. Known for her flamboyant fashion and powerful vocals, Gaga gained fame with her debut album, The Fame (2008), which included hits like 'Just Dance' and 'Poker Face.' She has won numerous awards, including 13 Grammys, and is celebrated for her versatility across music genres. Gaga also starred in the critically acclaimed film A Star Is Born (2018), earning an Oscar for Best Original Song for 'Shallow.' Her influence extends beyond music, advocating for mental health and LGBTQ+ rights.",
                    songs: [
                        "Bad Romance",
                        "Poker Face",
                        "Just Dance - (feat. Colby O'Donis)",
                        "Shallow - (with Bradley Cooper)",
                        "Born This Way",
                        "Alejandro",
                        "Paparazzi",
                        "Telephone - (feat. Beyoncé)", "The Edge of Glory",
                        "Million Reasons"
                    ]
                }
            },
            "f3d7bc9a-98d1-4d23-9c9e-dcd1f4f5b244": {
                name: "Pink",
                _id: "f3d7bc9a-98d1-4d23-9c9e-dcd1f4f5b244",
                image: "/public/images/temp/pink.png",
                details: {
                    bio: "Pink, born Alecia Beth Moore on September 8, 1979, in Doylestown, Pennsylvania, is an acclaimed American singer and songwriter known for her powerful voice and dynamic performances. She gained fame with her debut album, *Can't Take Me Home* (2000), and has since released multiple chart-topping albums. Pink is celebrated for her blend of pop and rock music and her hit singles such as 'Just Give Me a Reason' and 'So What.' Over her career, she has won multiple Grammy Awards and is known for her advocacy on various social issues.",
                    songs: [
                        "Just Give Me a Reason",
                        "So What",
                        "Just Like a Pill",
                        "Raise Your Glass",
                        "What About Us",
                        "Sober",
                        "Who Knew",
                        "Don't Let Me Get Me",
                        "Try",
                        "Get the Party Started"
                    ]
                }
            },
            "e21b0c3a-d223-46f4-b80c-85e2b1b8d09b": {
                name: "Shakira",
                _id: "e21b0c3a-d223-46f4-b80c-85e2b1b8d09b",
                image: "/public/images/temp/shakira.png",
                details: {
                    bio: "Shakira, born Shakira Isabel Mebarak Ripoll on February 2, 1977, in Barranquilla, Colombia, is a renowned Colombian singer, songwriter, and dancer. She gained international fame with her unique blend of Latin, Arabic, and pop music. Her breakthrough album, *Laundry Service* (2001), featured hits like 'Whenever, Wherever.' Shakira is celebrated for her energetic performances and has won multiple Grammy Awards. She is also known for her philanthropic work and advocacy for children's education.",
                    songs: [
                        "Hips Don't Lie",
                        "Whenever, Wherever",
                        "Waka Waka (This Time for Africa)",
                        "She Wolf",
                        "Underneath Your Clothes",
                        "La Tortura",
                        "Can't Remember to Forget You",
                        "Loca",
                        "Chantaje",
                        "Try Everything"
                    ]
                }
            },
            "d9f5b9c4-0f5c-4d44-a989-b8b7faad6b2f": {
                name: "Pitbull",
                _id: "d9f5b9c4-0f5c-4d44-a989-b8b7faad6b2f",
                image: "/public/images/temp/pitbull.png",
                details: {
                    bio: "Pitbull, born Armando Christian Pérez on January 15, 1981, in Miami, Florida, is an American rapper, singer, and songwriter known for his energetic and catchy tracks. He rose to prominence with his debut album, *M.I.A.M.I.* (2004), and has since become a global icon. Pitbull is famous for his party anthems and collaborations with artists across various genres. His hit singles include 'Give Me Everything' and 'Timber,' showcasing his signature blend of reggaeton, dance, and pop.",
                    songs: [
                        "Give Me Everything",
                        "Timber",
                        "I Know You Want Me (Calle Ocho)",
                        "Don't Stop the Party",
                        "Rain Over Me",
                        "Hotel Room Service",
                        "Hey Baby (Drop It to the Floor)",
                        "Feel This Moment",
                        "Back in Time",
                        "Fireball"
                    ]
                }
            },
            "1d9d6c8e-5c6e-4b68-b26b-13ae3f24a2f0": {
                name: "Jennifer Lopez",
                _id: "1d9d6c8e-5c6e-4b68-b26b-13ae3f24a2f0",
                image: "/public/images/temp/jennifer-lopez.png",
                details: {
                    bio: "Jennifer Lopez, born Jennifer Lynn Lopez on July 24, 1969, in The Bronx, New York, is a multifaceted American singer, actress, and dancer. Rising to fame in the late 1990s, Lopez has established herself as one of the most influential Latin artists. Her debut album, *On the 6* (1999), included hits like 'If You Had My Love.' Lopez is celebrated for her contributions to both music and film, and has won numerous awards including Grammy nominations and a Golden Globe.",
                    songs: [
                        "On the Floor",
                        "If You Had My Love",
                        "Jenny from the Block",
                        "Let's Get Loud",
                        "Love Don't Cost a Thing",
                        "Waiting for Tonight",
                        "I'm Real",
                        "Ain't It Funny",
                        "Get Right",
                        "All I Have"
                    ]
                }
            },
            "2a1e5f4e-87d4-4b7f-ae40-989d06546a57": {
                name: "Eminem",
                _id: "2a1e5f4e-87d4-4b7f-ae40-989d06546a57",
                image: "/public/images/temp/eminem.png",
                details: {
                    bio: "Eminem, born Marshall Bruce Mathers III on October 17, 1972, in St. Joseph, Missouri, is an American rapper, songwriter, and record producer. Known for his intricate lyrics and controversial themes, Eminem emerged as a prominent figure in the late 1990s with his debut album, *The Slim Shady LP* (1999). He has won numerous awards, including 15 Grammys and an Academy Award for Best Original Song. Eminem's influence extends across the hip-hop genre and popular culture.",
                    songs: [
                        "Lose Yourself",
                        "Stan",
                        "Without Me",
                        "Love the Way You Lie",
                        "Not Afraid",
                        "The Real Slim Shady",
                        "Mockingbird",
                        "Forgot About Dre",
                        "Rap God",
                        "Godzilla"
                    ]
                }
            },
            "b2e2f61c-4b7e-46a5-a892-f9e5c5104de4": {
                name: "Drake",
                _id: "b2e2f61c-4b7e-46a5-a892-f9e5c5104de4",
                image: "/public/images/temp/drake.png",
                details: {
                    bio: "Drake, born Aubrey Drake Graham on October 24, 1986, in Toronto, Canada, is a highly influential rapper, singer, and songwriter. Rising to fame with his mixtapes and debut album, *Thank Me Later* (2010), Drake is known for his blend of rap and R&B. He has set numerous streaming records and won several Grammy Awards. His versatile style and lyrical content have made him one of the most prominent figures in contemporary music.",
                    songs: [
                        "Hotline Bling",
                        "God's Plan",
                        "In My Feelings",
                        "One Dance",
                        "Started From the Bottom",
                        "Nice for What",
                        "Controlla",
                        "Take Care",
                        "Nonstop",
                        "Sicko Mode"
                    ]
                }
            },
            "a7d99b6d-1b3e-4d9e-9e4a-f5a2b728d82b": {
                name: "Christina Aguilera",
                _id: "a7d99b6d-1b3e-4d9e-9e4a-f5a2b728d82b",
                image: "/public/images/temp/christina-aguilera.png",
                details: {
                    bio: "Christina Aguilera, born Christina María Aguilera on December 18, 1980, in Staten Island, New York, is a renowned American singer, songwriter, and television personality. She gained fame with her debut self-titled album in 1999, featuring hits like 'Genie in a Bottle.' Aguilera is known for her powerful vocal range and has received multiple Grammy Awards. Her music spans pop, R&B, and soul, and she continues to be a prominent figure in the music industry.",
                    songs: [
                        "Genie in a Bottle",
                        "Beautiful",
                        "What a Girl Wants",
                        "Dirrty",
                        "Fighter",
                        "Hurt",
                        "Ain't No Other Man",
                        "Candyman",
                        "Lady Marmalade",
                        "Burlesque"
                    ]
                }
            },
            "db2eafc3-01dc-4cbf-9c62-33e4edb2bba7": {
                name: "Bruno Mars",
                _id: "db2eafc3-01dc-4cbf-9c62-33e4edb2bba7",
                image: "/public/images/temp/bruno-mars.png",
                details: {
                    bio: "Bruno Mars, born Peter Gene Hernandez on October 8, 1985, in Honolulu, Hawaii, is an American singer, songwriter, and record producer known for his eclectic music style. His debut album, *Doo-Wops & Hooligans* (2010), included hits like 'Just the Way You Are.' Mars has received multiple Grammy Awards and is praised for his soulful vocals and impressive live performances. His music blends pop, funk, soul, and R&B, making him a versatile and influential artist.",
                    songs: [
                        "Uptown Funk",
                        "Just the Way You Are",
                        "Locked Out of Heaven",
                        "Grenade",
                        "When I Was Your Man",
                        "24K Magic",
                        "That's What I Like",
                        "Finesse",
                        "Treasure",
                        "Versace on the Floor"
                    ]
                }
            },
            "ab3a2c0c-8b6a-4d3f-bdd3-07d688639fc0": {
                name: "Beyonce",
                _id: "ab3a2c0c-8b6a-4d3f-bdd3-07d688639fc0",
                image: "/public/images/temp/beyonce.png",
                details: {
                    bio: "Beyoncé, born Beyoncé Giselle Knowles on September 4, 1981, in Houston, Texas, is a globally renowned singer, songwriter, and actress. She rose to fame as the lead vocalist of Destiny's Child before launching a highly successful solo career. Her debut album, *Dangerously in Love* (2003), was a major success. Known for her powerful voice and stage presence, Beyoncé has won numerous Grammy Awards and continues to influence the music industry with her innovative work and activism.",
                    songs: [
                        "Crazy in Love",
                        "Single Ladies (Put a Ring on It)",
                        "Halo",
                        "Irreplaceable",
                        "Run the World (Girls)",
                        "Formation",
                        "Drunk in Love",
                        "Love on Top",
                        "If I Were a Boy",
                        "Partition"
                    ]
                }
            },
            "b7d2a1de-b8b2-4d7a-a07d-5b4d3b682c4f": {
                name: "Akon",
                _id: "b7d2a1de-b8b2-4d7a-a07d-5b4d3b682c4f",
                image: "/public/images/temp/akon.png",
                details: {
                    bio: "Akon, born Aliaune Thiam on April 16, 1973, in Saint-Louis, Senegal, is an American singer, songwriter, and producer known for his distinctive voice and blend of R&B, hip-hop, and dancehall. His debut album, *Trouble* (2004), featured hit singles like 'Locked Up.' Akon is also recognized for his philanthropic work and contributions to music production, and he has collaborated with numerous artists across genres.",
                    songs: [
                        "Smack That",
                        "Lonely",
                        "Don't Matter",
                        "Right Now (Na Na Na)",
                        "I Wanna Love You",
                        "Ghetto",
                        "Beautiful",
                        "Sorry, Blame It on Me",
                        "Konvict Music",
                        "Mama Africa"
                    ]
                }
            },
            "d1a73c18-8d8c-4e3b-b1e0-4b7a8c5ea317": {
                name: "50 Cent",
                _id: "d1a73c18-8d8c-4e3b-b1e0-4b7a8c5ea317",
                image: "/public/images/temp/50-cents.png",
                details: {
                    bio: "50 Cent, born Curtis James Jackson III on July 6, 1975, in Queens, New York, is an influential American rapper, actor, and businessman. He gained prominence with his debut album, *Get Rich or Die Tryin'* (2003), which included hits like 'In Da Club.' 50 Cent is known for his gritty lyrics and has won several Grammy Awards. His impact extends beyond music into film and television production.",
                    songs: [
                        "In Da Club",
                        "Candy Shop",
                        "21 Questions",
                        "P.I.M.P.",
                        "Just a Lil Bit",
                        "Hate It or Love It",
                        "Ayo Technology",
                        "Many Men (Wish Death)",
                        "Window Shopper",
                        "Disco Inferno"
                    ]
                }
            },
            "edb98b23-4f2f-4b68-bb5d-3d6c062d1b23": {
                name: "Miley Cyrus",
                _id: "edb98b23-4f2f-4b68-bb5d-3d6c062d1b23",
                image: "/public/images/temp/miley-cyrus.png",
                details: {
                    bio: "Miley Cyrus, born Destiny Hope Cyrus on November 23, 1992, in Franklin, Tennessee, is an American singer, songwriter, and actress known for her dynamic and evolving musical style. She first gained fame as the star of Disney's *Hannah Montana* before launching a successful solo career. Her debut album, *Breakout* (2008), featured hits like 'See You Again.' Cyrus is known for her distinctive voice and bold image, and she continues to be a significant figure in pop music.",
                    songs: [
                        "Wrecking Ball",
                        "Party in the U.S.A.",
                        "Malibu",
                        "The Climb",
                        "We Can't Stop",
                        "7 Things",
                        "Nothing Breaks Like a Heart",
                        "Adore You",
                        "Slide Away",
                        "Jolene"
                    ]
                }
            },
            "c5d9f4e2-7c6b-4f15-87d4-7b86579efb4d": {
                name: "Rihanna",
                _id: "c5d9f4e2-7c6b-4f15-87d4-7b86579efb4d",
                image: "/public/images/temp/rihanna.png",
                details: {
                    bio: "Rihanna, born Robyn Rihanna Fenty on February 20, 1988, in Saint Michael, Barbados, is a globally renowned singer, songwriter, and entrepreneur. She gained international fame with her debut album, *Music of the Sun* (2005), and has since become a major force in music with hits like 'Umbrella' and 'We Found Love.' Known for her distinctive voice and fashion sense, Rihanna has won multiple Grammy Awards and is also recognized for her successful ventures in fashion and beauty, including her Fenty Beauty line.",
                    songs: [
                        "Umbrella",
                        "We Found Love",
                        "Diamonds",
                        "Rude Boy",
                        "Only Girl (In The World)",
                        "Work",
                        "Don't Stop the Music",
                        "Where Have You Been",
                        "Stay",
                        "S&M"
                    ]
                }
            }
        },
    recipes: {
    "3987279d-0ad4-4afb-8ca9-5b256ae3b298": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        name: "Easy Lasagna",
        img: "assets/lasagna.jpg",
        ingredients: [
            "1 tbsp Ingredient 1",
            "2 cups Ingredient 2",
            "500 g  Ingredient 3",
            "25 g Ingredient 4"
        ],
        steps: [
            "Prepare ingredients",
            "Mix ingredients",
            "Cook until done"
        ],
        _createdOn: 1613551279012
    },
    "8f414b4f-ab39-4d36-bedb-2ad69da9c830": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        name: "Grilled Duck Fillet",
        img: "assets/roast.jpg",
        ingredients: [
            "500 g  Ingredient 1",
            "3 tbsp Ingredient 2",
            "2 cups Ingredient 3"
        ],
        steps: [
            "Prepare ingredients",
            "Mix ingredients",
            "Cook until done"
        ],
        _createdOn: 1613551344360
    },
    "985d9eab-ad2e-4622-a5c8-116261fb1fd2": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        name: "Roast Trout",
        img: "assets/fish.jpg",
        ingredients: [
            "4 cups Ingredient 1",
            "1 tbsp Ingredient 2",
            "1 tbsp Ingredient 3",
            "750 g  Ingredient 4",
            "25 g Ingredient 5"
        ],
        steps: [
            "Prepare ingredients",
            "Mix ingredients",
            "Cook until done"
        ],
        _createdOn: 1613551388703
    }
},
    comments: {
    "0a272c58-b7ea-4e09-a000-7ec988248f66": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        content: "I love Bad Romance",
        _singerId: "3987279d-0ad4-4afb-8ca9-5b256ae3b298",
        _createdOn: 1614260681375,
        _id: "0a272c58-b7ea-4e09-a000-7ec988248f66"
    },
    "e1f4bb32-5a43-48ea-8fb4-27ba9a3ae731": {
        _ownerId: "916887d9-4673-4b13-8526-05a52cf6add9",
        _singerId: "3987279d-0ad4-4afb-8ca9-5b256ae3b298",
        content: "Poker Face\n",
        _createdOn: 1722604026579,
        _id: "e1f4bb32-5a43-48ea-8fb4-27ba9a3ae731"
    },
    "ecd9e19d-7594-49e2-a8b2-ec522e28d70f": {
        _ownerId: "916887d9-4673-4b13-8526-05a52cf6add9",
        _singerId: "f3d7bc9a-98d1-4d23-9c9e-dcd1f4f5b244",
        content: "Just Give Me a Reason\n",
        _createdOn: 1722604052264,
        _id: "ecd9e19d-7594-49e2-a8b2-ec522e28d70f"
    },
    "e73caf9a-c6a2-41fb-bdc1-6b2cf3210de4": {
        _ownerId: "916887d9-4673-4b13-8526-05a52cf6add9",
        _singerId: "e21b0c3a-d223-46f4-b80c-85e2b1b8d09b",
        content: "She Wolf\n",
        _createdOn: 1722604060482,
        _id: "e73caf9a-c6a2-41fb-bdc1-6b2cf3210de4"
    },
    "fe801aad-3e1f-4f49-9d14-3338925b376d": {
        _ownerId: "916887d9-4673-4b13-8526-05a52cf6add9",
        _singerId: "a7d99b6d-1b3e-4d9e-9e4a-f5a2b728d82b",
        content: "Burlesque",
        _createdOn: 1722604070536,
        _id: "fe801aad-3e1f-4f49-9d14-3338925b376d"
    },
    "353a9e2d-8040-4c70-bc50-9a26b6490ed8": {
        _ownerId: "916887d9-4673-4b13-8526-05a52cf6add9",
        _singerId: "a7d99b6d-1b3e-4d9e-9e4a-f5a2b728d82b",
        content: "What a Girl Wants\n",
        _createdOn: 1722604077202,
        _id: "353a9e2d-8040-4c70-bc50-9a26b6490ed8"
    },
    "9857294e-2216-4a44-b6dd-d857301facda": {
        _ownerId: "916887d9-4673-4b13-8526-05a52cf6add9",
        _singerId: "b2e2f61c-4b7e-46a5-a892-f9e5c5104de4",
        content: "Sicko Mode\n",
        _createdOn: 1722604086045,
        _id: "9857294e-2216-4a44-b6dd-d857301facda"
    },
    "1bd83aa2-b680-4e0e-a047-385492147fb8": {
        _ownerId: "916887d9-4673-4b13-8526-05a52cf6add9",
        _singerId: "ab3a2c0c-8b6a-4d3f-bdd3-07d688639fc0",
        content: "Drunk in Love\n",
        _createdOn: 1722604098793,
        _id: "1bd83aa2-b680-4e0e-a047-385492147fb8"
    },
    "826fd7a7-7020-4b81-aab5-9374d3c25fa6": {
        _ownerId: "916887d9-4673-4b13-8526-05a52cf6add9",
        _singerId: "c5d9f4e2-7c6b-4f15-87d4-7b86579efb4d",
        content: "Don't Stop the Music\n",
        _createdOn: 1722604109328,
        _id: "826fd7a7-7020-4b81-aab5-9374d3c25fa6"
    },
    "189621a5-e62e-4d43-adb1-471319532373": {
        _ownerId: "916887d9-4673-4b13-8526-05a52cf6add9",
        _singerId: "db2eafc3-01dc-4cbf-9c62-33e4edb2bba7",
        content: "That's What I Like\n",
        _createdOn: 1722604139433,
        _id: "189621a5-e62e-4d43-adb1-471319532373"
    },
    "5912d251-2272-466c-92d5-6a93833d63bd": {
        _ownerId: "916887d9-4673-4b13-8526-05a52cf6add9",
        _singerId: "edb98b23-4f2f-4b68-bb5d-3d6c062d1b23",
        content: "We Can't Stop\n",
        _createdOn: 1722604149182,
        _id: "5912d251-2272-466c-92d5-6a93833d63bd"
    }
},
    records: {
    i01: {
        name: "John1",
        val: 1,
        _createdOn: 1613551388703
    },
    i02: {
        name: "John2",
        val: 1,
        _createdOn: 1613551388713
    },
    i03: {
        name: "John3",
        val: 2,
        _createdOn: 1613551388723
    },
    i04: {
        name: "John4",
        val: 2,
        _createdOn: 1613551388733
    },
    i05: {
        name: "John5",
        val: 2,
        _createdOn: 1613551388743
    },
    i06: {
        name: "John6",
        val: 3,
        _createdOn: 1613551388753
    },
    i07: {
        name: "John7",
        val: 3,
        _createdOn: 1613551388763
    },
    i08: {
        name: "John8",
        val: 2,
        _createdOn: 1613551388773
    },
    i09: {
        name: "John9",
        val: 3,
        _createdOn: 1613551388783
    },
    i10: {
        name: "John10",
        val: 1,
        _createdOn: 1613551388793
    }
},
    catches: {
    "07f260f4-466c-4607-9a33-f7273b24f1b4": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        angler: "Paulo Admorim",
        weight: 636,
        species: "Atlantic Blue Marlin",
        location: "Vitoria, Brazil",
        bait: "trolled pink",
        captureTime: 80,
        _createdOn: 1614760714812,
        _id: "07f260f4-466c-4607-9a33-f7273b24f1b4"
    },
    "bdabf5e9-23be-40a1-9f14-9117b6702a9d": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        angler: "John Does",
        weight: 554,
        species: "Atlantic Blue Marlin",
        location: "Buenos Aires, Argentina",
        bait: "trolled pink",
        captureTime: 120,
        _createdOn: 1614760782277,
        _id: "bdabf5e9-23be-40a1-9f14-9117b6702a9d"
    }
},
    movies: {
    "1240549d-f0e0-497e-ab99-eb8f703713d7": {
        title: "Black Widow",
        isWatched: false,
        _createdAt: 1614935055353,
        _id: "1240549d-f0e0-497e-ab99-eb8f703713d7"
    },
    "143e5265-333e-4150-80e4-16b61de31aa0": {
        title: "Wonder Woman 1984",
        isWatched: true,
        img: "https://pbs.twimg.com/media/ETINgKwWAAAyA4r.jpg",
        _createdAt: 1614935181470,
        _id: "143e5265-333e-4150-80e4-16b61de31aa0"
    },
    "a9bae6d8-793e-46c4-a9db-deb9e3484909": {
        title: "Top Gun 2",
        isWatched: false,
        _createdAt: 1614935268135,
        _id: "a9bae6d8-793e-46c4-a9db-deb9e3484909"
    },
    "a9bae6d8-793e-46c4-a9db-deb9e3484910": {
        title: "Top Gun 1",
        isWatched: false,
        _createdAt: 1614935268136,
        _id: "a9bae6d8-793e-46c4-a9db-deb9e3484910"
    },
    "a9bae6d8-793e-46c4-a9db-deb9e3484911": {
        title: "Top Gun 2",
        isWatched: false,
        _createdAt: 1614935268135,
        _id: "a9bae6d8-793e-46c4-a9db-deb9e3484911"
    },
    "a9bae6d8-793e-46c4-a9db-deb9e3484912": {
        title: "Home Alone",
        isWatched: false,
        _createdAt: 1614935268135,
        _id: "a9bae6d8-793e-46c4-a9db-deb9e3484912"
    },
    "a9bae6d8-793e-46c4-a9db-deb9e3484913": {
        title: "Home Alone 2",
        isWatched: false,
        _createdAt: 1614935268135,
        _id: "a9bae6d8-793e-46c4-a9db-deb9e3484913"
    }
},
    likes: {
},
    ideas: {
    "833e0e57-71dc-42c0-b387-0ce0caf5225e": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        title: "Best Pilates Workout To Do At Home",
        description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Minima possimus eveniet ullam aspernatur corporis tempore quia nesciunt nostrum mollitia consequatur. At ducimus amet aliquid magnam nulla sed totam blanditiis ullam atque facilis corrupti quidem nisi iusto saepe, consectetur culpa possimus quos? Repellendus, dicta pariatur! Delectus, placeat debitis error dignissimos nesciunt magni possimus quo nulla, fuga corporis maxime minus nihil doloremque aliquam quia recusandae harum. Molestias dolorum recusandae commodi velit cum sapiente placeat alias rerum illum repudiandae? Suscipit tempore dolore autem, neque debitis quisquam molestias officia hic nesciunt? Obcaecati optio fugit blanditiis, explicabo odio at dicta asperiores distinctio expedita dolor est aperiam earum! Molestias sequi aliquid molestiae, voluptatum doloremque saepe dignissimos quidem quas harum quo. Eum nemo voluptatem hic corrupti officiis eaque et temporibus error totam numquam sequi nostrum assumenda eius voluptatibus quia sed vel, rerum, excepturi maxime? Pariatur, provident hic? Soluta corrupti aspernatur exercitationem vitae accusantium ut ullam dolor quod!",
        img: "./images/best-pilates-youtube-workouts-2__medium_4x3.jpg",
        _createdOn: 1615033373504,
        _id: "833e0e57-71dc-42c0-b387-0ce0caf5225e"
    },
    "247efaa7-8a3e-48a7-813f-b5bfdad0f46c": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        title: "4 Eady DIY Idea To Try!",
        description: "Similique rem culpa nemo hic recusandae perspiciatis quidem, quia expedita, sapiente est itaque optio enim placeat voluptates sit, fugit dignissimos tenetur temporibus exercitationem in quis magni sunt vel. Corporis officiis ut sapiente exercitationem consectetur debitis suscipit laborum quo enim iusto, labore, quod quam libero aliquid accusantium! Voluptatum quos porro fugit soluta tempore praesentium ratione dolorum impedit sunt dolores quod labore laudantium beatae architecto perspiciatis natus cupiditate, iure quia aliquid, iusto modi esse!",
        img: "./images/brightideacropped.jpg",
        _createdOn: 1615033452480,
        _id: "247efaa7-8a3e-48a7-813f-b5bfdad0f46c"
    },
    "b8608c22-dd57-4b24-948e-b358f536b958": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        title: "Dinner Recipe",
        description: "Consectetur labore et corporis nihil, officiis tempora, hic ex commodi sit aspernatur ad minima? Voluptas nesciunt, blanditiis ex nulla incidunt facere tempora laborum ut aliquid beatae obcaecati quidem reprehenderit consequatur quis iure natus quia totam vel. Amet explicabo quidem repellat unde tempore et totam minima mollitia, adipisci vel autem, enim voluptatem quasi exercitationem dolor cum repudiandae dolores nostrum sit ullam atque dicta, tempora iusto eaque! Rerum debitis voluptate impedit corrupti quibusdam consequatur minima, earum asperiores soluta. A provident reiciendis voluptates et numquam totam eveniet! Dolorum corporis libero dicta laborum illum accusamus ullam?",
        img: "./images/dinner.jpg",
        _createdOn: 1615033491967,
        _id: "b8608c22-dd57-4b24-948e-b358f536b958"
    }
},
    catalog: {
    "53d4dbf5-7f41-47ba-b485-43eccb91cb95": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        make: "Table",
        model: "Swedish",
        year: 2015,
        description: "Medium table",
        price: 235,
        img: "./images/table.png",
        material: "Hardwood",
        _createdOn: 1615545143015,
        _id: "53d4dbf5-7f41-47ba-b485-43eccb91cb95"
    },
    "f5929b5c-bca4-4026-8e6e-c09e73908f77": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        make: "Sofa",
        model: "ES-549-M",
        year: 2018,
        description: "Three-person sofa, blue",
        price: 1200,
        img: "./images/sofa.jpg",
        material: "Frame - steel, plastic; Upholstery - fabric",
        _createdOn: 1615545572296,
        _id: "f5929b5c-bca4-4026-8e6e-c09e73908f77"
    },
    "c7f51805-242b-45ed-ae3e-80b68605141b": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        make: "Chair",
        model: "Bright Dining Collection",
        year: 2017,
        description: "Dining chair",
        price: 180,
        img: "./images/chair.jpg",
        material: "Wood laminate; leather",
        _createdOn: 1615546332126,
        _id: "c7f51805-242b-45ed-ae3e-80b68605141b"
    }
},
    teams: {
    "34a1cab1-81f1-47e5-aec3-ab6c9810efe1": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        name: "Storm Troopers",
        logoUrl: "/assets/atat.png",
        description: "These ARE the droids we're looking for",
        _createdOn: 1615737591748,
        _id: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1"
    },
    "dc888b1a-400f-47f3-9619-07607966feb8": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        name: "Team Rocket",
        logoUrl: "/assets/rocket.png",
        description: "Gotta catch 'em all!",
        _createdOn: 1615737655083,
        _id: "dc888b1a-400f-47f3-9619-07607966feb8"
    },
    "733fa9a1-26b6-490d-b299-21f120b2f53a": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        name: "Minions",
        logoUrl: "/assets/hydrant.png",
        description: "Friendly neighbourhood jelly beans, helping evil-doers succeed.",
        _createdOn: 1615737688036,
        _id: "733fa9a1-26b6-490d-b299-21f120b2f53a"
    }
},
    members: {
    "cc9b0a0f-655d-45d7-9857-0a61c6bb2c4d": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        teamId: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1",
        status: "member",
        _createdOn: 1616236790262,
        _updatedOn: 1616236792930
    },
    "61a19986-3b86-4347-8ca4-8c074ed87591": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
        status: "member",
        _createdOn: 1616237188183,
        _updatedOn: 1616237189016
    },
    "8a03aa56-7a82-4a6b-9821-91349fbc552f": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        teamId: "733fa9a1-26b6-490d-b299-21f120b2f53a",
        status: "member",
        _createdOn: 1616237193355,
        _updatedOn: 1616237195145
    },
    "9be3ac7d-2c6e-4d74-b187-04105ab7e3d6": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
        status: "member",
        _createdOn: 1616237231299,
        _updatedOn: 1616237235713
    },
    "280b4a1a-d0f3-4639-aa54-6d9158365152": {
        _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
        teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
        status: "member",
        _createdOn: 1616237257265,
        _updatedOn: 1616237278248
    },
    "e797fa57-bf0a-4749-8028-72dba715e5f8": {
        _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
        teamId: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1",
        status: "member",
        _createdOn: 1616237272948,
        _updatedOn: 1616237293676
    }
}
    };
var rules$1 = {
    users: {
        ".create": false,
        ".read": [
            "Owner"
        ],
        ".update": false,
        ".delete": false
    },
    members: {
        ".update": "isOwner(user, get('teams', data.teamId))",
        ".delete": "isOwner(user, get('teams', data.teamId)) || isOwner(user, data)",
        "*": {
            teamId: {
                ".update": "newData.teamId = data.teamId"
            },
            status: {
                ".create": "newData.status = 'pending'"
            }
        }
    }
};
var settings = {
    identity: identity,
    protectedData: protectedData,
    seedData: seedData,
    rules: rules$1
};

const plugins = [
    storage(settings),
    auth(settings),
    util$2(),
    rules(settings)
];

const server = http__default['default'].createServer(requestHandler(plugins, services));

const port = 3030;
server.listen(port);
console.log(`Server started on port ${port}. You can make requests to http://localhost:${port}/`);
console.log(`Admin panel located at http://localhost:${port}/admin`);

var softuniPracticeServer = {

};

return softuniPracticeServer;

})));
