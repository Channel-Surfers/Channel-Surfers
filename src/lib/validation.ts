import * as v from 'valibot';

export const createChannelSchema = v.object({
    name: v.pipe(
        v.string(),
        v.minLength(3, 'Name must be at least 3 characters long'),
        v.maxLength(32, 'Name must be fewer than 32 characters')
    ),
    description: v.optional(
        v.pipe(v.string(), v.maxLength(4000, 'Description must be fewer than 4000 characters'))
    ),
    guidelines: v.optional(
        v.pipe(v.string(), v.maxLength(4000, 'Guidelines must be fewer than 4000 characters'))
    ),
    bannerImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    publishNow: v.boolean(),
});
