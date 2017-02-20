import { module, test } from 'qunit';
import { Model } from 'ember-cli-mirage';
import {
  Db,
  RelationshipStore,
  DirectModel,
  Schema,
  registerModels
} from 'ember-cli-mirage/internal';

module("Integration | DirectModel | Attributes", {
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

test("attrs is populated from the db", function(assert) {
  this.db.people.insert({id: '1', name: 'Aaron'});

  let aaron = new DirectModel({
    schema: this.schema,
    type: 'person',
    id: '1'
  });

  assert.deepEqual(aaron.attrs, {id: '1', name: 'Aaron'});
});

test("Each attr is populated from the db", function(assert) {
  this.db.people.insert({id: '1', name: 'Aaron'});

  let aaron = new DirectModel({
    schema: this.schema,
    type: 'person',
    id: '1'
  });

  assert.equal(aaron.name, 'Aaron');
});

test("Attribute changes are reflected in the database", function(assert) {
  this.db.people.insert({id: '1', name: 'Aaron'});

  let aaron = new DirectModel({
    schema: this.schema,
    type: 'person',
    id: '1'
  });

  aaron.name = 'A-ron';

  assert.deepEqual(this.db.people.find('1'), { id: '1', name: 'A-ron'});
});

test("A new model can be created from attributes", function(assert) {
  let aaron = new DirectModel({
    schema: this.schema,
    type: 'person',
    attrs: {
      name: 'Aaron'
    }
  });

  assert.equal(aaron.id, '1');
  assert.equal(aaron.name, 'Aaron');
  assert.deepEqual(
      this.db.people.find('1'),
      { id: '1', name: 'Aaron' }
  );
});
