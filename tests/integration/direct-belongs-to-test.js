import { module, test } from 'qunit';
import {
  Model,
  belongsTo
} from 'ember-cli-mirage';
import {
  Db,
  RelationshipStore,
  DirectModel,
  Schema,
  registerModels
} from 'ember-cli-mirage/internal';

module("Integration | DirectModel | BelongsTo relationships", {
  beforeEach() {
    this.db = new Db();
    this.store = new RelationshipStore();

    this.Post = Model.extend({
      author: belongsTo('person')
    });
    this.Person = Model.extend({});

    this.models = {
      post: this.Post,
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

// test("You can get a related record", function(assert) {
//   let aaron = new DirectModel({
//     schema: this.schema,
//     type: 'person',
//     attrs: { name: 'Aaron' }
//   });
//   let post = new DirectModel({
//     schema: this.schema,
//     type: 'post',
//     attrs: { title: 'Introducing Hazy Oasis' }
//   });
//   this.store.setOne(post, 'author', aaron);
//
//   assert.equal(post.author.attrs, {id: '1', name: 'Aaron'});
// });
