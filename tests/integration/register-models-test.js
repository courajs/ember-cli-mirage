import { module, test } from 'qunit';
import Db from 'ember-cli-mirage/db';
import Model from 'ember-cli-mirage/orm/model';
import { belongsTo, hasMany } from 'ember-cli-mirage';
import RelationshipStore from 'ember-cli-mirage/orm/relationship-store';

import registerModels from 'ember-cli-mirage/orm/register-models';

module("Integration | Model Registry", {
  beforeEach() {
    this.db = new Db();
    this.store = new RelationshipStore();
  }
});

test("It registers modelName on each Model class", function(assert) {
  let models = {
    person: Model.extend()
  };

  registerModels({
    db: this.db,
    store: this.store,
    models
  });

  assert.equal(models.person.modelName, "person");
});

test("It creates a DB collection for each model", function(assert) {
  let models = {
    person: Model.extend()
  };

  registerModels({
    db: this.db,
    store: this.store,
    models
  });

  assert.ok(this.db.people, "It creates a collection");
});

test("It registers relationships specified in model definitions", function(assert) {
  let models = {
    post: Model.extend({
      comments: hasMany('comment')
    }),
    comment: Model.extend({
      post: belongsTo('post')
    })
  };

  registerModels({
    db: this.db,
    store: this.store,
    models
  });

  let postRels = this.store.relationshipsForType('post');
  let commentRels = this.store.relationshipsForType('comment');

  assert.deepEqual(postRels, ['comments'], "It registers hasMany relationships");
  assert.deepEqual(commentRels, ['post'], "It registers belongsTo relationships");
});
