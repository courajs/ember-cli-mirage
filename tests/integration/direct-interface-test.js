import { module, test } from 'qunit';
import { Model } from 'ember-cli-mirage';
import {
  Db,
  RelationshipStore,
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
      typeName: 'person',
      typeDefinition: this.Person
    });
  }
});

test(".find() finds a DirectModel", function(assert) {
  let {id} = this.db.people.insert({name: 'Aaron'});

  let aaron = this.interface.find(id);

  assert.equal(aaron.name, 'Aaron', "It finds and populates the model");
});

test(".find() can find multiple models", function(assert) {
  let [me, you] = this.db.people.insert([{name: 'me'}, {name: 'you'}]);

  let names = this.interface.find(me.id, you.id).map(p => p.name);
  assert.deepEqual(names, ['me', 'you'], "Find works with multiple arguments");

  names = this.interface.find([me.id, you.id]).map(p => p.name);
  assert.deepEqual(names, ['me', 'you'], "Find works with an array argument");
});

test(".all() returns DirectModels", function(assert) {
  this.db.people.insert({name: 'Aaron'});

  let [aaron] = this.interface.all();

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

test("A list of models can be created from attributes", function(assert) {
  let [a, b] = this.interface.createList(2, { employed: true });

  assert.equal(a.id, '1');
  assert.equal(b.id, '2');
  assert.equal(b.employed, true);
  assert.equal(b.modelName, 'person');

  assert.deepEqual(
    this.db.people,
    [{id: '1', employed: true}, {id: '2', employed: true}]
  );
});
