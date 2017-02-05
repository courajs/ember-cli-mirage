import { Factory, trait } from 'ember-cli-mirage';

export default Factory.extend({
  type: 'other',
  diseaseWithTumors: trait({
    type: 'disease',
    afterCreate(disease, server) {
      let tumors = server.createList('fact', 2, { type: 'tumor' });
      server.relationships.pushMany(disease, 'parent', tumors);
      tumors.forEach(function(t) {
        server.relationships.pushMany(t, 'parent', disease);
      });
    }
  })
});
