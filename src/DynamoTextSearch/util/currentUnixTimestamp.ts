
export type UnixTimestamp = number;

export function currentUnixTimestamp(): UnixTimestamp {
  return Math.floor(Date.now() / 1000);
}

export const ONE_HOUR = 60 * 60;
