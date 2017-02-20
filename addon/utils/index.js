import assert from '../assert';
import {
  toCollectionName,
  toModelName
} from './normalize-name';
import setObjectPath from './set-object-path';

function present(x) {
  return x != null;
}

export {
  assert,
  present,
  toCollectionName,
  toModelName,
  setObjectPath
};
