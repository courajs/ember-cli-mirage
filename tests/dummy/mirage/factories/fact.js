import { Factory, trait } from 'ember-cli-mirage';
import theStore from '../the-relationship-store';

export default Factory.extend({
  type: 'other',
  diseaseWithTumors: trait({
    type: 'disease',
    afterCreate(disease, server) {
      let tumors = server.createList('fact', 2, { type: 'tumor' });
      theStore.pushMany(disease, 'parent', tumors);
      tumors.forEach(function(t) {
        theStore.pushMany(t, 'parent', disease);
      });
    }
  })
});
