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
        comments: hasMany('comment')
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

test("You get an array of related records", function(assert) {
  let post = this.schema.posts.create({title: "I'm still writing"});
  let comments = [
    this.schema.comments.create({body: "Nice post!"}),
    this.schema.comments.create({body: "Actually, this is factually innacurate."})
  ];

  this.store.setMany(post, 'comments', comments);

  assert.equal(post.comments.length, 2);
  let commentBodies = post.comments.map(comment => comment.body);
  assert.deepEqual(commentBodies, ["Nice post!", "Actually, this is factually innacurate."]);
});

test("The related array has an ids property", function(assert) {
  let post = this.schema.posts.create({});
  let comments = [
    this.schema.comments.create({id: '4'}),
    this.schema.comments.create({id: 'abc'})
  ];

  this.store.setMany(post, 'comments', comments);

  assert.deepEqual(post.comments.ids, ['4', 'abc']);
});

test("You can set an array of related records", function(assert) {
  let post = this.schema.posts.create({});

  let comments = [
    this.schema.comments.create({id: '4'}),
    this.schema.comments.create({id: 'abc'})
  ];

  post.comments = comments;

  assert.deepEqual(post.comments.ids, ['4', 'abc']);
});

test("You can set an array of related record ids", function(assert) {
  let post = this.schema.posts.create({});

  this.schema.comments.create({id: '4'});
  this.schema.comments.create({id: 'abc'});

  post.comments = ['4', 'abc'];

  assert.deepEqual(post.comments.ids, ['4', 'abc']);
});

test("You can push a model into a relationship", function(assert) {
  let post = this.schema.posts.create({});

  let a = this.schema.comments.create({id: '4'});
  let b = this.schema.comments.create({id: 'abc'});

  post.comments = [a];

  assert.deepEqual(post.comments.ids, ['4']);

  post.comments.push(b);

  assert.deepEqual(post.comments.ids, ['4', 'abc']);
});

test("You can push an id into a relationship", function(assert) {
  let post = this.schema.posts.create({});

  let a = this.schema.comments.create({id: '4'});
  this.schema.comments.create({id: 'abc'});

  post.comments = [a];

  assert.deepEqual(post.comments.ids, ['4']);

  post.comments.push('abc');

  assert.deepEqual(post.comments.ids, ['4', 'abc']);
});
