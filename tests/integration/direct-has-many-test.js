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

    this.post = this.schema.posts.create({title: "I wrote this"});
    this.comments = [
      this.schema.comments.create({id: 'a', body: "Nice post!"}),
      this.schema.comments.create({id: 'b', body: "Actually, this is factually innacurate."})
    ];
    this.commentA = this.comments[0];
    this.commentB = this.comments[1];
  }
});

test("You get an empty array if there are no associated records", function(assert) {
  assert.ok(this.post.comments instanceof Array);
  assert.equal(this.post.comments.length, 0);
});

test("You get an array of related records", function(assert) {
  this.store.setMany(this.post, 'comments', this.comments);

  assert.equal(this.post.comments.length, 2);
  let commentBodies = this.post.comments.map(comment => comment.body);
  assert.deepEqual(commentBodies, ["Nice post!", "Actually, this is factually innacurate."]);
});

test("The related array has an ids property", function(assert) {
  this.store.setMany(this.post, 'comments', this.comments);

  assert.deepEqual(this.post.comments.ids, ['a', 'b']);
});

test("You can set an array of related records", function(assert) {
  this.post.comments = this.comments;

  assert.deepEqual(this.post.comments.ids, ['a', 'b']);
});

test("You can set an array of related record ids", function(assert) {
  this.post.comments = ['a', 'b'];

  assert.deepEqual(this.post.comments.ids, ['a', 'b']);
});

test("You can push a model into a relationship", function(assert) {
  this.post.comments = [this.comments[0]];

  assert.deepEqual(this.post.comments.ids, ['a']);

  this.post.comments.push(this.comments[1]);

  assert.deepEqual(this.post.comments.ids, ['a', 'b']);
});

test("You can push an id into a relationship", function(assert) {
  this.post.comments = [this.commentA];

  assert.deepEqual(this.post.comments.ids, ['a']);

  this.post.comments.push('b');

  assert.deepEqual(this.post.comments.ids, ['a', 'b']);
});
