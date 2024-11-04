import { test } from 'vitest';
import { objectBooleanSum } from './permissions';

test('sum function works', ({ expect }) => {
    const one = { a: false, b: false, c: false };
    const two = { a: false, b: false, c: true };
    const three = { a: false, b: true, c: false };
    const onePlusTwo = objectBooleanSum(one, two);
    const onePlusTwoPlusThree = objectBooleanSum(onePlusTwo, three);
    const twoPlusOne = objectBooleanSum(two, one);
    const twoPlusThree = objectBooleanSum(two, three);
    expect(onePlusTwo).toStrictEqual({ a: false, b: false, c: true });
    expect(onePlusTwoPlusThree).toStrictEqual({ a: false, b: true, c: true });
    // commutativity
    expect(onePlusTwo).toStrictEqual(twoPlusOne);
    // associativity
    expect(objectBooleanSum(one, twoPlusThree)).toStrictEqual({ a: false, b: true, c: true });
});
