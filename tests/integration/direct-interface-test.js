import { module, test } from 'qunit';
import { Model } from 'ember-cli-mirage';
import {
  Db,
  RelationshipStore,
  DirectModel,
  DirectInterface,
  Schema,
  registerModels
} from 'ember-cli-mirage/internal';

module("Integration | DirectInterface", {
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

    this.interface = new DirectInterface({
      schema: this.schema,
      type: 'person'
    });
  }
});

test(".find() finds a DirectModel", function(assert) {
  let {id} = this.db.people.insert({name: 'Aaron'});

  let aaron = this.interface.find(id);

  assert.equal(aaron.name, 'Aaron', "It finds and populates the model");
});

test(".all() returns DirectModels", function(assert) {
  this.db.people.insert({name: 'Aaron'});

  let [aaron] = this.interface.all();

  assert.ok(aaron instanceof DirectModel, "All returns DirectModels");
  assert.equal(aaron.name, 'Aaron', "The models are correctly created");
});

test("A new model can be created from attributes", function(assert) {
  let aaron = this.interface.create({ name: 'Aaron' });

  assert.equal(aaron.id, '1');
  assert.equal(aaron.name, 'Aaron');
  assert.deepEqual(
      this.db.people.find('1'),
      { id: '1', name: 'Aaron' }
  );
});
