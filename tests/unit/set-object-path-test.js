import { module, test } from 'qunit';

import { setObjectPath } from 'ember-cli-mirage/utils';

module('Unit | m-serializers | Initializing object paths');

test('It initializes a path to a value', function(assert) {
  let result = {};
  setObjectPath(result, 'foo', 'bar', []);

  let expected = { foo: { bar: [] } };

  assert.deepEqual(result, expected);
});

test("It merges the new path with existing properties", function(assert) {
  let result = { foo: { baz: 32 } };
  setObjectPath(result, 'foo', 'bar', []);

  let expected = { foo: { baz: 32, bar: [] } };

  assert.deepEqual(result, expected);
});

test("It complains if you try to path into a non-object", function(assert) {
  assert.throws(function() {
    let obj = { foo: 42 };
    setObjectPath(obj, 'foo', 'bar', []);
  }, new Error('Path "foo.bar" cannot be set on the object, because path "foo" is a non-object (it is 42)'));

  assert.throws(function() {
    let obj = { foo: "hello" };
    setObjectPath(obj, 'foo', 'bar', []);
  }, new Error('Path "foo.bar" cannot be set on the object, because path "foo" is a non-object (it is "hello")'));

  assert.throws(function() {
    let obj = { foo: null };
    setObjectPath(obj, 'foo', 'bar', []);
  }, new Error('Path "foo.bar" cannot be set on the object, because path "foo" is a non-object (it is null)'));
});
