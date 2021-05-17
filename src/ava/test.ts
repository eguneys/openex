import test from 'ava';

import MovePicker from '../picker';


test.skip('picker', t => {
  let picker = MovePicker.make();
  t.log(picker.randomBuckets);
});
