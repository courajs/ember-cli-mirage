import { Model, hasMany, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  patient: belongsTo('patient'),
  facts: hasMany('fact')
});
