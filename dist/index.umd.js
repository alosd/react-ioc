(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
	typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
	(factory((global.ReactIoC = {}),global.React));
}(this, (function (exports,react) { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	/*! *****************************************************************************
	Copyright (C) Microsoft. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */
	var Reflect$1;
	(function (Reflect) {
	    // Metadata Proposal
	    // https://rbuckton.github.io/reflect-metadata/
	    (function (factory) {
	        var root = typeof commonjsGlobal === "object" ? commonjsGlobal :
	            typeof self === "object" ? self :
	                typeof this === "object" ? this :
	                    Function("return this;")();
	        var exporter = makeExporter(Reflect);
	        if (typeof root.Reflect === "undefined") {
	            root.Reflect = Reflect;
	        }
	        else {
	            exporter = makeExporter(root.Reflect, exporter);
	        }
	        factory(exporter);
	        function makeExporter(target, previous) {
	            return function (key, value) {
	                if (typeof target[key] !== "function") {
	                    Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
	                }
	                if (previous)
	                    previous(key, value);
	            };
	        }
	    })(function (exporter) {
	        var hasOwn = Object.prototype.hasOwnProperty;
	        // feature test for Symbol support
	        var supportsSymbol = typeof Symbol === "function";
	        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
	        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
	        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
	        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
	        var downLevel = !supportsCreate && !supportsProto;
	        var HashMap = {
	            // create an object in dictionary mode (a.k.a. "slow" mode in v8)
	            create: supportsCreate
	                ? function () { return MakeDictionary(Object.create(null)); }
	                : supportsProto
	                    ? function () { return MakeDictionary({ __proto__: null }); }
	                    : function () { return MakeDictionary({}); },
	            has: downLevel
	                ? function (map, key) { return hasOwn.call(map, key); }
	                : function (map, key) { return key in map; },
	            get: downLevel
	                ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
	                : function (map, key) { return map[key]; },
	        };
	        // Load global or shim versions of Map, Set, and WeakMap
	        var functionPrototype = Object.getPrototypeOf(Function);
	        var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
	        var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
	        var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
	        var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
	        // [[Metadata]] internal slot
	        // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
	        var Metadata = new _WeakMap();
	        /**
	         * Applies a set of decorators to a property of a target object.
	         * @param decorators An array of decorators.
	         * @param target The target object.
	         * @param propertyKey (Optional) The property key to decorate.
	         * @param attributes (Optional) The property descriptor for the target key.
	         * @remarks Decorators are applied in reverse order.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     Example = Reflect.decorate(decoratorsArray, Example);
	         *
	         *     // property (on constructor)
	         *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     Object.defineProperty(Example, "staticMethod",
	         *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
	         *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
	         *
	         *     // method (on prototype)
	         *     Object.defineProperty(Example.prototype, "method",
	         *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
	         *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
	         *
	         */
	        function decorate(decorators, target, propertyKey, attributes) {
	            if (!IsUndefined(propertyKey)) {
	                if (!IsArray(decorators))
	                    throw new TypeError();
	                if (!IsObject(target))
	                    throw new TypeError();
	                if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
	                    throw new TypeError();
	                if (IsNull(attributes))
	                    attributes = undefined;
	                propertyKey = ToPropertyKey(propertyKey);
	                return DecorateProperty(decorators, target, propertyKey, attributes);
	            }
	            else {
	                if (!IsArray(decorators))
	                    throw new TypeError();
	                if (!IsConstructor(target))
	                    throw new TypeError();
	                return DecorateConstructor(decorators, target);
	            }
	        }
	        exporter("decorate", decorate);
	        // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
	        // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
	        /**
	         * A default metadata decorator factory that can be used on a class, class member, or parameter.
	         * @param metadataKey The key for the metadata entry.
	         * @param metadataValue The value for the metadata entry.
	         * @returns A decorator function.
	         * @remarks
	         * If `metadataKey` is already defined for the target and target key, the
	         * metadataValue for that key will be overwritten.
	         * @example
	         *
	         *     // constructor
	         *     @Reflect.metadata(key, value)
	         *     class Example {
	         *     }
	         *
	         *     // property (on constructor, TypeScript only)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         static staticProperty;
	         *     }
	         *
	         *     // property (on prototype, TypeScript only)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         property;
	         *     }
	         *
	         *     // method (on constructor)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         static staticMethod() { }
	         *     }
	         *
	         *     // method (on prototype)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         method() { }
	         *     }
	         *
	         */
	        function metadata(metadataKey, metadataValue) {
	            function decorator(target, propertyKey) {
	                if (!IsObject(target))
	                    throw new TypeError();
	                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
	                    throw new TypeError();
	                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
	            }
	            return decorator;
	        }
	        exporter("metadata", metadata);
	        /**
	         * Define a unique metadata entry on the target.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param metadataValue A value that contains attached metadata.
	         * @param target The target object on which to define metadata.
	         * @param propertyKey (Optional) The property key for the target.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     Reflect.defineMetadata("custom:annotation", options, Example);
	         *
	         *     // property (on constructor)
	         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
	         *
	         *     // decorator factory as metadata-producing annotation.
	         *     function MyAnnotation(options): Decorator {
	         *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
	         *     }
	         *
	         */
	        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
	        }
	        exporter("defineMetadata", defineMetadata);
	        /**
	         * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.hasMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function hasMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("hasMetadata", hasMetadata);
	        /**
	         * Gets a value indicating whether the target object has the provided metadata key defined.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function hasOwnMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("hasOwnMetadata", hasOwnMetadata);
	        /**
	         * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function getMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("getMetadata", getMetadata);
	        /**
	         * Gets the metadata value for the provided metadata key on the target object.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function getOwnMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("getOwnMetadata", getOwnMetadata);
	        /**
	         * Gets the metadata keys defined on the target object or its prototype chain.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns An array of unique metadata keys.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getMetadataKeys(Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getMetadataKeys(Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getMetadataKeys(Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getMetadataKeys(Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getMetadataKeys(Example.prototype, "method");
	         *
	         */
	        function getMetadataKeys(target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryMetadataKeys(target, propertyKey);
	        }
	        exporter("getMetadataKeys", getMetadataKeys);
	        /**
	         * Gets the unique metadata keys defined on the target object.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns An array of unique metadata keys.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getOwnMetadataKeys(Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
	         *
	         */
	        function getOwnMetadataKeys(target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryOwnMetadataKeys(target, propertyKey);
	        }
	        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
	        /**
	         * Deletes the metadata entry from the target object with the provided key.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata entry was found and deleted; otherwise, false.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.deleteMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function deleteMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
	            if (IsUndefined(metadataMap))
	                return false;
	            if (!metadataMap.delete(metadataKey))
	                return false;
	            if (metadataMap.size > 0)
	                return true;
	            var targetMetadata = Metadata.get(target);
	            targetMetadata.delete(propertyKey);
	            if (targetMetadata.size > 0)
	                return true;
	            Metadata.delete(target);
	            return true;
	        }
	        exporter("deleteMetadata", deleteMetadata);
	        function DecorateConstructor(decorators, target) {
	            for (var i = decorators.length - 1; i >= 0; --i) {
	                var decorator = decorators[i];
	                var decorated = decorator(target);
	                if (!IsUndefined(decorated) && !IsNull(decorated)) {
	                    if (!IsConstructor(decorated))
	                        throw new TypeError();
	                    target = decorated;
	                }
	            }
	            return target;
	        }
	        function DecorateProperty(decorators, target, propertyKey, descriptor) {
	            for (var i = decorators.length - 1; i >= 0; --i) {
	                var decorator = decorators[i];
	                var decorated = decorator(target, propertyKey, descriptor);
	                if (!IsUndefined(decorated) && !IsNull(decorated)) {
	                    if (!IsObject(decorated))
	                        throw new TypeError();
	                    descriptor = decorated;
	                }
	            }
	            return descriptor;
	        }
	        function GetOrCreateMetadataMap(O, P, Create) {
	            var targetMetadata = Metadata.get(O);
	            if (IsUndefined(targetMetadata)) {
	                if (!Create)
	                    return undefined;
	                targetMetadata = new _Map();
	                Metadata.set(O, targetMetadata);
	            }
	            var metadataMap = targetMetadata.get(P);
	            if (IsUndefined(metadataMap)) {
	                if (!Create)
	                    return undefined;
	                metadataMap = new _Map();
	                targetMetadata.set(P, metadataMap);
	            }
	            return metadataMap;
	        }
	        // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
	        function OrdinaryHasMetadata(MetadataKey, O, P) {
	            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
	            if (hasOwn)
	                return true;
	            var parent = OrdinaryGetPrototypeOf(O);
	            if (!IsNull(parent))
	                return OrdinaryHasMetadata(MetadataKey, parent, P);
	            return false;
	        }
	        // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
	        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	            if (IsUndefined(metadataMap))
	                return false;
	            return ToBoolean(metadataMap.has(MetadataKey));
	        }
	        // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
	        function OrdinaryGetMetadata(MetadataKey, O, P) {
	            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
	            if (hasOwn)
	                return OrdinaryGetOwnMetadata(MetadataKey, O, P);
	            var parent = OrdinaryGetPrototypeOf(O);
	            if (!IsNull(parent))
	                return OrdinaryGetMetadata(MetadataKey, parent, P);
	            return undefined;
	        }
	        // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
	        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	            if (IsUndefined(metadataMap))
	                return undefined;
	            return metadataMap.get(MetadataKey);
	        }
	        // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
	        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
	            metadataMap.set(MetadataKey, MetadataValue);
	        }
	        // 3.1.6.1 OrdinaryMetadataKeys(O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
	        function OrdinaryMetadataKeys(O, P) {
	            var ownKeys = OrdinaryOwnMetadataKeys(O, P);
	            var parent = OrdinaryGetPrototypeOf(O);
	            if (parent === null)
	                return ownKeys;
	            var parentKeys = OrdinaryMetadataKeys(parent, P);
	            if (parentKeys.length <= 0)
	                return ownKeys;
	            if (ownKeys.length <= 0)
	                return parentKeys;
	            var set = new _Set();
	            var keys = [];
	            for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
	                var key = ownKeys_1[_i];
	                var hasKey = set.has(key);
	                if (!hasKey) {
	                    set.add(key);
	                    keys.push(key);
	                }
	            }
	            for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
	                var key = parentKeys_1[_a];
	                var hasKey = set.has(key);
	                if (!hasKey) {
	                    set.add(key);
	                    keys.push(key);
	                }
	            }
	            return keys;
	        }
	        // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
	        function OrdinaryOwnMetadataKeys(O, P) {
	            var keys = [];
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	            if (IsUndefined(metadataMap))
	                return keys;
	            var keysObj = metadataMap.keys();
	            var iterator = GetIterator(keysObj);
	            var k = 0;
	            while (true) {
	                var next = IteratorStep(iterator);
	                if (!next) {
	                    keys.length = k;
	                    return keys;
	                }
	                var nextValue = IteratorValue(next);
	                try {
	                    keys[k] = nextValue;
	                }
	                catch (e) {
	                    try {
	                        IteratorClose(iterator);
	                    }
	                    finally {
	                        throw e;
	                    }
	                }
	                k++;
	            }
	        }
	        // 6 ECMAScript Data Typ0es and Values
	        // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
	        function Type(x) {
	            if (x === null)
	                return 1 /* Null */;
	            switch (typeof x) {
	                case "undefined": return 0 /* Undefined */;
	                case "boolean": return 2 /* Boolean */;
	                case "string": return 3 /* String */;
	                case "symbol": return 4 /* Symbol */;
	                case "number": return 5 /* Number */;
	                case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
	                default: return 6 /* Object */;
	            }
	        }
	        // 6.1.1 The Undefined Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
	        function IsUndefined(x) {
	            return x === undefined;
	        }
	        // 6.1.2 The Null Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
	        function IsNull(x) {
	            return x === null;
	        }
	        // 6.1.5 The Symbol Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
	        function IsSymbol(x) {
	            return typeof x === "symbol";
	        }
	        // 6.1.7 The Object Type
	        // https://tc39.github.io/ecma262/#sec-object-type
	        function IsObject(x) {
	            return typeof x === "object" ? x !== null : typeof x === "function";
	        }
	        // 7.1 Type Conversion
	        // https://tc39.github.io/ecma262/#sec-type-conversion
	        // 7.1.1 ToPrimitive(input [, PreferredType])
	        // https://tc39.github.io/ecma262/#sec-toprimitive
	        function ToPrimitive(input, PreferredType) {
	            switch (Type(input)) {
	                case 0 /* Undefined */: return input;
	                case 1 /* Null */: return input;
	                case 2 /* Boolean */: return input;
	                case 3 /* String */: return input;
	                case 4 /* Symbol */: return input;
	                case 5 /* Number */: return input;
	            }
	            var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
	            var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
	            if (exoticToPrim !== undefined) {
	                var result = exoticToPrim.call(input, hint);
	                if (IsObject(result))
	                    throw new TypeError();
	                return result;
	            }
	            return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
	        }
	        // 7.1.1.1 OrdinaryToPrimitive(O, hint)
	        // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
	        function OrdinaryToPrimitive(O, hint) {
	            if (hint === "string") {
	                var toString_1 = O.toString;
	                if (IsCallable(toString_1)) {
	                    var result = toString_1.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	                var valueOf = O.valueOf;
	                if (IsCallable(valueOf)) {
	                    var result = valueOf.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	            }
	            else {
	                var valueOf = O.valueOf;
	                if (IsCallable(valueOf)) {
	                    var result = valueOf.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	                var toString_2 = O.toString;
	                if (IsCallable(toString_2)) {
	                    var result = toString_2.call(O);
	                    if (!IsObject(result))
	                        return result;
	                }
	            }
	            throw new TypeError();
	        }
	        // 7.1.2 ToBoolean(argument)
	        // https://tc39.github.io/ecma262/2016/#sec-toboolean
	        function ToBoolean(argument) {
	            return !!argument;
	        }
	        // 7.1.12 ToString(argument)
	        // https://tc39.github.io/ecma262/#sec-tostring
	        function ToString(argument) {
	            return "" + argument;
	        }
	        // 7.1.14 ToPropertyKey(argument)
	        // https://tc39.github.io/ecma262/#sec-topropertykey
	        function ToPropertyKey(argument) {
	            var key = ToPrimitive(argument, 3 /* String */);
	            if (IsSymbol(key))
	                return key;
	            return ToString(key);
	        }
	        // 7.2 Testing and Comparison Operations
	        // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
	        // 7.2.2 IsArray(argument)
	        // https://tc39.github.io/ecma262/#sec-isarray
	        function IsArray(argument) {
	            return Array.isArray
	                ? Array.isArray(argument)
	                : argument instanceof Object
	                    ? argument instanceof Array
	                    : Object.prototype.toString.call(argument) === "[object Array]";
	        }
	        // 7.2.3 IsCallable(argument)
	        // https://tc39.github.io/ecma262/#sec-iscallable
	        function IsCallable(argument) {
	            // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
	            return typeof argument === "function";
	        }
	        // 7.2.4 IsConstructor(argument)
	        // https://tc39.github.io/ecma262/#sec-isconstructor
	        function IsConstructor(argument) {
	            // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
	            return typeof argument === "function";
	        }
	        // 7.2.7 IsPropertyKey(argument)
	        // https://tc39.github.io/ecma262/#sec-ispropertykey
	        function IsPropertyKey(argument) {
	            switch (Type(argument)) {
	                case 3 /* String */: return true;
	                case 4 /* Symbol */: return true;
	                default: return false;
	            }
	        }
	        // 7.3 Operations on Objects
	        // https://tc39.github.io/ecma262/#sec-operations-on-objects
	        // 7.3.9 GetMethod(V, P)
	        // https://tc39.github.io/ecma262/#sec-getmethod
	        function GetMethod(V, P) {
	            var func = V[P];
	            if (func === undefined || func === null)
	                return undefined;
	            if (!IsCallable(func))
	                throw new TypeError();
	            return func;
	        }
	        // 7.4 Operations on Iterator Objects
	        // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
	        function GetIterator(obj) {
	            var method = GetMethod(obj, iteratorSymbol);
	            if (!IsCallable(method))
	                throw new TypeError(); // from Call
	            var iterator = method.call(obj);
	            if (!IsObject(iterator))
	                throw new TypeError();
	            return iterator;
	        }
	        // 7.4.4 IteratorValue(iterResult)
	        // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
	        function IteratorValue(iterResult) {
	            return iterResult.value;
	        }
	        // 7.4.5 IteratorStep(iterator)
	        // https://tc39.github.io/ecma262/#sec-iteratorstep
	        function IteratorStep(iterator) {
	            var result = iterator.next();
	            return result.done ? false : result;
	        }
	        // 7.4.6 IteratorClose(iterator, completion)
	        // https://tc39.github.io/ecma262/#sec-iteratorclose
	        function IteratorClose(iterator) {
	            var f = iterator["return"];
	            if (f)
	                f.call(iterator);
	        }
	        // 9.1 Ordinary Object Internal Methods and Internal Slots
	        // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
	        // 9.1.1.1 OrdinaryGetPrototypeOf(O)
	        // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
	        function OrdinaryGetPrototypeOf(O) {
	            var proto = Object.getPrototypeOf(O);
	            if (typeof O !== "function" || O === functionPrototype)
	                return proto;
	            // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
	            // Try to determine the superclass constructor. Compatible implementations
	            // must either set __proto__ on a subclass constructor to the superclass constructor,
	            // or ensure each class has a valid `constructor` property on its prototype that
	            // points back to the constructor.
	            // If this is not the same as Function.[[Prototype]], then this is definately inherited.
	            // This is the case when in ES6 or when using __proto__ in a compatible browser.
	            if (proto !== functionPrototype)
	                return proto;
	            // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
	            var prototype = O.prototype;
	            var prototypeProto = prototype && Object.getPrototypeOf(prototype);
	            if (prototypeProto == null || prototypeProto === Object.prototype)
	                return proto;
	            // If the constructor was not a function, then we cannot determine the heritage.
	            var constructor = prototypeProto.constructor;
	            if (typeof constructor !== "function")
	                return proto;
	            // If we have some kind of self-reference, then we cannot determine the heritage.
	            if (constructor === O)
	                return proto;
	            // we have a pretty good guess at the heritage.
	            return constructor;
	        }
	        // naive Map shim
	        function CreateMapPolyfill() {
	            var cacheSentinel = {};
	            var arraySentinel = [];
	            var MapIterator = /** @class */ (function () {
	                function MapIterator(keys, values, selector) {
	                    this._index = 0;
	                    this._keys = keys;
	                    this._values = values;
	                    this._selector = selector;
	                }
	                MapIterator.prototype["@@iterator"] = function () { return this; };
	                MapIterator.prototype[iteratorSymbol] = function () { return this; };
	                MapIterator.prototype.next = function () {
	                    var index = this._index;
	                    if (index >= 0 && index < this._keys.length) {
	                        var result = this._selector(this._keys[index], this._values[index]);
	                        if (index + 1 >= this._keys.length) {
	                            this._index = -1;
	                            this._keys = arraySentinel;
	                            this._values = arraySentinel;
	                        }
	                        else {
	                            this._index++;
	                        }
	                        return { value: result, done: false };
	                    }
	                    return { value: undefined, done: true };
	                };
	                MapIterator.prototype.throw = function (error) {
	                    if (this._index >= 0) {
	                        this._index = -1;
	                        this._keys = arraySentinel;
	                        this._values = arraySentinel;
	                    }
	                    throw error;
	                };
	                MapIterator.prototype.return = function (value) {
	                    if (this._index >= 0) {
	                        this._index = -1;
	                        this._keys = arraySentinel;
	                        this._values = arraySentinel;
	                    }
	                    return { value: value, done: true };
	                };
	                return MapIterator;
	            }());
	            return /** @class */ (function () {
	                function Map() {
	                    this._keys = [];
	                    this._values = [];
	                    this._cacheKey = cacheSentinel;
	                    this._cacheIndex = -2;
	                }
	                Object.defineProperty(Map.prototype, "size", {
	                    get: function () { return this._keys.length; },
	                    enumerable: true,
	                    configurable: true
	                });
	                Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
	                Map.prototype.get = function (key) {
	                    var index = this._find(key, /*insert*/ false);
	                    return index >= 0 ? this._values[index] : undefined;
	                };
	                Map.prototype.set = function (key, value) {
	                    var index = this._find(key, /*insert*/ true);
	                    this._values[index] = value;
	                    return this;
	                };
	                Map.prototype.delete = function (key) {
	                    var index = this._find(key, /*insert*/ false);
	                    if (index >= 0) {
	                        var size = this._keys.length;
	                        for (var i = index + 1; i < size; i++) {
	                            this._keys[i - 1] = this._keys[i];
	                            this._values[i - 1] = this._values[i];
	                        }
	                        this._keys.length--;
	                        this._values.length--;
	                        if (key === this._cacheKey) {
	                            this._cacheKey = cacheSentinel;
	                            this._cacheIndex = -2;
	                        }
	                        return true;
	                    }
	                    return false;
	                };
	                Map.prototype.clear = function () {
	                    this._keys.length = 0;
	                    this._values.length = 0;
	                    this._cacheKey = cacheSentinel;
	                    this._cacheIndex = -2;
	                };
	                Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
	                Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
	                Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
	                Map.prototype["@@iterator"] = function () { return this.entries(); };
	                Map.prototype[iteratorSymbol] = function () { return this.entries(); };
	                Map.prototype._find = function (key, insert) {
	                    if (this._cacheKey !== key) {
	                        this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
	                    }
	                    if (this._cacheIndex < 0 && insert) {
	                        this._cacheIndex = this._keys.length;
	                        this._keys.push(key);
	                        this._values.push(undefined);
	                    }
	                    return this._cacheIndex;
	                };
	                return Map;
	            }());
	            function getKey(key, _) {
	                return key;
	            }
	            function getValue(_, value) {
	                return value;
	            }
	            function getEntry(key, value) {
	                return [key, value];
	            }
	        }
	        // naive Set shim
	        function CreateSetPolyfill() {
	            return /** @class */ (function () {
	                function Set() {
	                    this._map = new _Map();
	                }
	                Object.defineProperty(Set.prototype, "size", {
	                    get: function () { return this._map.size; },
	                    enumerable: true,
	                    configurable: true
	                });
	                Set.prototype.has = function (value) { return this._map.has(value); };
	                Set.prototype.add = function (value) { return this._map.set(value, value), this; };
	                Set.prototype.delete = function (value) { return this._map.delete(value); };
	                Set.prototype.clear = function () { this._map.clear(); };
	                Set.prototype.keys = function () { return this._map.keys(); };
	                Set.prototype.values = function () { return this._map.values(); };
	                Set.prototype.entries = function () { return this._map.entries(); };
	                Set.prototype["@@iterator"] = function () { return this.keys(); };
	                Set.prototype[iteratorSymbol] = function () { return this.keys(); };
	                return Set;
	            }());
	        }
	        // naive WeakMap shim
	        function CreateWeakMapPolyfill() {
	            var UUID_SIZE = 16;
	            var keys = HashMap.create();
	            var rootKey = CreateUniqueKey();
	            return /** @class */ (function () {
	                function WeakMap() {
	                    this._key = CreateUniqueKey();
	                }
	                WeakMap.prototype.has = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? HashMap.has(table, this._key) : false;
	                };
	                WeakMap.prototype.get = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
	                };
	                WeakMap.prototype.set = function (target, value) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ true);
	                    table[this._key] = value;
	                    return this;
	                };
	                WeakMap.prototype.delete = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? delete table[this._key] : false;
	                };
	                WeakMap.prototype.clear = function () {
	                    // NOTE: not a real clear, just makes the previous data unreachable
	                    this._key = CreateUniqueKey();
	                };
	                return WeakMap;
	            }());
	            function CreateUniqueKey() {
	                var key;
	                do
	                    key = "@@WeakMap@@" + CreateUUID();
	                while (HashMap.has(keys, key));
	                keys[key] = true;
	                return key;
	            }
	            function GetOrCreateWeakMapTable(target, create) {
	                if (!hasOwn.call(target, rootKey)) {
	                    if (!create)
	                        return undefined;
	                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
	                }
	                return target[rootKey];
	            }
	            function FillRandomBytes(buffer, size) {
	                for (var i = 0; i < size; ++i)
	                    buffer[i] = Math.random() * 0xff | 0;
	                return buffer;
	            }
	            function GenRandomBytes(size) {
	                if (typeof Uint8Array === "function") {
	                    if (typeof crypto !== "undefined")
	                        return crypto.getRandomValues(new Uint8Array(size));
	                    if (typeof msCrypto !== "undefined")
	                        return msCrypto.getRandomValues(new Uint8Array(size));
	                    return FillRandomBytes(new Uint8Array(size), size);
	                }
	                return FillRandomBytes(new Array(size), size);
	            }
	            function CreateUUID() {
	                var data = GenRandomBytes(UUID_SIZE);
	                // mark as random - RFC 4122 § 4.4
	                data[6] = data[6] & 0x4f | 0x40;
	                data[8] = data[8] & 0xbf | 0x80;
	                var result = "";
	                for (var offset = 0; offset < UUID_SIZE; ++offset) {
	                    var byte = data[offset];
	                    if (offset === 4 || offset === 6 || offset === 8)
	                        result += "-";
	                    if (byte < 16)
	                        result += "0";
	                    result += byte.toString(16).toLowerCase();
	                }
	                return result;
	            }
	        }
	        // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
	        function MakeDictionary(obj) {
	            obj.__ = undefined;
	            delete obj.__;
	            return obj;
	        }
	    });
	})(Reflect$1 || (Reflect$1 = {}));

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */
	/* global Reflect, Promise */

	var extendStatics = function(d, b) {
	    extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return extendStatics(d, b);
	};

	function __extends(d, b) {
	    extendStatics(d, b);
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	function __awaiter(thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}

	function __generator(thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (_) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	}

	/**
	 * @internal
	 */
	function isFunction(arg) {
	    return typeof arg === 'function';
	}
	/**
	 * @internal
	 */
	function isObject(arg) {
	    return arg && typeof arg === 'object';
	}
	/**
	 * @internal
	 */
	function isString(arg) {
	    return typeof arg === 'string';
	}
	/**
	 * @internal
	 */
	function isSymbol(arg) {
	    return typeof arg === 'symbol';
	}
	/**
	 * @internal
	 */
	function isToken(arg) {
	    return isFunction(arg) || isObject(arg) || isString(arg) || isSymbol(arg);
	}
	/**
	 * @internal
	 */
	function isReactComponent(prototype) {
	    return isObject(prototype) && isObject(prototype.isReactComponent);
	}
	/**
	 * @internal
	 */
	function isValidMetadata(arg) {
	    return isFunction(arg) && [Object, Function, Number, String, Boolean].indexOf(arg) === -1;
	}

	/**
	 * @internal
	 */
	function getDebugName(value) {
	    if (isFunction(value)) {
	        return String(value.displayName || value.name);
	    }
	    if (isObject(value) && isFunction(value.constructor)) {
	        return String(value.constructor.name);
	    }
	    return String(value);
	}
	/**
	 * @internal
	 */
	function logError(message) {
	    try {
	        throw new Error(message);
	    }
	    catch (e) {
	        console.error(e);
	    }
	}
	/**
	 * @internal
	 */
	function logIncorrectBinding(token, binding) {
	    var tokenName = getDebugName(token);
	    var bindingName = getDebugName(binding);
	    logError("Binding [" + tokenName + ", " + bindingName + "] is incorrect.");
	}
	/**
	 * @internal
	 */
	function logNotFoundDependency(token) {
	    var name = getDebugName(token);
	    logError("Dependency " + name + " is not found.\nPlease register " + name + " in some Provider e.g.\n@provider([" + name + ", " + name + "])\nclass App extends React.Component { /*...*/ }");
	}
	/**
	 * @internal
	 */
	function logNotFoundProvider(target) {
	    if (isReactComponent(target)) {
	        var name_1 = getDebugName(target);
	        logError("Provider is not found.\n  Please define Provider and set " + name_1 + ".contextType = InjectorContext e.g.\n  @provider([MyService, MyService])\n  class App extends React.Component { /*...*/ }\n  class " + name_1 + " extends React.Component {\n    static contextType = InjectorContext;\n  }");
	    }
	    else {
	        logError("Provider is not found.\n  Please define Provider e.g.\n  @provider([MyService, MyService])\n  class App extends React.Component { /*...*/ }");
	    }
	}
	/**
	 * @internal
	 */
	function logInvalidMetadata(target, token) {
	    var tokenName = getDebugName(token);
	    var targetName = getDebugName(target);
	    logError(tokenName + " is not a valid dependency.\nPlease specify ES6 class as property type e.g.\nclass MyService {}\nclass " + targetName + " {\n  @inject myService: MyService;\n}");
	}

	/* istanbul ignore next */
	var INJECTOR = (typeof Symbol === 'function' ? Symbol() : '__injector__');
	/** React Context for Injector */
	var InjectorContext = react.createContext({});
	{
	    InjectorContext.displayName = 'InjectorContext';
	}
	/**
	 * Dependency injection container
	 * @internal
	 */
	var Injector = /** @class */ (function (_super) {
	    __extends(Injector, _super);
	    function Injector() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    return Injector;
	}(react.Component));
	/**
	 * Find Injector for passed object and cache it inside this object
	 * @internal
	 * @param {Object} target The object in which we inject value
	 * @returns {Injector}
	 */
	function getInjector(target) {
	    var _a;
	    var injector = target[INJECTOR];
	    if (injector) {
	        return injector;
	    }
	    injector = currentInjector || ((_a = target.context) === null || _a === void 0 ? void 0 : _a.injector);
	    if (injector instanceof Injector) {
	        target[INJECTOR] = injector;
	        return injector;
	    }
	    return undefined;
	}
	var currentInjector = null;
	/**
	 * Resolve a class instance that registered by some Provider in hierarchy.
	 * Instance is cached in Provider that registers it's class.
	 * @internal
	 * @param {Injector} injector Injector instance
	 * @param {Token} token Dependency injection token
	 * @returns {Object} Resolved class instance
	 */
	function getInstance(injector, token) {
	    if (registrationQueue.length > 0) {
	        registrationQueue.forEach(function (registration) {
	            registration();
	        });
	        registrationQueue.length = 0;
	    }
	    while (injector) {
	        var instance = injector._instanceMap.get(token);
	        if (instance !== undefined) {
	            return instance;
	        }
	        var binding = injector._bindingMap.get(token);
	        if (binding) {
	            var prevInjector = currentInjector;
	            currentInjector = injector;
	            try {
	                instance = binding(injector);
	            }
	            finally {
	                currentInjector = prevInjector;
	            }
	            injector._instanceMap.set(token, instance);
	            injector._initInstance(instance);
	            return instance;
	        }
	        injector = injector._parent;
	    }
	    {
	        logNotFoundDependency(token);
	    }
	    return undefined;
	}
	/**
	 * @internal
	 */
	var registrationQueue = [];

	function inject(targetOrToken, keyOrToken) {
	    if (isFunction(keyOrToken)) {
	        return injectFunction(targetOrToken, keyOrToken);
	    }
	    var token = targetOrToken;
	    if (!keyOrToken) {
	        return injectDecorator;
	    }
	    return injectDecorator(token, keyOrToken);
	    function injectDecorator(prototype, key) {
	        {
	            defineContextType(prototype);
	        }
	        if (!token) {
	            token = Reflect.getMetadata('design:type', prototype, key);
	            {
	                if (!isValidMetadata(token)) {
	                    logInvalidMetadata(targetOrToken, token);
	                }
	            }
	        }
	        var descriptor = {
	            configurable: true,
	            enumerable: true,
	            get: function () {
	                var instance = injectFunction(this, token);
	                Object.defineProperty(this, key, {
	                    enumerable: true,
	                    writable: true,
	                    value: instance
	                });
	                return instance;
	            },
	            set: function (instance) {
	                Object.defineProperty(this, key, {
	                    enumerable: true,
	                    writable: true,
	                    value: instance
	                });
	            }
	        };
	        Object.defineProperty(prototype, key, descriptor);
	        return descriptor;
	    }
	}
	/**
	 * Resolve a class instance that registered by some Provider in hierarchy.
	 * Instance is cached in Provider that registers it's class.
	 * @internal
	 * @param {Object} target The object in which we inject class instance
	 * @param {Token} token Dependency injection token
	 * @returns {Object} Resolved class instance
	 */
	function injectFunction(target, token) {
	    var injector = getInjector(target);
	    {
	        if (!injector) {
	            logNotFoundProvider(target);
	        }
	    }
	    return getInstance(injector, token);
	}
	/**
	 * Set Class.contextType = InjectorContext
	 * @internal
	 * @param {Object} prototype React Component prototype
	 */
	function defineContextType(prototype) {
	    if (isReactComponent(prototype)) {
	        var constructor = prototype.constructor;
	        var className_1 = getDebugName(constructor);
	        if (constructor.contextType !== InjectorContext) {
	            if (constructor.contextType) {
	                logError("Decorator tries to overwrite existing " + className_1 + ".contextType");
	            }
	            else {
	                Object.defineProperty(constructor, 'contextType', {
	                    get: function () {
	                        return InjectorContext;
	                    },
	                    set: function () {
	                        logError("You are trying to overwrite " + className_1 + ".contextType = InjectorContext");
	                    }
	                });
	            }
	        }
	    }
	}

	/** @license React v16.13.1
	 * react-is.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	var b="function"===typeof Symbol&&Symbol.for,c=b?Symbol.for("react.element"):60103,d=b?Symbol.for("react.portal"):60106,e=b?Symbol.for("react.fragment"):60107,f=b?Symbol.for("react.strict_mode"):60108,g=b?Symbol.for("react.profiler"):60114,h=b?Symbol.for("react.provider"):60109,k=b?Symbol.for("react.context"):60110,l=b?Symbol.for("react.async_mode"):60111,m=b?Symbol.for("react.concurrent_mode"):60111,n=b?Symbol.for("react.forward_ref"):60112,p=b?Symbol.for("react.suspense"):60113,q=b?
	Symbol.for("react.suspense_list"):60120,r=b?Symbol.for("react.memo"):60115,t=b?Symbol.for("react.lazy"):60116,v=b?Symbol.for("react.block"):60121,w=b?Symbol.for("react.fundamental"):60117,x=b?Symbol.for("react.responder"):60118,y=b?Symbol.for("react.scope"):60119;
	function z(a){if("object"===typeof a&&null!==a){var u=a.$$typeof;switch(u){case c:switch(a=a.type,a){case l:case m:case e:case g:case f:case p:return a;default:switch(a=a&&a.$$typeof,a){case k:case n:case t:case r:case h:return a;default:return u}}case d:return u}}}function A(a){return z(a)===m}var AsyncMode=l;var ConcurrentMode=m;var ContextConsumer=k;var ContextProvider=h;var Element=c;var ForwardRef=n;var Fragment=e;var Lazy=t;var Memo=r;var Portal=d;
	var Profiler=g;var StrictMode=f;var Suspense=p;var isAsyncMode=function(a){return A(a)||z(a)===l};var isConcurrentMode=A;var isContextConsumer=function(a){return z(a)===k};var isContextProvider=function(a){return z(a)===h};var isElement=function(a){return "object"===typeof a&&null!==a&&a.$$typeof===c};var isForwardRef=function(a){return z(a)===n};var isFragment=function(a){return z(a)===e};var isLazy=function(a){return z(a)===t};
	var isMemo=function(a){return z(a)===r};var isPortal=function(a){return z(a)===d};var isProfiler=function(a){return z(a)===g};var isStrictMode=function(a){return z(a)===f};var isSuspense=function(a){return z(a)===p};
	var isValidElementType=function(a){return "string"===typeof a||"function"===typeof a||a===e||a===m||a===g||a===f||a===p||a===q||"object"===typeof a&&null!==a&&(a.$$typeof===t||a.$$typeof===r||a.$$typeof===h||a.$$typeof===k||a.$$typeof===n||a.$$typeof===w||a.$$typeof===x||a.$$typeof===y||a.$$typeof===v)};var typeOf=z;

	var reactIs_production_min = {
		AsyncMode: AsyncMode,
		ConcurrentMode: ConcurrentMode,
		ContextConsumer: ContextConsumer,
		ContextProvider: ContextProvider,
		Element: Element,
		ForwardRef: ForwardRef,
		Fragment: Fragment,
		Lazy: Lazy,
		Memo: Memo,
		Portal: Portal,
		Profiler: Profiler,
		StrictMode: StrictMode,
		Suspense: Suspense,
		isAsyncMode: isAsyncMode,
		isConcurrentMode: isConcurrentMode,
		isContextConsumer: isContextConsumer,
		isContextProvider: isContextProvider,
		isElement: isElement,
		isForwardRef: isForwardRef,
		isFragment: isFragment,
		isLazy: isLazy,
		isMemo: isMemo,
		isPortal: isPortal,
		isProfiler: isProfiler,
		isStrictMode: isStrictMode,
		isSuspense: isSuspense,
		isValidElementType: isValidElementType,
		typeOf: typeOf
	};

	var reactIs_development = createCommonjsModule(function (module, exports) {



	if (process.env.NODE_ENV !== "production") {
	  (function() {

	// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
	// nor polyfill, then a plain number is used for performance.
	var hasSymbol = typeof Symbol === 'function' && Symbol.for;
	var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
	var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
	var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
	var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
	var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
	var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
	var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
	// (unstable) APIs that have been removed. Can we remove the symbols?

	var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
	var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
	var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
	var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
	var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
	var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
	var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
	var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
	var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
	var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
	var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

	function isValidElementType(type) {
	  return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
	  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
	}

	function typeOf(object) {
	  if (typeof object === 'object' && object !== null) {
	    var $$typeof = object.$$typeof;

	    switch ($$typeof) {
	      case REACT_ELEMENT_TYPE:
	        var type = object.type;

	        switch (type) {
	          case REACT_ASYNC_MODE_TYPE:
	          case REACT_CONCURRENT_MODE_TYPE:
	          case REACT_FRAGMENT_TYPE:
	          case REACT_PROFILER_TYPE:
	          case REACT_STRICT_MODE_TYPE:
	          case REACT_SUSPENSE_TYPE:
	            return type;

	          default:
	            var $$typeofType = type && type.$$typeof;

	            switch ($$typeofType) {
	              case REACT_CONTEXT_TYPE:
	              case REACT_FORWARD_REF_TYPE:
	              case REACT_LAZY_TYPE:
	              case REACT_MEMO_TYPE:
	              case REACT_PROVIDER_TYPE:
	                return $$typeofType;

	              default:
	                return $$typeof;
	            }

	        }

	      case REACT_PORTAL_TYPE:
	        return $$typeof;
	    }
	  }

	  return undefined;
	} // AsyncMode is deprecated along with isAsyncMode

	var AsyncMode = REACT_ASYNC_MODE_TYPE;
	var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
	var ContextConsumer = REACT_CONTEXT_TYPE;
	var ContextProvider = REACT_PROVIDER_TYPE;
	var Element = REACT_ELEMENT_TYPE;
	var ForwardRef = REACT_FORWARD_REF_TYPE;
	var Fragment = REACT_FRAGMENT_TYPE;
	var Lazy = REACT_LAZY_TYPE;
	var Memo = REACT_MEMO_TYPE;
	var Portal = REACT_PORTAL_TYPE;
	var Profiler = REACT_PROFILER_TYPE;
	var StrictMode = REACT_STRICT_MODE_TYPE;
	var Suspense = REACT_SUSPENSE_TYPE;
	var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

	function isAsyncMode(object) {
	  {
	    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
	      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

	      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
	    }
	  }

	  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
	}
	function isConcurrentMode(object) {
	  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
	}
	function isContextConsumer(object) {
	  return typeOf(object) === REACT_CONTEXT_TYPE;
	}
	function isContextProvider(object) {
	  return typeOf(object) === REACT_PROVIDER_TYPE;
	}
	function isElement(object) {
	  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function isForwardRef(object) {
	  return typeOf(object) === REACT_FORWARD_REF_TYPE;
	}
	function isFragment(object) {
	  return typeOf(object) === REACT_FRAGMENT_TYPE;
	}
	function isLazy(object) {
	  return typeOf(object) === REACT_LAZY_TYPE;
	}
	function isMemo(object) {
	  return typeOf(object) === REACT_MEMO_TYPE;
	}
	function isPortal(object) {
	  return typeOf(object) === REACT_PORTAL_TYPE;
	}
	function isProfiler(object) {
	  return typeOf(object) === REACT_PROFILER_TYPE;
	}
	function isStrictMode(object) {
	  return typeOf(object) === REACT_STRICT_MODE_TYPE;
	}
	function isSuspense(object) {
	  return typeOf(object) === REACT_SUSPENSE_TYPE;
	}

	exports.AsyncMode = AsyncMode;
	exports.ConcurrentMode = ConcurrentMode;
	exports.ContextConsumer = ContextConsumer;
	exports.ContextProvider = ContextProvider;
	exports.Element = Element;
	exports.ForwardRef = ForwardRef;
	exports.Fragment = Fragment;
	exports.Lazy = Lazy;
	exports.Memo = Memo;
	exports.Portal = Portal;
	exports.Profiler = Profiler;
	exports.StrictMode = StrictMode;
	exports.Suspense = Suspense;
	exports.isAsyncMode = isAsyncMode;
	exports.isConcurrentMode = isConcurrentMode;
	exports.isContextConsumer = isContextConsumer;
	exports.isContextProvider = isContextProvider;
	exports.isElement = isElement;
	exports.isForwardRef = isForwardRef;
	exports.isFragment = isFragment;
	exports.isLazy = isLazy;
	exports.isMemo = isMemo;
	exports.isPortal = isPortal;
	exports.isProfiler = isProfiler;
	exports.isStrictMode = isStrictMode;
	exports.isSuspense = isSuspense;
	exports.isValidElementType = isValidElementType;
	exports.typeOf = typeOf;
	  })();
	}
	});
	var reactIs_development_1 = reactIs_development.AsyncMode;
	var reactIs_development_2 = reactIs_development.ConcurrentMode;
	var reactIs_development_3 = reactIs_development.ContextConsumer;
	var reactIs_development_4 = reactIs_development.ContextProvider;
	var reactIs_development_5 = reactIs_development.Element;
	var reactIs_development_6 = reactIs_development.ForwardRef;
	var reactIs_development_7 = reactIs_development.Fragment;
	var reactIs_development_8 = reactIs_development.Lazy;
	var reactIs_development_9 = reactIs_development.Memo;
	var reactIs_development_10 = reactIs_development.Portal;
	var reactIs_development_11 = reactIs_development.Profiler;
	var reactIs_development_12 = reactIs_development.StrictMode;
	var reactIs_development_13 = reactIs_development.Suspense;
	var reactIs_development_14 = reactIs_development.isAsyncMode;
	var reactIs_development_15 = reactIs_development.isConcurrentMode;
	var reactIs_development_16 = reactIs_development.isContextConsumer;
	var reactIs_development_17 = reactIs_development.isContextProvider;
	var reactIs_development_18 = reactIs_development.isElement;
	var reactIs_development_19 = reactIs_development.isForwardRef;
	var reactIs_development_20 = reactIs_development.isFragment;
	var reactIs_development_21 = reactIs_development.isLazy;
	var reactIs_development_22 = reactIs_development.isMemo;
	var reactIs_development_23 = reactIs_development.isPortal;
	var reactIs_development_24 = reactIs_development.isProfiler;
	var reactIs_development_25 = reactIs_development.isStrictMode;
	var reactIs_development_26 = reactIs_development.isSuspense;
	var reactIs_development_27 = reactIs_development.isValidElementType;
	var reactIs_development_28 = reactIs_development.typeOf;

	var reactIs = createCommonjsModule(function (module) {

	if (process.env.NODE_ENV === 'production') {
	  module.exports = reactIs_production_min;
	} else {
	  module.exports = reactIs_development;
	}
	});

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */
	var REACT_STATICS = {
	  childContextTypes: true,
	  contextType: true,
	  contextTypes: true,
	  defaultProps: true,
	  displayName: true,
	  getDefaultProps: true,
	  getDerivedStateFromError: true,
	  getDerivedStateFromProps: true,
	  mixins: true,
	  propTypes: true,
	  type: true
	};
	var KNOWN_STATICS = {
	  name: true,
	  length: true,
	  prototype: true,
	  caller: true,
	  callee: true,
	  arguments: true,
	  arity: true
	};
	var FORWARD_REF_STATICS = {
	  '$$typeof': true,
	  render: true,
	  defaultProps: true,
	  displayName: true,
	  propTypes: true
	};
	var MEMO_STATICS = {
	  '$$typeof': true,
	  compare: true,
	  defaultProps: true,
	  displayName: true,
	  propTypes: true,
	  type: true
	};
	var TYPE_STATICS = {};
	TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
	TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;

	function getStatics(component) {
	  // React v16.11 and below
	  if (reactIs.isMemo(component)) {
	    return MEMO_STATICS;
	  } // React v16.12 and above


	  return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
	}

	var defineProperty = Object.defineProperty;
	var getOwnPropertyNames = Object.getOwnPropertyNames;
	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var getPrototypeOf = Object.getPrototypeOf;
	var objectPrototype = Object.prototype;
	function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
	  if (typeof sourceComponent !== 'string') {
	    // don't hoist over string (html) components
	    if (objectPrototype) {
	      var inheritedComponent = getPrototypeOf(sourceComponent);

	      if (inheritedComponent && inheritedComponent !== objectPrototype) {
	        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
	      }
	    }

	    var keys = getOwnPropertyNames(sourceComponent);

	    if (getOwnPropertySymbols) {
	      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
	    }

	    var targetStatics = getStatics(targetComponent);
	    var sourceStatics = getStatics(sourceComponent);

	    for (var i = 0; i < keys.length; ++i) {
	      var key = keys[i];

	      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
	        var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

	        try {
	          // Avoid failures from read-only properties
	          defineProperty(targetComponent, key, descriptor);
	        } catch (e) {}
	      }
	    }
	  }

	  return targetComponent;
	}

	var hoistNonReactStatics_cjs = hoistNonReactStatics;

	var IS_BINDING = (typeof Symbol === 'function' ? Symbol() : '__binding__');
	/**
	 * Bind type to specified class.
	 * @param constructor Service constructor
	 * @returns Dependency resolver
	 */
	function toClass(constructor) {
	    {
	        if (!isFunction(constructor)) {
	            logError("Class " + getDebugName(constructor) + " is not a valid dependency");
	        }
	    }
	    return asBinding(function (injector) {
	        var instance = new constructor();
	        if (!instance[INJECTOR]) {
	            instance[INJECTOR] = injector;
	        }
	        return instance;
	    });
	}
	function toFactory(depsOrFactory, factory) {
	    {
	        if (factory) {
	            if (!Array.isArray(depsOrFactory)) {
	                logError("Dependency array " + getDebugName(depsOrFactory) + " is invalid");
	            }
	            if (!isFunction(factory)) {
	                logError("Factory " + getDebugName(factory) + " is not a valid dependency");
	            }
	        }
	        else if (!isFunction(depsOrFactory)) {
	            logError("Factory " + getDebugName(depsOrFactory) + " is not a valid dependency");
	        }
	    }
	    return asBinding(factory ? function (injector) { return factory.apply(void 0, depsOrFactory.map(function (token) { return getInstance(injector, token); })); } : depsOrFactory);
	}
	/**
	 * Bind type to specified value.
	 * @param  value
	 * @returns Dependency resolver
	 */
	function toValue(value) {
	    {
	        if (value === undefined) {
	            logError("Please specify some value");
	        }
	    }
	    return asBinding(function () { return value; });
	}
	/**
	 * Bind type to existing instance located by token.
	 * @param {Token} token
	 * @return Dependency resolver
	 */
	function toExisting(token) {
	    {
	        if (!isFunction(token)) {
	            logError("Token " + getDebugName(token) + " is not a valid dependency injection token");
	        }
	    }
	    return asBinding(function (injector) { return getInstance(injector, token); });
	}
	/**
	 * Mark function as binding function.
	 * @internal
	 * @param {Function} binding
	 * @returns {Function}
	 */
	function asBinding(binding) {
	    binding[IS_BINDING] = true;
	    return binding;
	}
	/**
	 * Add bindings to bindings Map
	 * @internal
	 */
	function addBindings(bindingMap, definitions) {
	    definitions.forEach(function (definition) {
	        var _a;
	        var token, binding;
	        if (Array.isArray(definition)) {
	            token = definition[0], _a = definition[1], binding = _a === void 0 ? token : _a;
	        }
	        else {
	            token = binding = definition;
	        }
	        {
	            if (!isToken(token) || !isFunction(binding)) {
	                logIncorrectBinding(token, binding);
	            }
	        }
	        // @ts-ignore
	        bindingMap.set(token, binding[IS_BINDING] ? binding : toClass(binding));
	    });
	}

	var Initialized = (typeof Symbol === 'function' ? Symbol() : '__init__');
	var InjectedService = /** @class */ (function () {
	    function InjectedService() {
	    }
	    return InjectedService;
	}());
	/**
	 * Decorator or HOC that register dependency injection bindings
	 * in scope of decorated class
	 * @param definitions Dependency injection configuration
	 * @returns Decorator or HOC
	 */
	var provider = function () {
	    var definitions = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        definitions[_i] = arguments[_i];
	    }
	    return function (Wrapped) {
	        var bindingMap = new Map();
	        addBindings(bindingMap, definitions);
	        var Provider = /** @class */ (function (_super) {
	            __extends(Provider, _super);
	            function Provider() {
	                var _a;
	                var _this = _super.apply(this, arguments) || this;
	                _this._parent = (_a = _this.context) === null || _a === void 0 ? void 0 : _a.injector;
	                _this._bindingMap = bindingMap;
	                _this._instanceMap = new Map();
	                return _this;
	            }
	            Provider.prototype._initInstance = function (instance) {
	                var _this = this;
	                if (instance instanceof InjectedService && !instance[Initialized]) {
	                    instance.initProvider(function () { return _this.setState({ injector: _this }); });
	                    instance[Initialized] = true;
	                }
	            };
	            Provider.prototype.componentDidMount = function () {
	                var _this = this;
	                this._instanceMap.forEach(function (instance) {
	                    _this._initInstance(instance);
	                });
	            };
	            Provider.prototype.componentWillUnmount = function () {
	                this._instanceMap.forEach(function (instance) {
	                    if (isObject(instance) && isFunction(instance.dispose)) {
	                        instance.dispose();
	                    }
	                });
	            };
	            Provider.prototype.render = function () {
	                return react.createElement(InjectorContext.Provider, { value: { injector: this } }, react.createElement(Wrapped, this.props));
	            };
	            /**
	             * Register dependency injection bindings in scope of decorated class
	             * @param {...Definition} definitions Dependency injection configuration
	             */
	            Provider.register = function () {
	                var definitions = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    definitions[_i] = arguments[_i];
	                }
	                addBindings(bindingMap, definitions);
	            };
	            Provider.WrappedComponent = Wrapped;
	            return Provider;
	        }(Injector));
	        {
	            Provider.displayName = "Provider(" + (Wrapped.displayName || Wrapped.name) + ")";
	            Object.defineProperty(Provider, 'contextType', {
	                get: function () {
	                    return InjectorContext;
	                },
	                set: function () {
	                    logError("You are trying to overwrite " + Provider.displayName + ".contextType = InjectorContext");
	                }
	            });
	        }
	        // static fields from component should be visible on the generated Consumer
	        return hoistNonReactStatics_cjs(Provider, Wrapped);
	    };
	};
	/**
	 * Decorator that lazily registers class in scope of specified Provider.
	 * @param getProvider Lambda function that returns Provider
	 * @param biding Dependency injection binding
	 * @returns Decorator
	 */
	var registerIn = function (getProvider, binding) { return function (constructor) {
	    registrationQueue.push(function () {
	        {
	            var provider_1 = getProvider();
	            if (!isFunction(provider_1) || !(provider_1.prototype instanceof Injector)) {
	                logError(getDebugName(provider_1) + " is not a valid Provider. Please use:\n" + "@registerIn(() => MyProvider)\n" + ("class " + getDebugName(constructor) + " {}\n"));
	            }
	            else {
	                provider_1.register(binding ? [constructor, binding] : constructor);
	            }
	        }
	    });
	    return constructor;
	}; };

	/**
	 * React hook for resolving a class instance that registered by some Provider in hierarchy.
	 * Instance is cached in Provider that registers it's class.
	 * @param  token Dependency injection token
	 * @returns Resolved class instance
	 */
	function useInstance(token) {
	    var _a;
	    var ref = react.useRef(undefined);
	    var injector = (_a = react.useContext(InjectorContext)) === null || _a === void 0 ? void 0 : _a.injector;
	    {
	        if (!injector) {
	            logNotFoundProvider();
	        }
	    }
	    return ref.current || (ref.current = getInstance(injector, token));
	}
	/**
	 * React hook for resolving a class instances that registered by some Provider in hierarchy.
	 * Instances are cached in Provider that registers it's classes.
	 * @param  tokens Dependency injection tokens
	 * @returns Resolved class instances
	 */
	function useInstances() {
	    var _a;
	    var tokens = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        tokens[_i] = arguments[_i];
	    }
	    var ref = react.useRef(null);
	    var injector = (_a = react.useContext(InjectorContext)) === null || _a === void 0 ? void 0 : _a.injector;
	    {
	        if (!injector) {
	            logNotFoundProvider();
	        }
	    }
	    return (ref.current ||
	        (ref.current = tokens.map(function (token) { return getInstance(injector, token); })));
	}

	function n$1(n){for(var t=arguments.length,r=Array(t>1?t-1:0),e=1;e<t;e++)r[e-1]=arguments[e];if("production"!==process.env.NODE_ENV){var i=L[n],o=i?"function"==typeof i?i.apply(null,r):i:"unknown error nr: "+n;throw Error("[Immer] "+o)}throw Error("[Immer] minified error nr: "+n+(r.length?" "+r.join(","):"")+". Find the full error at: https://bit.ly/3cXEKWf")}function t$1(n){return !!n&&!!n[G]}function r$1(n){return !!n&&(function(n){if(!n||"object"!=typeof n)return !1;var t=Object.getPrototypeOf(n);return !t||t===Object.prototype}(n)||Array.isArray(n)||!!n[B]||!!n.constructor[B]||c$1(n)||s(n))}function e$1(n){if(n&&n[G])return n[G].t}function i(n,t,r){void 0===r&&(r=!1),0===o(n)?(r?Object.keys:Q)(n).forEach((function(r){return t(r,n[r],n)})):n.forEach((function(r,e){return t(e,r,n)}));}function o(n){var t=n[G];return t?t.i>3?t.i-4:t.i:Array.isArray(n)?1:c$1(n)?2:s(n)?3:0}function u(n,t){return 2===o(n)?n.has(t):Object.prototype.hasOwnProperty.call(n,t)}function a(n,t){return 2===o(n)?n.get(t):n[t]}function f$1(n,t){return n===t?0!==n||1/n==1/t:n!=n&&t!=t}function c$1(n){return U&&n instanceof Map}function s(n){return W&&n instanceof Set}function v$1(n){return n.o||n.t}function p$1(t,r){if(void 0===r&&(r=!1),Array.isArray(t))return t.slice();var e=Object.create(Object.getPrototypeOf(t));return i(t,(function(i){if(i!==G){var o=Object.getOwnPropertyDescriptor(t,i),u=o.value;o.get&&(r||n$1(1),u=o.get.call(t)),o.enumerable?e[i]=u:Object.defineProperty(e,i,{value:u,writable:!0,configurable:!0});}})),e}function d$1(n,e){t$1(n)||h$1(n)||!r$1(n)||(o(n)>1&&(n.set=n.add=n.clear=n.delete=l$1),Object.freeze(n),e&&i(n,(function(n,t){return d$1(t,!0)}),!0));}function l$1(){n$1(2);}function h$1(n){return null==n||"object"!=typeof n||Object.isFrozen(n)}function y$1(t){var r=V[t];return r||n$1("production"!==process.env.NODE_ENV?18:19,t),r}function b$1(n,t){V[n]=t;}function m$1(){return "production"===process.env.NODE_ENV||K||n$1(0),K}function _(n,t){t&&(y$1("Patches"),n.u=[],n.s=[],n.v=t);}function j(n){O(n),n.p.forEach(w$1),n.p=null;}function O(n){n===K&&(K=n.l);}function g$1(n){return K={p:[],l:K,h:n,m:!0,_:0}}function w$1(n){var t=n[G];0===t.i||1===t.i?t.j():t.O=!0;}function S(t,e){e._=e.p.length;var i=e.p[0],o=void 0!==t&&t!==i;return e.h.g||y$1("ES5").S(e,t,o),o?(i[G].P&&(j(e),n$1(4)),r$1(t)&&(t=P(e,t),e.l||A$1(e,t)),e.u&&y$1("Patches").M(i[G],t,e.u,e.s)):t=P(e,i,[]),j(e),e.u&&e.v(e.u,e.s),t!==q$1?t:void 0}function P(n,t,r){if(h$1(t))return t;var e=t[G];if(!e)return i(t,(function(i,o){return M(n,e,t,i,o,r)}),!0),t;if(e.A!==n)return t;if(!e.P)return A$1(n,e.t,!0),e.t;if(!e.I){e.I=!0,e.A._--;var o=4===e.i||5===e.i?e.o=p$1(e.k,!0):e.o;i(o,(function(t,i){return M(n,e,o,t,i,r)})),A$1(n,o,!1),r&&n.u&&y$1("Patches").R(e,r,n.u,n.s);}return e.o}function M(e,i,c,s,v,p){if("production"!==process.env.NODE_ENV&&v===c&&n$1(5),t$1(v)){var d=P(e,v,p&&i&&3!==i.i&&!u(i.D,s)?p.concat(s):void 0);if(h=s,y=d,2===(b=o(l=c))?l.set(h,y):3===b?(l.delete(h),l.add(y)):l[h]=y,!t$1(d))return;e.m=!1;}var l,h,y,b;if((!i||!f$1(v,a(i.t,s)))&&r$1(v)){if(!e.h.N&&e._<1)return;P(e,v),i&&i.A.l||A$1(e,v);}}function A$1(n,t,r){void 0===r&&(r=!1),n.h.N&&n.m&&d$1(t,r);}function x$1(n,t){var r=n[G],e=Reflect.getOwnPropertyDescriptor(r?v$1(r):n,t);return e&&e.value}function z$1(n){if(!n.P){if(n.P=!0,0===n.i||1===n.i){var t=n.o=p$1(n.t);i(n.p,(function(n,r){t[n]=r;})),n.p=void 0;}n.l&&z$1(n.l);}}function I(n){n.o||(n.o=p$1(n.t));}function E(n,t,r){var e=c$1(t)?y$1("MapSet").T(t,r):s(t)?y$1("MapSet").F(t,r):n.g?function(n,t){var r=Array.isArray(n),e={i:r?1:0,A:t?t.A:m$1(),P:!1,I:!1,D:{},l:t,t:n,k:null,p:{},o:null,j:null,C:!1},i=e,o=Y;r&&(i=[e],o=Z);var u=Proxy.revocable(i,o),a=u.revoke,f=u.proxy;return e.k=f,e.j=a,f}(t,r):y$1("ES5").J(t,r);return (r?r.A:m$1()).p.push(e),e}function k$1(n,t){n.g?z$1(t):y$1("ES5").K(t);}function R(){function e(n,t){var r=n[G];if(r&&!r.$){r.$=!0;var e=n[t];return r.$=!1,e}return n[t]}function o(n){n.P||(n.P=!0,n.l&&o(n.l));}function a(n){n.o||(n.o=c(n.t));}function c(n){var t=n&&n[G];if(t){t.$=!0;var r=p$1(t.k,!0);return t.$=!1,r}return p$1(n)}function s(n){for(var t=n.length-1;t>=0;t--){var r=n[t][G];if(!r.P)switch(r.i){case 5:l(r)&&o(r);break;case 4:d(r)&&o(r);}}}function d(n){for(var t=n.t,r=n.k,e=Object.keys(r),i=e.length-1;i>=0;i--){var o=e[i],a=t[o];if(void 0===a&&!u(t,o))return !0;var c=r[o],s=c&&c[G];if(s?s.t!==a:!f$1(c,a))return !0}return e.length!==Object.keys(t).length}function l(n){var t=n.k;if(t.length!==n.t.length)return !0;var r=Object.getOwnPropertyDescriptor(t,t.length-1);return !(!r||r.get)}function h(t){t.O&&n$1(3,JSON.stringify(v$1(t)));}var y={};b$1("ES5",{J:function(n,t){var u=Array.isArray(n),s=c(n);i(s,(function(t){!function(n,t,i){var u=y[t];u?u.enumerable=i:y[t]=u={enumerable:i,get:function(){return function(n,t){h(n);var i=e(v$1(n),t);return n.$?i:i===e(n.t,t)&&r$1(i)?(a(n),n.o[t]=E(n.A.h,i,n)):i}(this[G],t)},set:function(n){!function(n,t,r){if(h(n),n.D[t]=!0,!n.P){if(f$1(r,e(v$1(n),t)))return;o(n),a(n);}n.o[t]=r;}(this[G],t,n);}},Object.defineProperty(n,t,u);}(s,t,u||function(n,t){var r=Object.getOwnPropertyDescriptor(n,t);return !(!r||!r.enumerable)}(n,t));}));var p={i:u?5:4,A:t?t.A:m$1(),P:!1,$:!1,I:!1,D:{},l:t,t:n,k:s,o:null,O:!1,C:!1};return Object.defineProperty(s,G,{value:p,writable:!0}),s},K:o,S:function(n,r,e){n.p.forEach((function(n){n[G].$=!0;})),e?t$1(r)&&r[G].A===n&&s(n.p):(n.u&&function n(t){if(t&&"object"==typeof t){var r=t[G];if(r){var e=r.t,a=r.k,f=r.D,c=r.i;if(4===c)i(a,(function(t){t!==G&&(void 0!==e[t]||u(e,t)?f[t]||n(a[t]):(f[t]=!0,o(r)));})),i(e,(function(n){void 0!==a[n]||u(a,n)||(f[n]=!1,o(r));}));else if(5===c){if(l(r)&&(o(r),f.length=!0),a.length<e.length)for(var s=a.length;s<e.length;s++)f[s]=!1;else for(var v=e.length;v<a.length;v++)f[v]=!0;for(var p=Math.min(a.length,e.length),d=0;d<p;d++)void 0===f[d]&&n(a[d]);}}}}(n.p[0]),s(n.p));}});}function N(){function t(n,t){function r(){this.constructor=n;}u(n,t),n.prototype=(r.prototype=t.prototype,new r);}function e(n){n.o||(n.D=new Map,n.o=new Map(n.t));}function i(n){n.o||(n.o=new Set,n.t.forEach((function(t){if(r$1(t)){var e=E(n.A.h,t,n);n.p.set(t,e),n.o.add(e);}else n.o.add(t);})));}function o(t){t.O&&n$1(3,JSON.stringify(v$1(t)));}var u=function(n,t){return (u=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,t){n.__proto__=t;}||function(n,t){for(var r in t)t.hasOwnProperty(r)&&(n[r]=t[r]);})(n,t)},a=function(){function n(n,t){return this[G]={i:2,l:t,A:t?t.A:m$1(),P:!1,I:!1,o:void 0,D:void 0,t:n,k:this,C:!1,O:!1},this}t(n,Map);var i=n.prototype;return Object.defineProperty(i,"size",{get:function(){return v$1(this[G]).size}}),i.has=function(n){return v$1(this[G]).has(n)},i.set=function(n,t){var r=this[G];return o(r),v$1(r).get(n)!==t&&(e(r),k$1(r.A.h,r),r.D.set(n,!0),r.o.set(n,t),r.D.set(n,!0)),this},i.delete=function(n){if(!this.has(n))return !1;var t=this[G];return o(t),e(t),k$1(t.A.h,t),t.D.set(n,!1),t.o.delete(n),!0},i.clear=function(){var n=this[G];return o(n),e(n),k$1(n.A.h,n),n.D=new Map,n.o.clear()},i.forEach=function(n,t){var r=this;v$1(this[G]).forEach((function(e,i){n.call(t,r.get(i),i,r);}));},i.get=function(n){var t=this[G];o(t);var i=v$1(t).get(n);if(t.I||!r$1(i))return i;if(i!==t.t.get(n))return i;var u=E(t.A.h,i,t);return e(t),t.o.set(n,u),u},i.keys=function(){return v$1(this[G]).keys()},i.values=function(){var n,t=this,r=this.keys();return (n={})[H]=function(){return t.values()},n.next=function(){var n=r.next();return n.done?n:{done:!1,value:t.get(n.value)}},n},i.entries=function(){var n,t=this,r=this.keys();return (n={})[H]=function(){return t.entries()},n.next=function(){var n=r.next();if(n.done)return n;var e=t.get(n.value);return {done:!1,value:[n.value,e]}},n},i[H]=function(){return this.entries()},n}(),f=function(){function n(n,t){return this[G]={i:3,l:t,A:t?t.A:m$1(),P:!1,I:!1,o:void 0,t:n,k:this,p:new Map,O:!1,C:!1},this}t(n,Set);var r=n.prototype;return Object.defineProperty(r,"size",{get:function(){return v$1(this[G]).size}}),r.has=function(n){var t=this[G];return o(t),t.o?!!t.o.has(n)||!(!t.p.has(n)||!t.o.has(t.p.get(n))):t.t.has(n)},r.add=function(n){var t=this[G];return o(t),this.has(n)||(i(t),k$1(t.A.h,t),t.o.add(n)),this},r.delete=function(n){if(!this.has(n))return !1;var t=this[G];return o(t),i(t),k$1(t.A.h,t),t.o.delete(n)||!!t.p.has(n)&&t.o.delete(t.p.get(n))},r.clear=function(){var n=this[G];return o(n),i(n),k$1(n.A.h,n),n.o.clear()},r.values=function(){var n=this[G];return o(n),i(n),n.o.values()},r.entries=function(){var n=this[G];return o(n),i(n),n.o.entries()},r.keys=function(){return this.values()},r[H]=function(){return this.values()},r.forEach=function(n,t){for(var r=this.values(),e=r.next();!e.done;)n.call(t,e.value,e.value,this),e=r.next();},n}();b$1("MapSet",{T:function(n,t){return new a(n,t)},F:function(n,t){return new f(n,t)}});}var J,K,$="undefined"!=typeof Symbol&&"symbol"==typeof Symbol("x"),U="undefined"!=typeof Map,W="undefined"!=typeof Set,X="undefined"!=typeof Proxy&&void 0!==Proxy.revocable&&"undefined"!=typeof Reflect,q$1=$?Symbol("immer-nothing"):((J={})["immer-nothing"]=!0,J),B=$?Symbol("immer-draftable"):"__$immer_draftable",G=$?Symbol("immer-state"):"__$immer_state",H="undefined"!=typeof Symbol&&Symbol.iterator||"@@iterator",L={0:"Illegal state",1:"Immer drafts cannot have computed properties",2:"This object has been frozen and should not be mutated",3:function(n){return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? "+n},4:"An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",5:"Immer forbids circular references",6:"The first or second argument to `produce` must be a function",7:"The third argument to `produce` must be a function or undefined",8:"First argument to `createDraft` must be a plain object, an array, or an immerable object",9:"First argument to `finishDraft` must be a draft returned by `createDraft`",10:"The given draft is already finalized",11:"Object.defineProperty() cannot be used on an Immer draft",12:"Object.setPrototypeOf() cannot be used on an Immer draft",13:"Immer only supports deleting array indices",14:"Immer only supports setting array indices and the 'length' property",15:function(n){return "Cannot apply patch, path doesn't resolve: "+n},16:'Sets cannot have "replace" patches.',17:function(n){return "Unsupported patch operation: "+n},18:function(n){return "The plugin for '"+n+"' has not been loaded into Immer. To enable the plugin, import and call `enable"+n+"()` when initializing your application."},19:function(n){return "plugin not loaded: "+n},20:"Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available"},Q="undefined"!=typeof Reflect&&Reflect.ownKeys?Reflect.ownKeys:void 0!==Object.getOwnPropertySymbols?function(n){return Object.getOwnPropertyNames(n).concat(Object.getOwnPropertySymbols(n))}:Object.getOwnPropertyNames,V={},Y={get:function(n,t){if(t===G)return n;var e=n.p;if(!n.P&&u(e,t))return e[t];var i=v$1(n)[t];if(n.I||!r$1(i))return i;if(n.P){if(i!==x$1(n.t,t))return i;e=n.o;}return e[t]=E(n.A.h,i,n)},has:function(n,t){return t in v$1(n)},ownKeys:function(n){return Reflect.ownKeys(v$1(n))},set:function(n,t,r){if(!n.P){var e=x$1(n.t,t);if(r?f$1(e,r)||r===n.p[t]:f$1(e,r)&&t in n.t)return !0;I(n),z$1(n);}return n.D[t]=!0,n.o[t]=r,!0},deleteProperty:function(n,t){return void 0!==x$1(n.t,t)||t in n.t?(n.D[t]=!1,I(n),z$1(n)):n.D[t]&&delete n.D[t],n.o&&delete n.o[t],!0},getOwnPropertyDescriptor:function(n,t){var r=v$1(n),e=Reflect.getOwnPropertyDescriptor(r,t);return e&&(e.writable=!0,e.configurable=1!==n.i||"length"!==t),e},defineProperty:function(){n$1(11);},getPrototypeOf:function(n){return Object.getPrototypeOf(n.t)},setPrototypeOf:function(){n$1(12);}},Z={};i(Y,(function(n,t){Z[n]=function(){return arguments[0]=arguments[0][0],t.apply(this,arguments)};})),Z.deleteProperty=function(t,r){return "production"!==process.env.NODE_ENV&&isNaN(parseInt(r))&&n$1(13),Y.deleteProperty.call(this,t[0],r)},Z.set=function(t,r,e){return "production"!==process.env.NODE_ENV&&"length"!==r&&isNaN(parseInt(r))&&n$1(14),Y.set.call(this,t[0],r,e,t[0])};var nn=function(){function e(n){this.g=X,this.N="production"!==process.env.NODE_ENV,"boolean"==typeof(null==n?void 0:n.useProxies)&&this.setUseProxies(n.useProxies),"boolean"==typeof(null==n?void 0:n.autoFreeze)&&this.setAutoFreeze(n.autoFreeze),this.produce=this.produce.bind(this),this.produceWithPatches=this.produceWithPatches.bind(this);}var i=e.prototype;return i.produce=function(t,e,i){if("function"==typeof t&&"function"!=typeof e){var o=e;e=t;var u=this;return function(n){var t=this;void 0===n&&(n=o);for(var r=arguments.length,i=Array(r>1?r-1:0),a=1;a<r;a++)i[a-1]=arguments[a];return u.produce(n,(function(n){var r;return (r=e).call.apply(r,[t,n].concat(i))}))}}var a;if("function"!=typeof e&&n$1(6),void 0!==i&&"function"!=typeof i&&n$1(7),r$1(t)){var f=g$1(this),c=E(this,t,void 0),s=!0;try{a=e(c),s=!1;}finally{s?j(f):O(f);}return "undefined"!=typeof Promise&&a instanceof Promise?a.then((function(n){return _(f,i),S(n,f)}),(function(n){throw j(f),n})):(_(f,i),S(a,f))}if((a=e(t))!==q$1)return void 0===a&&(a=t),this.N&&d$1(a,!0),a},i.produceWithPatches=function(n,t){var r,e,i=this;return "function"==typeof n?function(t){for(var r=arguments.length,e=Array(r>1?r-1:0),o=1;o<r;o++)e[o-1]=arguments[o];return i.produceWithPatches(t,(function(t){return n.apply(void 0,[t].concat(e))}))}:[this.produce(n,t,(function(n,t){r=n,e=t;})),r,e]},i.createDraft=function(t){r$1(t)||n$1(8);var e=g$1(this),i=E(this,t,void 0);return i[G].C=!0,O(e),i},i.finishDraft=function(t,r){var e=t&&t[G];"production"!==process.env.NODE_ENV&&(e&&e.C||n$1(9),e.I&&n$1(10));var i=e.A;return _(i,r),S(void 0,i)},i.setAutoFreeze=function(n){this.N=n;},i.setUseProxies=function(t){X||n$1(20),this.g=t;},i.applyPatches=function(n,r){var e;for(e=r.length-1;e>=0;e--){var i=r[e];if(0===i.path.length&&"replace"===i.op){n=i.value;break}}var o=y$1("Patches").U;return t$1(n)?o(n,r):this.produce(n,(function(n){return o(n,r.slice(e+1))}))},e}(),tn=new nn,en=tn.produceWithPatches.bind(tn),on=tn.setAutoFreeze.bind(tn),un=tn.setUseProxies.bind(tn),an=tn.applyPatches.bind(tn),fn=tn.createDraft.bind(tn),cn=tn.finishDraft.bind(tn);

	var PROVIDER = (typeof Symbol === 'function' ? Symbol() : '__store__');
	var STORES = (typeof Symbol === 'function' ? Symbol() : '__stores__');
	var REFRESH = (typeof Symbol === 'function' ? Symbol() : '__refresh__');
	/**
	 * @internal
	 */
	var MutationProvider = /** @class */ (function () {
	    function MutationProvider(service) {
	        this.count = 0;
	        this.service = service;
	    }
	    MutationProvider.prototype.start = function (inc) {
	        var _this = this;
	        var _a;
	        if (inc === void 0) { inc = true; }
	        if (this.count == 0) {
	            var draft_1 = (this.draft = (_a = this.draft) !== null && _a !== void 0 ? _a : fn(this.service));
	            this.service[STORES].forEach(function (x) {
	                _this.service[x] = draft_1[x];
	            });
	        }
	        if (inc)
	            this.count++;
	    };
	    MutationProvider.prototype.finish = function (refresh, dec) {
	        var _this = this;
	        if (refresh === void 0) { refresh = true; }
	        if (dec === void 0) { dec = true; }
	        if (this.count == 0) {
	            console.warn('the finish method must be called after corresponding start method');
	        }
	        else {
	            if (dec)
	                this.count--;
	            if (this.count == 0) {
	                var draft_2 = this.draft;
	                if (draft_2) {
	                    this.service[STORES].forEach(function (x) {
	                        draft_2[x] = _this.service[x];
	                    });
	                    var newstate_1 = cn(draft_2);
	                    this.service[STORES].forEach(function (x) {
	                        _this.service[x] = newstate_1[x];
	                    });
	                    this.draft = undefined;
	                }
	                else {
	                    {
	                        logError('previous state is absent');
	                    }
	                }
	            }
	        }
	        if (refresh) {
	            this.service.RefreshContext();
	        }
	    };
	    return MutationProvider;
	}());
	// @ts-ignore
	var ImmutableService = /** @class */ (function (_super) {
	    __extends(ImmutableService, _super);
	    function ImmutableService() {
	        var _a;
	        var _this = _super.call(this) || this;
	        _this[STORES] = (_a = _this[STORES]) !== null && _a !== void 0 ? _a : [];
	        _this[B] = true;
	        _this[PROVIDER] = new MutationProvider(_this);
	        return _this;
	    }
	    // @ts-ignore
	    ImmutableService.prototype.initProvider = function (refresh) {
	        this[REFRESH] = refresh;
	        this[PROVIDER].start();
	        this[PROVIDER].finish();
	    };
	    ImmutableService.prototype.RefreshContext = function () {
	        if (this[REFRESH]) {
	            this[REFRESH]();
	        }
	    };
	    ImmutableService.prototype.waitForAsync = function (promise) {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        this[PROVIDER].finish(true, false);
	                        _a.label = 1;
	                    case 1:
	                        _a.trys.push([1, , 3, 4]);
	                        return [4 /*yield*/, promise];
	                    case 2: return [2 /*return*/, _a.sent()];
	                    case 3:
	                        this[PROVIDER].start(false);
	                        return [7 /*endfinally*/];
	                    case 4: return [2 /*return*/];
	                }
	            });
	        });
	    };
	    return ImmutableService;
	}(InjectedService));

	/**
	 * Property Decorator convert property to immutable
	 * Changes for such property allowed only from methods marked with @action or @asyncAction decorator
	 */
	function store() {
	    return function (target, propertyKey) {
	        var _a;
	        var service = target;
	        service[STORES] = (_a = service[STORES]) !== null && _a !== void 0 ? _a : [];
	        service[STORES].push(propertyKey);
	    };
	}
	/**
	 * Method decorator allow to change properties marked with @store within method.
	 * After method execution, the React Context in which the service is located will be updated
	 */
	// export function asyncAction() {
	// 	return function(target: ImmutableService, propertyKey: string, descriptor: PropertyDescriptor) {
	// 		const fn = descriptor.value as Function;
	// 		descriptor.value = async function(args: any[]) {
	// 			(this as ImmutableServiceInternal)[PROVIDER].start();
	// 			let res = undefined;
	// 			try {
	// 				res = await fn.call(this, args);
	// 			} finally {
	// 				(this as ImmutableServiceInternal)[PROVIDER].finish();
	// 			}
	// 			return res;
	// 		};
	// 	};
	// }
	var waitForFinish = function (service, promise) { return __awaiter(void 0, void 0, void 0, function () {
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                _a.trys.push([0, , 2, 3]);
	                return [4 /*yield*/, promise];
	            case 1: return [2 /*return*/, _a.sent()];
	            case 2:
	                service[PROVIDER].finish();
	                return [7 /*endfinally*/];
	            case 3: return [2 /*return*/];
	        }
	    });
	}); };
	var checkForPromise = function (value) {
	    //return value instanceof Promise
	    return value && typeof value['then'] === 'function';
	};
	/**
	 * Method decorator allow to change properties marked with @store within method.
	 * After method execution, the React Context in which the service is located will be updated
	 */
	function action() {
	    return function (_target, _propertyKey, descriptor) {
	        var fn = descriptor.value;
	        descriptor.value = function (args) {
	            this[PROVIDER].start();
	            var isPromise = false;
	            try {
	                var res = fn.call(this, args);
	                isPromise = checkForPromise(res);
	                if (isPromise) {
	                    return waitForFinish(this, res);
	                }
	                else {
	                    return res;
	                }
	            }
	            finally {
	                if (!isPromise) {
	                    this[PROVIDER].finish();
	                }
	            }
	        };
	    };
	}

	var ComponentWithServices = function (_a) {
	    var services = _a.services, children = _a.children, deps = _a.deps;
	    var ComponentWithService = react.useCallback((function () {
	        var fn = function () { return children; };
	        {
	            fn.displayName = 'ComponentWithServices.Children';
	        }
	        return provider.apply(void 0, services)(fn);
	    })(), deps !== null && deps !== void 0 ? deps : []);
	    return react.createElement(ComponentWithService);
	};

	exports.InjectedService = InjectedService;
	exports.inject = inject;
	exports.provider = provider;
	exports.registerIn = registerIn;
	exports.Inject = inject;
	exports.Provider = provider;
	exports.RegisterIn = registerIn;
	exports.toClass = toClass;
	exports.toExisting = toExisting;
	exports.toFactory = toFactory;
	exports.toValue = toValue;
	exports.useInstance = useInstance;
	exports.useInstances = useInstances;
	exports.ImmutableService = ImmutableService;
	exports.action = action;
	exports.store = store;
	exports.original = e$1;
	exports.enableES5 = R;
	exports.enableMapSet = N;
	exports.ComponentWithServices = ComponentWithServices;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.umd.js.map
