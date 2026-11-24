import AsyncStorage from "@react-native-async-storage/async-storage";

const storageKey = (userId: string) => `zwag:chat:v1:${userId}`;
const pendingWrites = new Map<string, Promise<void>>();
const clearing = new Set<string>();

export function readLocalChat(userId: string) {
  return AsyncStorage.getItem(storageKey(userId));
}

export function saveLocalChat(userId: string, data: string) {
  const pending = pendingWrites.get(userId) ?? Promise.resolve();
  const write = pending.catch(() => {}).then(async () => {
    if (!clearing.has(userId)) await AsyncStorage.setItem(storageKey(userId), data);
  });
  pendingWrites.set(userId, write);
  return write.finally(() => {
    if (pendingWrites.get(userId) === write) pendingWrites.delete(userId);
  });
}

export async function clearLocalChat(userId: string) {
  clearing.add(userId);
  await pendingWrites.get(userId)?.catch(() => {});
  await AsyncStorage.removeItem(storageKey(userId));
}
