import { toCollectionName } from 'ember-cli-mirage/utils/normalize-name';
import assert from '../assert';

import { DirectInterface } from 'ember-cli-mirage/internal';

/**
 * @class Schema
 * @constructor
 * @public
 */
export default class Schema {

  constructor({db, store, models = {}}) {
    assert(db, 'Pass a Db to Schema');
    assert(store, 'Pass a RelationshipStore to Schema');

    this.db = db;
    this.relationships = store;
    this._createInterfaces(models);
  }

  _createInterfaces(models) {
    for (let type in models) {
      this[toCollectionName(type)] = new DirectInterface({
        schema: this,
        type: type
      });
    }
  }
}
