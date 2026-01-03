enum keys {
    WallLeft,
    WallRight,
    Water,
    Player,
    Blob,
    Blob2,
    Score,
    Face,
    Dead,
    Ice,
    Shards,
    Hand,
    Tail,
    Source,
    Won,
    Floz,
    Seedmanc,
    Alter,
    Nanodesu,
    You
}

const K = Object.fromEntries(
    Object.keys(keys).map(k => [k, String((keys as any)[k])])
) as Record<keyof typeof keys, string>;

export default K;