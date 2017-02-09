export default function(server) {

  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.

    Make sure to define a factory for each model you want to create.
  */

  let p = server.create('patient');
  let d = server.create('document', 'withDisease');

  server.relationships.setOne(d, 'patient', p);
}
