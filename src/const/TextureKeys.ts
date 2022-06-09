enum keys {
    WallLeft,
    WallRight,
    Water,
    Player,
    Blob,
    Score,
    HP,
    HpBar,
    Dead,
    Ice,
    Shards,
    Hand,
    Tail,
    Source
}


type myType = Exclude<Partial<Record<keyof typeof keys, string>>, null | undefined>;
type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };
// @ts-ignore
const K:  NoUndefinedField<myType> = Object.entries(keys).reduce((prev, [key, value]) => ({...prev, [key]: String(value)}), {});
export default K;