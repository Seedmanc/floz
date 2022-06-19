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


type myType = Exclude<Partial<Record<keyof typeof keys, string>>, null | undefined>;
type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };
// @ts-ignore
const K:  NoUndefinedField<myType> = Object.entries(keys).reduce((prev, [key, value]) => ({...prev, [key]: String(value)}), {});
export default K;