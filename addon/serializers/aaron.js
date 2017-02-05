import Ember from 'ember';
import { Collection } from 'ember-cli-mirage';
import _ from 'lodash';

export default Ember.Object.extend({
  init() {
    this._super(...arguments);
    if (!this.get('store')) {
      throw new Error('This Serializer requires a RelationshipStore');
    }
  },

  serializeResponse(modelOrCollection) {
    if (this.isCollection(modelOrCollection)) {
      let models = this.getModels(modelOrCollection);
      return {
        data: models.map(this.serializeResource.bind(this))
      };
    } else {
      return {
        data: this.serializeResource(modelOrCollection)
      };
    }
  },

  isCollection(modelOrCollection) {
    return modelOrCollection instanceof Collection || Array.isArray(modelOrCollection);
  },

  getModels(collection) {
    if (collection instanceof Collection) {
      return collection.models;
    } else {
      return collection;
    }
  },

  serializeResource(model) {
    return {
      id: model.id,
      type: model.modelName,
      attributes: this.serializeAttributes(model),
      relationships: this.serializeRelationships(model)
    };
  },

  serializeAttributes(model) {
    return _.omit(model.attrs, 'id');
  },

  serializeRelationships(model) {
    let store = this.get('store');
    let relNames = store.relationshipsForType(model.modelName);
    let result = {};
    for (let relName of relNames) {
      result[relName] = {
        data: store.getRelated(model, relName)
      };
    }
    return result;
  }
});
