import { Descriptor } from "hybrids";
const camelToDashMap = new Map();
function camelToDash(str) {
  let result = camelToDashMap.get(str);
  if (result === undefined) {
    result = str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    camelToDashMap.set(str, result);
  }
  return result;
}

export const getset = <E, V>(
  defaultValue: V,
  connect?: Descriptor<E, V>["connect"],
  observe?: Descriptor<E, V>["observe"]
) => ({
  get: (host, val = defaultValue) => val,
  set: (host, val) => val,
  connect,
  observe,
});

export const ref = (query: string) => ({
  get: ({ render }) => render().querySelector(query),
});

/**
 * A Hybrids property definition specifically for providing functions to components
 * @param defaultFn The default function if none is passed
 * @param connect connect handler
 * @param observe observe handler
 * @returns Hybrids property definition
 */
export function propertyFn(defaultFn: Function = () => {}, connect?, observe?) {
  const attrs = new WeakMap();
  const type = typeof defaultFn;

  return getset(
    defaultFn,
    type === "function"
      ? (host, key, invalidate) => {
          if (!attrs.has(host)) {
            const attrName = camelToDash(key);
            attrs.set(host, attrName);

            if (host.hasAttribute(attrName)) {
              const attrValue = host.getAttribute(attrName);
              (<any>host)[key] = attrValue;
            }
          }

          return connect && connect(host, key, invalidate);
        }
      : connect,
    type === "function"
      ? (host, val, last) => {
          const attrName = attrs.get(host);
          const attrValue = host.getAttribute(attrName);
          if (attrValue) {
            host.removeAttribute(attrName);
          }

          if (observe) observe(host, val, last);
        }
      : observe
  );
}
