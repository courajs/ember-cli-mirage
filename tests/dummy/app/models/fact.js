import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr('string'),
  document: DS.belongsTo('document'),
  parent: DS.hasMany('fact', { inverse: null }),
  parentIds: Ember.computed('parent.[]', function() {
    return this.get('parent').mapBy('id');
  })
});
