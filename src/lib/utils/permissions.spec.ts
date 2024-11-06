import { test } from 'vitest';
import {
    channelModPermissions,
    defaultPermissions,
    objectBooleanSum,
    permissionsBuilder,
    sumPermissions,
} from './permissions';

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

test('permisisons can be summed', ({ expect }) => {
    const roles = [
        defaultPermissions(),
        defaultPermissions({ canEditRoles: true }),
        defaultPermissions({ canDeletePosts: true }),
    ];

    expect(sumPermissions(roles)).toStrictEqual(
        defaultPermissions({
            canEditRoles: true,
            canDeletePosts: true,
        })
    );
});

test('permissions builder works', ({ expect }) => {
    expect(permissionsBuilder().withChannelMod().build()).toStrictEqual({
        ...channelModPermissions('all'),
        ...defaultPermissions(),
    });
});
