import { pluralize, capitalize } from '../utils/inflector';
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

  getRelated(from, relationshipName) {
    this.checkHasRelationship(from, relationshipName);

    let type = from.type;
    let id = from.id;

    let related = this._rels[type] && this._rels[type][id] && this._rels[type][id][relationshipName];
    return related || this.getEmptyForRelationship(from, relationshipName);
  }

  setOne(from, relationshipName, to) {
    this.checkOne(from, relationshipName, to);
    this.setRelationship(from, relationshipName, to);
  }

  unsetOne(from, relationshipName) {
    let { type, id } = from;

    if (this._rels[type] && this._rels[type][id]) {
      delete this._rels[type][id][relationshipName];
    }
  }

  setMany(from, relationshipName, to) {
    this.checkMany(from, relationshipName, to);
    this.setRelationship(from, relationshipName, to);
  }

  pushMany(from, relationshipName, to) {
    let tos = arrayify(to);
    this.checkMany(from, relationshipName, tos);
    let existing = this.getRelated(from, relationshipName);
    this.setRelationship(from, relationshipName, existing.concat(tos));
  }

  removeMany(from, relationshipName, _to) {
    let tos = arrayify(_to);
    let existing = this.getRelated(from, relationshipName);
    let newLinkages = existing.filter(function(other) {
      return !tos.some(function(to) {
        return to.is(other);
      });
    });
    this.setRelationship(from, relationshipName, newLinkages);
  }

  checkOne(from, relName, to) {
    assertIdentifier(from);
    assertIdentifier(to);
    let rel = this.getRelationship(from, relName);

    if (rel.count === 'many') {
      let type = capitalize(from.type);
      let message = `${type}.${relName} is a to-many relationship, not a to-one.`;
      throw new Error(message);
    }

    if (rel.to !== to.type) {
      let fromType = capitalize(from.type);
      let toType = capitalize(to.type);
      let properType = capitalize(rel.to);

      let toArticle = articleFor(toType);
      let properArticle = articleFor(properType);

      let toId = JSON.stringify(to.id);

      let message = `A ${fromType}'s ${relName} must be set to ${properArticle} ${properType}. You tried to set it to ${toArticle} ${toType} (id: ${toId})`;
      throw new Error(message);
    }
  }

  checkMany(from, relName, to) {
    assertIdentifier(from);
    to.forEach(assertIdentifier);
    let rel = this.getRelationship(from, relName);

    if (rel.count === 'one') {
      let type = capitalize(from.type);
      let message = `${type}.${relName} is a to-one relationship, not a to-many.`;
      throw new Error(message);
    }

    for (let target of to) {
      if (target.type !== rel.to) {
        let fromType = capitalize(from.type);
        let properTypes = capitalize(pluralize(rel.to));
        let toType = capitalize(target.type);
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
    let type = from.type;
    let rel = this._definedRels[type] && this._definedRels[type][relName];

    if (!rel) {
      this.throwUndefinedRelationshipError(relName, type);
    }

    return rel;
  }

  getEmptyForRelationship(from, relName) {
    let count = this._definedRels[from.type][relName].count;
    if (count === 'many') {
      return [];
    } else {
      return null;
    }
  }

  setRelationship(from, relName, value) {
    setObjectPath(this._rels, from.type, from.id, relName, value);
  }

  throwUndefinedRelationshipError(relName, fromType) {
    throw new Error(`Relationship "${relName}" has not been defined for ${pluralize(fromType)}`);
  }
}

const VOWELS = ['A', 'E', 'I', 'O', 'U']; // And sometimes Y, but not at the start of a word

function vowel(char) {
  return VOWELS.includes(char);
}

function articleFor(word) {
  return vowel(word[0]) ? 'an' : 'a';
}

export class ResourceIdentifier {
  constructor(type, id) {
    this.type = type;
    this.id = id;
  }

  is(props) {
    return this.type === props.type && this.id === props.id;
  }
}

function assertIdentifier(x) {
  if (!(x instanceof ResourceIdentifier)) {
    throw new Error('Relationships must be set using ResourceIdentifiers');
  }
}

function arrayify(x) {
  if (Array.isArray(x)) {
    return x;
  } else {
    return [x];
  }
}
