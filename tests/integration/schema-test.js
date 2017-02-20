import { module, test } from 'qunit';
import { Model } from 'ember-cli-mirage';
import {
  Db,
  RelationshipStore,
  Schema,
  DirectInterface
} from 'ember-cli-mirage/internal';

module("Integration | Schema", {
  beforeEach() {
    this.db = new Db();
    this.store = new RelationshipStore();
  }
});

test("It creates a DirectInterface for each model type", function(assert) {
  let schema = new Schema({
    db: this.db,
    store: this.store,
    models: {
      person: Model.extend()
    }
  });

  assert.ok(schema.people instanceof DirectInterface, "It creates a DirectInterface");
  assert.equal(schema.people.type, 'person', "It creates an interface of the proper type");
});
