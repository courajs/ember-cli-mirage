import assert from '../assert';
import {
  toCollectionName,
  toModelName
} from './normalize-name';

function present(x) {
  return x != null;
}

export {
  assert,
  present,
  toCollectionName,
  toModelName
};
