import Ember from 'ember';
import { MirageError } from 'ember-cli-mirage/assert';
import Response from './response';
import FunctionHandler from './route-handlers/function';
import ObjectHandler from './route-handlers/object';
import GetShorthandHandler from './route-handlers/shorthands/get';
import PostShorthandHandler from './route-handlers/shorthands/post';
import PutShorthandHandler from './route-handlers/shorthands/put';
import DeleteShorthandHandler from './route-handlers/shorthands/delete';
import HeadShorthandHandler from './route-handlers/shorthands/head';
import { Model, Collection } from 'ember-cli-mirage';

const { RSVP: { Promise }, isBlank, typeOf } = Ember;

function isNotBlankResponse(response) {
  return response
    && !(typeOf(response) === 'object' && Object.keys(response).length === 0)
    && (Array.isArray(response) || !isBlank(response));
}

const DEFAULT_CODES = { get: 200, put: 204, post: 201, 'delete': 204 };

function createHandler({ verb, schema, serializer, path, rawHandler, options }) {
  let handler;
  let args = [schema, serializer, rawHandler, path, options];
  let type = typeOf(rawHandler);

  if (type === 'function') {
    handler = new FunctionHandler(...args);
  } else if (type === 'object') {
    handler = new ObjectHandler(...args);
  } else if (verb === 'get') {
    handler = new GetShorthandHandler(...args);
  } else if (verb === 'post') {
    handler = new PostShorthandHandler(...args);
  } else if (verb === 'put' || verb === 'patch') {
    handler = new PutShorthandHandler(...args);
  } else if (verb === 'delete') {
    handler = new DeleteShorthandHandler(...args);
  } else if (verb === 'head') {
    handler = new HeadShorthandHandler(...args);
  }
  return handler;
}

export default class RouteHandler {

  constructor({ schema, verb, rawHandler, customizedCode, options, path, serializer }) {
    this.verb = verb;
    this.customizedCode = customizedCode;
    this.serializer = serializer;
    this.handler = createHandler({ verb, schema, path, serializer, rawHandler, options });
  }

  handle(request) {
    let handlerResult = this._getHandlerResult(request);
    let serialized = this.serialize(handlerResult);
    let response = this._toMirageResponse(serialized).toRackResponse();
    return Promise.resolve(response);
  }

  _getHandlerResult(request) {
    try {
      /*
       We need to do this for the #serialize convenience method. Probably is
       a better way.
     */
      if (this.handler instanceof FunctionHandler) {
        this.handler.setRequest(request);
      }

      return this.handler.handle(request);
    } catch(e) {
      if (e instanceof MirageError) {
        throw e;
      } else {
        let message = (typeOf(e) === 'string') ? e : e.message;
        throw new MirageError(`Your handler for the url ${request.url} threw an error: ${message}`);
      }
    }
  }

  _toMirageResponse(result) {
    let code = this._getCodeForResponse(result);
    return new Response(code, {}, result);
  }

  _getCodeForResponse(response) {
    let code;
    if (this.customizedCode) {
      code = this.customizedCode;
    } else {
      code = DEFAULT_CODES[this.verb];
      if (code === 204 && isNotBlankResponse(response)) {
        code = 200;
      }
    }
    return code;
  }

  serialize(handlerResult) {
    if (this._isModelOrCollection(handlerResult)) {
      return this.serializer.serializeResponse(handlerResult);
    } else {
      return handlerResult;
    }
  }

  _isModel(object) {
    return object instanceof Model;
  }

  _isCollection(object) {
    return object instanceof Collection;
  }

  _isModelOrCollection(object) {
    return this._isModel(object) || this._isCollection(object);
  }
}
