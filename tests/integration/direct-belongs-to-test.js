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

test("You can get a related record", function(assert) {
  let aaron = this.schema.people.create({name: 'Aaron'});
  let post = this.schema.posts.create({title: 'Introducing Hazy Oasis'});
  this.store.setOne(post, 'author', aaron);

  assert.equal(post.author.name, 'Aaron');
});

test("You can relate records by assigning a model", function(assert) {
  let aaron = this.schema.people.create({name: 'Aaron'});
  let post = this.schema.posts.create({title: 'Introducing Hazy Oasis'});

  post.author = aaron;

  let linkage = this.store.getRelated(post, 'author');

  assert.equal(linkage.type, 'person');
  assert.equal(linkage.id, aaron.id);
});

test("You can relate records by assigning an id", function(assert) {
  let aaron = this.schema.people.create({name: 'Aaron'});
  let post = this.schema.posts.create({title: 'Introducing Hazy Oasis'});

  post.author = aaron.id;

  let linkage = this.store.getRelated(post, 'author');

  assert.equal(linkage.type, 'person');
  assert.equal(linkage.id, aaron.id);
});
