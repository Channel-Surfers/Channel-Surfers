import { test } from 'vitest';
import {
    channelMgmtPermissions,
    channelModPermissions,
    defaultPermissions,
    eventMgmtPermissions,
    objectBooleanSum,
    permissionsBuilder,
    roleMgmtPermissions,
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
        ...defaultPermissions(),
        ...channelModPermissions('all'),
    });
    expect(permissionsBuilder().withChannelMgmt().build()).toStrictEqual({
        ...defaultPermissions(),
        ...channelMgmtPermissions('all'),
    });
    expect(permissionsBuilder().withChannelMgmt().withChannelMod().build()).toStrictEqual({
        ...defaultPermissions(),
        ...channelMgmtPermissions('all'),
        ...channelModPermissions('all'),
    });
    expect(permissionsBuilder().withChannelMgmt().withChannelMod().build()).not.toStrictEqual({
        ...defaultPermissions(),
        ...roleMgmtPermissions('all'),
        ...channelModPermissions('all'),
    });
    expect(
        permissionsBuilder().withChannelMgmt({ canEditName: true }).withChannelMod().build()
    ).toStrictEqual({
        ...defaultPermissions(),
        ...channelMgmtPermissions({ canEditName: true }),
        ...channelModPermissions('all'),
    });
    expect(
        permissionsBuilder().withChannelMgmt({ canEditName: true }).withChannelMod().build()
    ).not.toStrictEqual({
        ...defaultPermissions(),
        ...channelMgmtPermissions({ canEditTags: true }),
        ...channelModPermissions('all'),
    });
    expect(permissionsBuilder().withAll().build()).toStrictEqual({
        ...roleMgmtPermissions('all'),
        ...channelModPermissions('all'),
        ...eventMgmtPermissions('all'),
        ...channelMgmtPermissions('all'),
    });
    expect(permissionsBuilder().build()).toStrictEqual({
        ...defaultPermissions(),
    });
});
