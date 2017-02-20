import { DirectModel } from 'ember-cli-mirage/internal';
import {
  toCollectionName
} from 'ember-cli-mirage/utils';

//
// DirectInterface
//
// An interface for a given collection that allows you to find,
// query, and create DirectModels of that type
//

export default class DirectInterface {
  constructor({schema, type}) {
    this._schema = schema;
    this.type = type;
  }

  find(id) {
    return new DirectModel({
      schema: this._schema,
      type: this.type,
      id: id
    });
  }

  all() {
    return this._collection.map(({id}) => this.find(id));
  }

  get _collection() {
    return this._schema.db[toCollectionName(this.type)];
  }
}
