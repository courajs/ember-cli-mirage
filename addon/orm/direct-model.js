import {
  assert,
  present,
  toCollectionName
} from 'ember-cli-mirage/utils';

//
// DirectModel
//
// A DirectModel is a view on a model in the database. Changes made to
// its attributes are immediately synced to the db. It can only be created for
// an existing record. The DirectInterface is one way to create records
//

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


  //
  // Private methods
  //

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
    let rels = this._schema.relationships.relationshipsForType(this.modelName);
    rels.forEach(({name, to: toType}) => {
      Object.defineProperty(this, name, {
        get() {
          let {type, id} = this._schema.relationships.getRelated(this, name);
          let model = this._schema[toCollectionName(type)].find(id);
          return model;
        },
        set(modelOrId) {
          if (isId(modelOrId)) {
            let linkage = {
              modelName: toType,
              id: modelOrId
            };
            this._schema.relationships.setOne(this, name, linkage);
          } else {
            this._schema.relationships.setOne(this, name, modelOrId);
          }
        }
      });
    });
  }
}

function isId(x) {
  return typeof x === 'string' || typeof x === 'number';
}
