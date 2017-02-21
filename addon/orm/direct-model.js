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
        let found = this._schema.relationships.getRelated(this, name);
        if (found) {
          let {type, id} = found;
          return this._schema[toCollectionName(type)].find(id);
        } else {
          return new NullBelongsTo({
            from: this,
            type: toType,
            name: name,
            schema: this._schema
          });
        }
      },
      set(val) {
        if (isId(val)) {
          let linkage = {
            modelName: toType,
            id: val
          };
          this._schema.relationships.setOne(this, name, linkage);
        } else if (!val) {
          this._schema.relationships.unsetOne(this, name);
        } else {
          this._schema.relationships.setOne(this, name, val);
        }
      }
    });
  }

  _defineToMany(name, toType) {
    Object.defineProperty(this, name, {
      get() {
        return new RelatedRecordArray({
          from: this,
          name: name,
          type: toType,
          schema: this._schema
        });
      }
    });
  }
}

function isId(x) {
  return typeof x === 'string' || typeof x === 'number';
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
    this._schema.relationships.setOne(this._from, this._name, related);
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
    this.push(...related);
  }

  get ids() {
    let linkages = this._schema.relationships.getRelated(this._from, this._name);
    return linkages.map(l => l.id);
  }
}
