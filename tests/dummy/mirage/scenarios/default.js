export default function(server) {

  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.

    Make sure to define a factory for each model you want to create.
  */

  server.relationships.defineOne('document', 'patient', 'patient');
  server.relationships.defineMany('document', 'facts', 'fact');
  server.relationships.defineOne('fact', 'document', 'document');
  server.relationships.defineMany('fact', 'parent', 'fact');

  let p = server.create('patient');
  let d = server.create('document', 'withDisease');

  server.relationships.defineOne('document', 'patient', 'patient');
  server.relationships.setOne(d, 'patient', p);
}
