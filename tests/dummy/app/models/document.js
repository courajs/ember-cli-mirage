import DS from 'ember-data';

export default DS.Model.extend({
  description: DS.attr('string'),
  patient: DS.belongsTo('patient'),
  facts: DS.hasMany('fact', { inverse: null })
});
