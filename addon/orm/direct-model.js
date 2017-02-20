import {
  assert,
  present,
  toCollectionName
} from 'ember-cli-mirage/utils';

export default class DirectModel {
  constructor({ schema, type, attrs, id }) {
    assert(schema, 'Pass a schema to DirectModel');
    assert(type, 'Pass a type to DirectModel');
    assert(attrs || present(id), 'Pass either attributes or an id to DirectModel');

    this._schema = schema;
    this.modelName = type;

    if (attrs) {
      let inserted = this._collection.insert(attrs);
      this._id = inserted.id;
    } else {
      this._id = id;
    }

    this._setupAttrs();
    this._setupRelationships();
  }

  get attrs() {
    return this._collection.find(this._id);
  }

  get _collection() {
    let name = toCollectionName(this.modelName);
    return this._schema.db[name];
  }

  _setupAttrs() {
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

  _setupRelationships() {
    // let rels = this._schema.relationships.relationshipsForType(this.modelName);
  }
}
