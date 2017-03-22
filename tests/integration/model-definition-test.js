import { module, test } from 'qunit';
import {
  Model,
  belongsTo
} from 'ember-cli-mirage';

import {
  Db,
  RelationshipStore,
  Schema,
  registerModels
} from 'ember-cli-mirage/internal';


module("Integration | Model Definitions");


test("Model can be extended", function(assert) {
  let Post = Model.extend({
    author: belongsTo()
  });

  assert.ok(Post.prototype instanceof Model);
});

test("DirectModels from a schema inherit from the model definition", function(assert) {
  let Post = Model.extend({});

  let db = new Db();
  let store = new RelationshipStore();
  let models = { post: Post };

  registerModels({ db, store, models });
  let schema = new Schema({ db, store, models });

  let post = schema.posts.create({});

  assert.ok(post instanceof Model, "DirectModels are Models");
  assert.ok(post instanceof Post, "DirectModels inherit from the model definition");
});

