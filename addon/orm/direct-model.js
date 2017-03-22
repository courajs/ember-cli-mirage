import {
  assert,
  present,
  toCollectionName
} from 'ember-cli-mirage/utils';

import {
  ResourceIdentifier
} from 'ember-cli-mirage/internal';

//
// DirectModel
//
// A DirectModel is a view on a model in the database. Changes made to
// its attributes are immediately synced to the db. It can only be created for
// an existing record. The DirectInterface is one way to create records
//

export default function directModelClassFor(type, typeClass) {
  assert(type, 'Pass a type name!');
  assert(typeClass, 'Pass a type class!');
  return class DirectModel extends typeClass {
    constructor({ schema, attrs, id }) {
      super();

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

    get identifier() {
      return new ResourceIdentifier(this.modelName, this._id);
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
      rels.forEach(({name, count, to}) => {
        if (count === 'one') {
          this._defineToOne(name, to);
        } else if (count === 'many') {
          this._defineToMany(name, to);
        }
      });
    }

    _defineToOne(name, toType) {
      Object.defineProperty(this, name, {
        get() {
          let found = this._schema.relationships.getRelated(this.identifier, name);
          if (found) {
            let {type, id} = found;
            let related = this._schema[toCollectionName(type)].find(id);
            wrapBelongsTo(related, {
              from: this.identifier,
              type: toType,
              name: name,
              schema: this._schema
            });
            return related;
          } else {
            return new NullBelongsTo({
              from: this.identifier,
              type: toType,
              name: name,
              schema: this._schema
            });
          }
        },
        set(val) {
          if (isId(val)) {
            let linkage = new ResourceIdentifier(toType, val);
            this._schema.relationships.setOne(this.identifier, name, linkage);
          } else if (!val) {
            this._schema.relationships.unsetOne(this.identifier, name);
          } else {
            this._schema.relationships.setOne(this.identifier, name, val.identifier);
          }
        }
      });
    }

    _defineToMany(name, toType) {
      Object.defineProperty(this, name, {
        get() {
          return new RelatedRecordArray({
            from: this.identifier,
            name: name,
            type: toType,
            schema: this._schema
          });
        },
        set(val) {
          let linkages = val.map(function(modelOrId) {
            if (isId(modelOrId)) {
              return new ResourceIdentifier(toType, modelOrId);
            } else {
              return modelOrId.identifier;
            }
          });
          return this._schema.relationships.setMany(this.identifier, name, linkages);
        }
      });
    }
  };
}


function isId(x) {
  return typeof x === 'string' || typeof x === 'number';
}

function wrapBelongsTo(related, {from, name, type, schema}) {
  related.create = function(attrs) {
    let collectionName = toCollectionName(type);
    let related = schema[collectionName].create(attrs);
    schema.relationships.setOne(from, name, related.identifier);
    return related;
  };
}

class NullBelongsTo {
  constructor({ from, name, type, schema }) {
    this._from = from;
    this._type = type;
    this._name = name;
    this._schema = schema;
  }

  create(attrs) {
    let collectionName = toCollectionName(this._type);
    let related = this._schema[collectionName].create(attrs);
    this._schema.relationships.setOne(this._from, this._name, related.identifier);
    return related;
  }
}

class RelatedRecordArray extends Array {
  constructor({ from, name, type, schema }) {
    super();

    this._from = from;
    this._type = type;
    this._name = name;
    this._schema = schema;

    let relatedCollection = toCollectionName(type);
    let related = schema[relatedCollection].find(this.ids);
    super.push(...related);
  }

  get ids() {
    let linkages = this._schema.relationships.getRelated(this._from, this._name);
    return linkages.map(l => l.id);
  }

  // get identifiers() {
  //   return this._schema.relationships.getRelated(this._from, this._name);
  // }

  push(...vals) {
    let linkages = this._toLinkages(vals);
    this._schema.relationships.pushMany(this._from, this._name, linkages);
  }

  remove(...vals) {
    let linkages = this._toLinkages(vals);
    this._schema.relationships.removeMany(this._from, this._name, linkages);
  }

  create(attrs) {
    let collectionName = toCollectionName(this._type);
    let related = this._schema[collectionName].create(attrs);
    this.push(related);
    return related;
  }

  createList(count, attrs) {
    let result = [];
    for (let i = 0; i < count; i++) {
      result.push(this.create(attrs));
    }
    return result;
  }

  _toLinkages(idsOrModels) {
    return idsOrModels.map((val) => {
      if (isId(val)) {
        return new ResourceIdentifier(this._type, val);
      } else {
        return val.identifier;
      }
    });
  }
}
