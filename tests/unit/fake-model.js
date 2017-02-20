import _ from 'lodash';

export default function(type, id, attrs) {
  return {
    modelName: type,
    id,
    attrs: _.assign({id}, attrs)
  };
}
