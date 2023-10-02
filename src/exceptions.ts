// DisconnectException: We can't communicate with Bazaar: Service is disconnected
// NotFoundException: Item not found
// BazaarNotFoundException: Bazaar is not installed

export class DisconnectedError extends Error {}
export class ItemNotFoundError extends Error {}
export class BazaarNotFoundError extends Error {}

function createError(ExceptionClass: any, e: Error) {
  const customException = new ExceptionClass(e.message);
  Object.assign(customException, e);
  return customException;
}

export function praseError(e: Error) {
  if (e.message === 'Item not found') {
    return createError(ItemNotFoundError, e);
  }

  if (
    e.message === "We can't communicate with Bazaar: Service is disconnected"
  ) {
    return createError(DisconnectedError, e);
  }

  if (e.message === 'Bazaar is not installed') {
    return createError(BazaarNotFoundError, e);
  }

  return e;
}
