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
  let commentIds = this.post.comments.map(comment => comment.id);
  assert.deepEqual(commentIds, ['a', 'b']);
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
  this.post.comments = [this.commentA];
  assert.deepEqual(this.post.comments.ids, ['a']);
  this.post.comments.push(this.commentB);
  assert.deepEqual(this.post.comments.ids, ['a', 'b']);
});

test("You can push an id into a relationship", function(assert) {
  this.post.comments = [this.commentA];
  assert.deepEqual(this.post.comments.ids, ['a']);
  this.post.comments.push('b');
  assert.deepEqual(this.post.comments.ids, ['a', 'b']);
});

test("You can remove a model from a relationship", function(assert) {
  this.post.comments = this.comments;
  this.post.comments.remove(this.commentA);
  assert.deepEqual(this.post.comments.ids, ['b']);
});

test("You can remove a model from a relationship via id", function(assert) {
  this.post.comments = this.comments;
  this.post.comments.remove('a');
  assert.deepEqual(this.post.comments.ids, ['b']);
});

test("You can create one entry in a to-many relationship", function(assert) {
  let body = "thanks for this great article";
  this.post.comments.create({body});
  assert.equal(this.post.comments.length, 1);
  assert.equal(this.post.comments[0].body, body);
});

test("You can create one entry in a to-many relationship", function(assert) {
  let body = "thanks for this great article";
  let comment = this.post.comments.create({body});
  assert.equal(comment.body, body);
  assert.equal(this.post.comments.length, 1);
  assert.equal(this.post.comments[0].body, body);
});

test("You can create many entries in a to-many relationship", function(assert) {
  let body = "buy my product bit.ly/scam";
  let comments = this.post.comments.createList(2, {body});
  assert.equal(comments.length, 2);
  assert.equal(comments[1].body, body);
  assert.equal(this.post.comments.length, 2);
  assert.equal(this.post.comments[1].body, body);
});
