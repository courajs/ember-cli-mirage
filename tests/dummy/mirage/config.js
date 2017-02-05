export default function() {
  this.get('/patients/:id', function({patients}, {params}) {
    let p = patients.find(params.id);
    return this.serialize(p);
  });
  this.get('/documents/:id', function({documents}, {params}) {
    let doc = documents.find(params.id);
    return this.serialize(doc);
  });
  this.get('/facts/:id', function({facts}, {params}) {
    let fact = facts.find(params.id);
    return this.serialize(fact);
  });
}
