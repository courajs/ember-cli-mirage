import { toCollectionName, toModelName } from '../utils/normalize-name';
import Association from './associations/association';
import HasMany from './associations/has-many';
import BelongsTo from './associations/belongs-to';

export default function({ db, models, store }) {
  for (let modelName in models) {
    let ModelClass = models[modelName];

    // Create a collection in the db for attribute storage
    db.createCollection(toCollectionName(modelName));

    // The models are anonymous default exports, so we have to set the names
    ModelClass.modelName = modelName;

    // Register all associations in the relationship store
    for (let associationProperty in ModelClass.prototype) {
      if (ModelClass.prototype[associationProperty] instanceof Association) {
        let association = ModelClass.prototype[associationProperty];

        let from  = modelName;
        let key = associationProperty;
        let to = association.modelName || toModelName(associationProperty);

        if (association instanceof HasMany) {
          store.defineMany(from, key, to);
        } else if (association instanceof BelongsTo) {
          store.defineOne(from, key, to);
        }
      }
    }
  }
}
