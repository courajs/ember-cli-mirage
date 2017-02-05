import { Factory, faker, trait } from 'ember-cli-mirage';

export default Factory.extend({
  description: faker.lorem.paragraph,
  withDisease: trait({
    afterCreate(doc, server) {
      let d1 = server.create('fact', 'diseaseWithTumors');
      let d2 = server.create('fact', 'diseaseWithTumors');
      server.relationships.pushMany(doc, 'facts', [d1, d2]);
      let tumorIds = server.relationships.getRelated(d1, 'parent').map((t) => t.id);
      tumorIds.push(...server.relationships.getRelated(d2, 'parent').map((t) => t.id));
      let tumors = server.schema.facts.find(tumorIds);
      server.relationships.pushMany(doc, 'facts', tumors);
    }
  })
});
