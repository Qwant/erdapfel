export function hasDisplayableDelivery(delivery) {
  return !!delivery && Object.entries(delivery).some(([_key, value]) => value === 'yes');
}
