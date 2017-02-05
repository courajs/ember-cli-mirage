import { Factory, faker, trait } from 'ember-cli-mirage';
import theStore from '../the-relationship-store';

export default Factory.extend({
  description: faker.lorem.paragraph,
  withDisease: trait({
    afterCreate(doc, server) {
      let d1 = server.create('fact', 'diseaseWithTumors');
      let d2 = server.create('fact', 'diseaseWithTumors');
      theStore.pushMany(doc, 'facts', [d1, d2]);
      let tumorIds = theStore.getRelated(d1, 'parent').map((t) => t.id);
      tumorIds.push(...theStore.getRelated(d2, 'parent').map((t) => t.id));
      let tumors = server.schema.facts.find(tumorIds);
      theStore.pushMany(doc, 'facts', tumors);
    }
  })
});
