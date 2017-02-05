import theStore from '../the-relationship-store';

export default function(server) {

  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.

    Make sure to define a factory for each model you want to create.
  */

  theStore.defineOne('document', 'patient', 'patient');
  theStore.defineMany('document', 'facts', 'fact');
  theStore.defineOne('fact', 'document', 'document');
  theStore.defineMany('fact', 'parent', 'fact');

  let p = server.create('patient');
  let d = server.create('document', 'withDisease');

  theStore.defineOne('document', 'patient', 'patient');
  theStore.setOne(d, 'patient', p);
}
