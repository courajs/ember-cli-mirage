import { pluralize, capitalize } from '../utils/inflector';
import { Collection } from 'ember-cli-mirage';
import setObjectPath from '../utils/set-object-path';

export default class RelationshipStore {
  constructor() {
    this._definedRels = {};
    this._rels = {};
  }

  //
  // Relationship definition
  //

  defineOne(fromType, relationshipName, toType) {
    setObjectPath(this._definedRels, fromType, relationshipName, {
      from: fromType,
      to: toType,
      count: 'one',
      name: relationshipName
    });
  }

  defineMany(fromType, relationshipName, toType) {
    setObjectPath(this._definedRels, fromType, relationshipName, {
      from: fromType,
      to: toType,
      count: 'many',
      name: relationshipName
    });
  }

  relationshipsForType(type) {
    let relHash = this._definedRels[type] || {};
    return Object.values(relHash);
  }

  //
  // Relationship use
  //

  getRelated(model, relationshipName) {
    this.checkHasRelationship(model, relationshipName);

    let type = model.modelName;
    let id = model.id;

    let defaultValue = this.getEmptyForRelationship(model, relationshipName);
    return (this._rels[type] && this._rels[type][id] && this._rels[type][id][relationshipName]) || defaultValue;
  }

  setOne(from, relationshipName, to) {
    this.checkOne(from, relationshipName, to);
    let linkage = this.linkageForModel(to);
    this.setRelationship(from, relationshipName, linkage);
  }

  unsetOne(model, relationshipName) {
    let {
      id,
      modelName: type
    } = model;

    if (this._rels[type] && this._rels[type][id]) {
      delete this._rels[type][id][relationshipName];
    }
  }

  setMany(from, relationshipName, to) {
    this.checkMany(from, relationshipName, to);
    let linkages = to.map(this.linkageForModel);
    this.setRelationship(from, relationshipName, linkages);
  }

  pushMany(from, relationshipName, to) {
    let tos;
    if (Array.isArray(to)) {
      tos = to;
    } else if (to instanceof Collection) {
      tos = to.models;
    } else {
      tos = [to];
    }
    this.checkMany(from, relationshipName, tos);
    let existing = this.getRelated(from, relationshipName);
    let newLinkages = tos.map(this.linkageForModel);
    this.setRelationship(from, relationshipName, existing.concat(newLinkages));
  }

  linkageForModel(model) {
    return {
      type: model.modelName,
      id: model.id
    };
  }

  checkOne(from, relName, to) {
    let rel = this.getRelationship(from, relName);

    if (rel.count === 'many') {
      let type = capitalize(from.modelName);
      let message = `${type}.${relName} is a to-many relationship, not a to-one.`;
      throw new Error(message);
    }

    if (rel.to !== to.modelName) {
      let fromType = capitalize(from.modelName);
      let toType = capitalize(to.modelName);
      let properType = capitalize(rel.to);

      let toArticle = articleFor(toType);
      let properArticle = articleFor(properType);

      let toId = JSON.stringify(to.id);

      let message = `A ${fromType}'s ${relName} must be set to ${properArticle} ${properType}. You tried to set it to ${toArticle} ${toType} (id: ${toId})`;
      throw new Error(message);
    }
  }

  checkMany(from, relName, to) {
    let rel = this.getRelationship(from, relName);

    if (rel.count === 'one') {
      let type = capitalize(from.modelName);
      let message = `${type}.${relName} is a to-one relationship, not a to-many.`;
      throw new Error(message);
    }

    for (let target of to) {
      if (target.modelName !== rel.to) {
        let fromType = capitalize(from.modelName);
        let properTypes = capitalize(pluralize(rel.to));
        let toType = capitalize(target.modelName);
        let toId = JSON.stringify(target.id);

        let message = `A ${fromType}'s ${relName} must consist of ${properTypes}. You tried to add a ${toType} (id: ${toId})`;
        throw new Error(message);
      }
    }
  }

  checkHasRelationship(from, relName) {
    this.getRelationship(from, relName);
  }

  getRelationship(from, relName) {
    let type = from.modelName;
    let rel = this._definedRels[type] && this._definedRels[type][relName];

    if (!rel) {
      this.throwUndefinedRelationshipError(relName, from.modelName);
    }

    return rel;
  }

  getEmptyForRelationship(model, relName) {
    let type = model.modelName;
    let count = this._definedRels[type][relName].count;
    if (count === 'many') {
      return [];
    } else {
      return null;
    }
  }

  setRelationship(model, relName, value) {
    let type = model.modelName;
    let id = model.id;
    setObjectPath(this._rels, type, id, relName, value);
  }

  throwUndefinedRelationshipError(relName, modelName) {
    let modelType = pluralize(modelName);
    let message = `Relationship "${relName}" has not been defined for ${modelType}`;
    throw new Error(message);
  }
}

const VOWELS = ['A', 'E', 'I', 'O', 'U']; // And sometimes Y, but not at the start of a word

function vowel(char) {
  return VOWELS.includes(char);
}

function articleFor(word) {
  return vowel(word[0]) ? 'an' : 'a';
}
