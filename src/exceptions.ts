// DisconnectException: We can't communicate with Bazaar: Service is disconnected
// NotFoundException: Item not found
// BazaarNotFoundException: Bazaar is not installed

export class DisconnectedError extends Error {}
export class ItemNotFoundError extends Error {}
export class BazaarNotFoundError extends Error {}

function makeError(ActuralError: any, e: Error) {
  const result = new ActuralError(e.message);
  Object.assign(result, e);
  return result;
}

export function praseError(e: Error) {
  if (e.message === 'Item not found') {
    return makeError(ItemNotFoundError, e);
  }

  if (
    e.message === "We can't communicate with Bazaar: Service is disconnected"
  ) {
    return makeError(DisconnectedError, e);
  }

  if (e.message === 'Bazaar is not installed') {
    return makeError(BazaarNotFoundError, e);
  }

  return e;
}
