import theStore from './the-relationship-store';

export default function() {
  this.get('/patients/:id', function({patients}, {params}) {
    let p = patients.find(params.id);
    return this.serialize(p, theStore);
  });
  this.get('/documents/:id', function({documents}, {params}) {
    let doc = documents.find(params.id);
    return this.serialize(doc, theStore);
  });
  this.get('/facts/:id', function({facts}, {params}) {
    let fact = facts.find(params.id);
    return this.serialize(fact, theStore);

  });
}
