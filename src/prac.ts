import R from 'ramda';

let original = { a: 1, b: { c: 2 } };
let copy = R.clone(original);
console.log(copy)