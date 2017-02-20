import {
  assert,
  toCollectionName
} from 'ember-cli-mirage/utils';

export default class DirectModel {
  constructor({ schema, type, id }) {
    assert(schema, 'Pass a schema to DirectModel');
    assert(type, 'Pass a type to DirectModel');
    assert(present(id), 'Pass an id to DirectModel');

    this._schema = schema;
    this._id = id;

    this.modelName = type;

    this._proxyAttrs();
  }

  get _collection() {
    let name = toCollectionName(this.modelName);
    return this._schema.db[name];
  }

  get attrs() {
    return this._collection.find(this._id);
  }

  _proxyAttrs() {
    for (let attr in this.attrs) {
      Object.defineProperty(this, attr, {
        get() {
          return this.attrs[attr];
        },
        set(val) {
          this._collection.update(
              { id: this._id },
              { [attr]: val }
          );
        }
      });
    }
  }
}

function present(x) {
  return x != null;
}
