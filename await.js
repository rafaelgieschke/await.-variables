/**
 * @license
 * Copyright 2017 Rafael Gieschke
 * Licensed under the MIT License (<https://opensource.org/licenses/MIT>).
 */

/**
 * @fileoverview
 * await.-variables make interactively debugging `Promise`s a breeze. 
 *
 * @description
 * Inject this library into any page by executing (or bookmarking):
 * `javascript:void(document.documentElement.appendChild(document.createElement('script')).src='https://rafaelgieschke.github.io/await.-variables/await.js')`
 * in the Console or by adding a `<script>` element to the page:
 * `<script src="https://rafaelgieschke.github.io/await.-variables/await.js"></script>`.
 *
 * @example
 * // Instead of:
 * var promise = fetch("/");
 * // Execute this in Console:
 * await. a = fetch("/");
 * // (Be sure to include the dot after await!)
 * // Wait some time until result of `Promise` gets printed in Console.
 * a = a.text();
 * // Wait some more time.
 * a.match(/<a href/g);
 * // Or, everything in a single step:
 * await. b = async()=> (await (await fetch("/")).text).match(/<a href/g);
 *
 * @see {@link https://github.com/rafaelgieschke/await.-variables}
 */

"use strict";

try {
  // Try to remove the `<script>` element used to load this library.
  document.currentScript.remove();
} catch (e) {}

{
  const awaitVariables = new WeakSet();
  const AsyncPrototype = Object.getPrototypeOf(async () => {});
  const globalObject = typeof global === "object" ? global : window;

  globalObject["await"] = new Proxy(globalObject, {
    set(target, property, value) {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      if (!descriptor || !awaitVariables.has(descriptor.set)) {
        let value;
        const set = (newValue) => {
          if (typeof newValue === "function" &&
              Object.getPrototypeOf(newValue) === AsyncPrototype &&
              newValue.length === 0) {
            newValue = newValue();
            console.log(newValue);
          }
          value = newValue;

          try {
            newValue.then(v => value === newValue && console.log(value = v),
              v => value === newValue && console.error(value = v));
          } catch (e) {}
        };
        awaitVariables.add(set);
        Object.defineProperty(target, property, {
          configurable: true,
          set, get: () => value,
        });
      }
      target[property] = value;
      return true;
    },
    get(target, property, receiver) {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      if (!descriptor || !awaitVariables.has(descriptor.set)) {
        receiver[property] = target[property];
      }
      return target[property];
    },
  });
}
