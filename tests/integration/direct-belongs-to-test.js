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

    this.models = {
      person: Model.extend({}),
      post: Model.extend({
        author: belongsTo('person')
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

test("You can create an initial relation", function(assert) {
  let post = this.schema.posts.create({title: 'Introducing Hazy Oasis'});

  let returnedAaron = post.author.create({ name: 'Aaron' });
  let relatedAaron = post.author;
  let foundAaron = this.schema.people.find('1');
  let expectedAttrs = {
    id: '1',
    name: 'Aaron'
  };

  assert.deepEqual(returnedAaron.attrs, expectedAttrs);
  assert.deepEqual(relatedAaron.attrs, expectedAttrs);
  assert.deepEqual(foundAaron.attrs, expectedAttrs);
});

test("You can delete a relationship", function(assert) {
  let post = this.schema.posts.create({title: 'Introducing Hazy Oasis'});
  post.author.create({ name: 'Aaron' });

  let linkage = this.schema.relationships.getRelated(post, 'author');
  assert.deepEqual(linkage, { type: 'person', id: '1' });

  post.author = null;

  linkage = this.schema.relationships.getRelated(post, 'author');
  assert.equal(linkage, null);
});
