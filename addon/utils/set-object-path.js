export default function(obj, ...path) {
  let val = path.pop();

  let wholePath = path.join('.');
  let partsSoFar = [];

  let nextProp;
  while (path.length > 1) {
    nextProp = path.shift();
    partsSoFar.push(nextProp);

    let nextVal = obj[nextProp];

    if (nextVal === null || !(typeof nextVal === 'object' || typeof nextVal === 'undefined')) {
      let pathSoFar = partsSoFar.join('.');
      nextVal = JSON.stringify(nextVal);
      let message = `Path "${wholePath}" cannot be set on the object, because path "${pathSoFar}" is a non-object (it is ${nextVal})`;
      throw new Error(message);
    }
    obj[nextProp] = obj[nextProp] || {};
    obj = obj[nextProp];
  }

  let [lastProp] = path;

  obj[lastProp] = val;
}
