import { module, test } from 'qunit';
import { RelationshipStore } from 'ember-cli-mirage/internal';

import fakeModel from './fake-model';

module('Unit | RelationshipStore', {
  beforeEach() {
    this.store = new RelationshipStore();
  }
});

let a = fakeModel('thing', 'a', { hey: 'there' });
let b = fakeModel('other', 'b', { some: 'info' });
let c = fakeModel('other', 'c', { some: 'other info' });


test('relationships must be defined before they can be get or set', function(assert) {
  assert.throws(() => {
    this.store.getRelated(a, 'nope');
  }, /Relationship "nope" has not been defined for things/);

  assert.throws(() => {
    this.store.setOne(a, 'nope', b);
  }, /Relationship "nope" has not been defined for things/);

  assert.throws(() => {
    this.store.setMany(a, 'nope', [b]);
  }, /Relationship "nope" has not been defined for things/);

  assert.throws(() => {
    this.store.pushMany(a, 'nope', b);
  }, /Relationship "nope" has not been defined for things/);
});


test("relationshipsForType() returns a list of relationship definitions", function(assert) {
  this.store.defineOne('thing', 'author', 'other');
  this.store.defineMany('thing', 'comments', 'other');

  let result = this.store.relationshipsForType('thing');

  assert.deepEqual(result, [
    {
      from: 'thing',
      to: 'other',
      count: 'one',
      name: 'author'
    },
    {
      from: 'thing',
      to: 'other',
      count: 'many',
      name: 'comments'
    }
  ]);
});


test('getRelated() returns null or [] for empty relationships', function(assert) {
  this.store.defineOne('thing', 'author', 'other');
  this.store.defineMany('thing', 'comments', 'other');

  let emptyOne = this.store.getRelated(a, 'author');
  let emptyMany = this.store.getRelated(a, 'comments');

  assert.equal(emptyOne, null);
  assert.deepEqual(emptyMany, []);
});


test("Throws an error when using a setter of the wrong count", function(assert) {
  this.store.defineOne('thing', 'author', 'other');
  this.store.defineMany('thing', 'comments', 'other');

  assert.throws(() => {
    this.store.setMany(a, 'author', [b]);
  }, /Thing\.author is a to-one relationship, not a to-many./);

  assert.throws(() => {
    this.store.setOne(a, 'comments', b);
  }, /Thing\.comments is a to-many relationship, not a to-one./);
});


test("Throws an error when setting a to-one relationship to the wrong type", function(assert) {
  this.store.defineOne('thing', 'author', 'other');
  assert.throws(function() {
    this.store.setOne(a, 'author', a);
  }, new Error('A Thing\'s author must be set to an Other. You tried to set it to a Thing (id: "a")'));
});


test("Throws an error when setting a setting a to-many with any model of the wrong type", function(assert) {
  this.store.defineMany('thing', 'comments', 'other');
  assert.throws(function() {
    this.store.setMany(a, 'comments', [b, a]);
  }, new Error('A Thing\'s comments must consist of Others. You tried to add a Thing (id: "a")'));
});


test("Returns a resource identifier object for set to-one relationships", function(assert) {
  this.store.defineOne('thing', 'author', 'other');
  this.store.setOne(a, 'author', b);

  let related = this.store.getRelated(a, 'author');
  assert.deepEqual(related, { type: 'other', id: 'b' });
});


test("Returns resource identifiers for set to-many relationships", function(assert) {
  this.store.defineMany('thing', 'comments', 'other');
  this.store.setMany(a, 'comments', [b, c]);

  let related = this.store.getRelated(a, 'comments');
  let expected = [
    { type: 'other', id: 'b' },
    { type: 'other', id: 'c' }
  ];
  assert.deepEqual(related, expected);
});


test("You can push single items into to-many relationships", function(assert) {
  this.store.defineMany('thing', 'comments', 'other');
  this.store.setMany(a, 'comments', [b]);
  this.store.pushMany(a, 'comments', c);

  let related = this.store.getRelated(a, 'comments');
  let expected = [
    { type: 'other', id: 'b' },
    { type: 'other', id: 'c' }
  ];
  assert.deepEqual(related, expected);
});


test("You can push multiple items into to-many relationships", function(assert) {
  this.store.defineMany('thing', 'comments', 'other');
  this.store.pushMany(a, 'comments', [b, c]);

  let related = this.store.getRelated(a, 'comments');
  let expected = [
    { type: 'other', id: 'b' },
    { type: 'other', id: 'c' }
  ];
  assert.deepEqual(related, expected);
});


test("You can remove single items from to-many relationships", function(assert) {
  this.store.defineMany('thing', 'comments', 'other');
  this.store.setMany(a, 'comments', [b, c]);
  this.store.removeMany(a, 'comments', c);

  let related = this.store.getRelated(a, 'comments');
  let expected = [
    { type: 'other', id: 'b' }
  ];
  assert.deepEqual(related, expected);
});


test("You can remove multiple items from to-many relationships", function(assert) {
  this.store.defineMany('thing', 'comments', 'other');
  this.store.setMany(a, 'comments', [b, c]);
  this.store.removeMany(a, 'comments', [b, c]);

  let related = this.store.getRelated(a, 'comments');
  let expected = [];
  assert.deepEqual(related, expected);
});
