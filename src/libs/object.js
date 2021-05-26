export const isNullOrEmpty = obj => !obj || Object.keys(obj).length === 0;

export const removeNullEntries = obj =>
  Object.keys(obj) // Object.entries is not supported by IE :(
    .map(key => [key, obj[key]])
    .filter(([_key, value]) => value !== null && value !== undefined)
    .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});
