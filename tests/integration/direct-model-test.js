import { module, test } from 'qunit';
import { Model } from 'ember-cli-mirage';
import {
  Db,
  RelationshipStore,
  DirectModel,
  Schema,
  registerModels
} from 'ember-cli-mirage/internal';

module("Integration | DirectModel", {
  beforeEach() {
    this.db = new Db();
    this.store = new RelationshipStore();
    this.Person = Model.extend();
    this.models = {
      person: this.Person
    };

    registerModels({
      db: this.db,
      store: this.store,
      models: this.models
    });

    this.schema = new Schema({
      db: this.db,
      store: this.store,
      models: this.models
    });
  }
});

test("A DirectModel gets attributes from the database", function(assert) {
  this.db.people.insert({id: '1', name: 'Aaron'});

  let aaron = new DirectModel({
    schema: this.schema,
    type: 'person',
    id: '1'
  });

  assert.deepEqual(aaron.attrs, {id: '1', name: 'Aaron'});
});

test("A DirectModel has properties for each attribute", function(assert) {
  this.db.people.insert({id: '1', name: 'Aaron'});

  let aaron = new DirectModel({
    schema: this.schema,
    type: 'person',
    id: '1'
  });

  assert.equal(aaron.name, 'Aaron');
});
