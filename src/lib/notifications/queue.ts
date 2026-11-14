// Every feature shares this queue so concurrent reconciliation cannot overbook
// the device's pending-notification capacity or race with a permission change.
let queue: Promise<unknown> = Promise.resolve();
export function serializeNotifications<T>(task: () => Promise<T>) {
  const result = queue.then(task);
  queue = result.catch(() => undefined);
  return result;
}
