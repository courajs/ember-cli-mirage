import BaseRouteHandler from './base';
import AaronSerializer from '../serializers/aaron';

export default class FunctionRouteHandler extends BaseRouteHandler {

  constructor(schema, serializerOrRegistry, userFunction, path) {
    super();
    this.schema = schema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.userFunction = userFunction;
    this.path = path;
  }

  handle(request) {
    return this.userFunction(this.schema, request);
  }

  setRequest(request) {
    this.request = request;
  }

  serialize(response, relationshipStore) {
    let serializer = AaronSerializer.create({store: relationshipStore});
    return serializer.serializeResponse(response);
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
