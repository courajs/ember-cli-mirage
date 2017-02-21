import { module, test } from 'qunit';
import {
  Model,
  hasMany
} from 'ember-cli-mirage';
import {
  Db,
  RelationshipStore,
  Schema,
  registerModels
} from 'ember-cli-mirage/internal';

module("Integration | DirectModel | HasMany relationships", {
  beforeEach() {
    this.db = new Db();
    this.store = new RelationshipStore();

    this.models = {
      comment: Model.extend(),
      post: Model.extend({
        comments: hasMany('person')
      })
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

test("You get an empty array if there are no associated records", function(assert) {
  let post = this.schema.posts.create({title: 'I wrote this'});

  assert.ok(post.comments instanceof Array);
  assert.equal(post.comments.length, 0);
});
