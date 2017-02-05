export default function() {
  this.get('/patients/:id', function({patients}, {params}) {
    return patients.find(params.id);
  });
  this.get('/documents/:id', function({documents}, {params}) {
    return documents.find(params.id);
  });
  this.get('/facts/:id', function({facts}, {params}) {
    return facts.find(params.id);
  });
}
