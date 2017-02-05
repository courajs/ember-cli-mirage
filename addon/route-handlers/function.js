import BaseRouteHandler from './base';

export default class FunctionRouteHandler extends BaseRouteHandler {

  constructor(schema, serializer, userFunction, path) {
    super();
    this.schema = schema;
    this.serializer = serializer;
    this.userFunction = userFunction;
    this.path = path;
  }

  handle(request) {
    return this.userFunction(this.schema, request);
  }

  setRequest(request) {
    this.request = request;
  }

  serialize(response) {
    return this.serializer.serializeResponse(response);
  }

  normalizedRequestAttrs() {
    let {
      path,
      request,
      request: { requestHeaders }
    } = this;

    let modelName = this.getModelClassFromPath(path);

    if (/x-www-form-urlencoded/.test(requestHeaders['Content-Type'])) {
      return this._getAttrsForFormRequest(request);
    } else {
      return this._getAttrsForRequest(request, modelName);
    }
  }
}
