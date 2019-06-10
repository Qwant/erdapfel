export default async function importMasq() {
  return import(/* webpackChunkName: "masq-lib" */ 'masq-lib');
}
