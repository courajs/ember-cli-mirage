import _ from 'lodash';
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

  create(attrs) {
    let {id} = this._collection.insert(attrs);
    return this.find(id);
  }

  createList(count, attrs) {
    let result = [];
    for (let i = 0; i < count; i++) {
      result.push(this.create(attrs));
    }
    return result;
  }

  find(...ids) {
    if (ids.length === 1 && isId(ids[0])) {
      return new DirectModel({
        schema: this._schema,
        type: this.type,
        id: ids[0]
      });
    } else {
      return _.flatten(ids).map((id) => { // flatten supports both .find('a', 'b') and .find(['a', 'b'])
        return new DirectModel({
          schema: this._schema,
          type: this.type,
          id: id
        });
      });
    }
  }

  all() {
    return this._collection.map(({id}) => this.find(id));
  }

  get _collection() {
    return this._schema.db[toCollectionName(this.type)];
  }
}

function isId(x) {
  return typeof x === 'string' || typeof x === 'number';
}
