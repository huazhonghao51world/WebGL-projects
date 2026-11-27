import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// services/platform/dist/worker.js
import path2 from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// services/platform/dist/store.js
import { DatabaseSync } from "node:sqlite";
import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile, link, unlink } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import path from "node:path";

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key2 in object) {
      if (Object.prototype.hasOwnProperty.call(object, key2)) {
        keys.push(key2);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path3, errorMaps, issueData } = params;
  const fullPath = [...path3, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key2 = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key: key2,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key: key2, value } = pair;
      if (key2.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key2.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key2.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key2.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path3, key2) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path3;
    this._key = key2;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key2 in schema.shape) {
      const fieldSchema = schema.shape[key2];
      newShape[key2] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key2 in ctx.data) {
        if (!shapeKeys.includes(key2)) {
          extraKeys.push(key2);
        }
      }
    }
    const pairs = [];
    for (const key2 of shapeKeys) {
      const keyValidator = shape[key2];
      const value = ctx.data[key2];
      pairs.push({
        key: { status: "valid", value: key2 },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key2)),
        alwaysSet: key2 in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key2 of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key2 },
            value: { status: "valid", value: ctx.data[key2] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key2 of extraKeys) {
        const value = ctx.data[key2];
        pairs.push({
          key: { status: "valid", value: key2 },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key2)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key2 in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key2 = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key: key2,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key2, schema) {
    return this.augment({ [key2]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index2) {
    return new _ZodObject({
      ...this._def,
      catchall: index2
    });
  }
  pick(mask) {
    const shape = {};
    for (const key2 of util.objectKeys(mask)) {
      if (mask[key2] && this.shape[key2]) {
        shape[key2] = this.shape[key2];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key2 of util.objectKeys(this.shape)) {
      if (!mask[key2]) {
        shape[key2] = this.shape[key2];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key2 of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key2];
      if (mask && !mask[key2]) {
        newShape[key2] = fieldSchema;
      } else {
        newShape[key2] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key2 of util.objectKeys(this.shape)) {
      if (mask && !mask[key2]) {
        newShape[key2] = this.shape[key2];
      } else {
        const fieldSchema = this.shape[key2];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key2] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key2) => bKeys.indexOf(key2) !== -1);
    const newObj = { ...a, ...b };
    for (const key2 of sharedKeys) {
      const sharedValue = mergeValues(a[key2], b[key2]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key2] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index2 = 0; index2 < a.length; index2++) {
      const itemA = a[index2];
      const itemB = b[index2];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key2 in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key2, ctx.path, key2)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key2], ctx.path, key2)),
        alwaysSet: key2 in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key2, value], index2) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key2, ctx.path, [index2, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index2, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key2 = await pair.key;
          const value = await pair.value;
          if (key2.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key2.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key2.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key2 = pair.key;
        const value = pair.value;
        if (key2.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key2.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key2.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// packages/contracts/dist/index.js
var SCHEMA_VERSION = "1.0.0";
var PROJECT_ID = "industrial-demo";
var MAX_ASSET_MIB = 500;
var MAX_ASSET_BYTES = MAX_ASSET_MIB * 1024 * 1024;
var IdSchema = external_exports.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,95}$/);
var HashSchema = external_exports.string().regex(/^[a-f0-9]{64}$/);
var Vec3Schema = external_exports.tuple([external_exports.number().finite(), external_exports.number().finite(), external_exports.number().finite()]);
var ColorSchema = external_exports.string().regex(/^#[0-9a-fA-F]{6}$/);
var TransformSchema = external_exports.object({
  position: Vec3Schema.default([0, 0, 0]),
  rotation: Vec3Schema.default([0, 0, 0]),
  scale: external_exports.tuple([external_exports.number().finite().min(1e-3), external_exports.number().finite().min(1e-3), external_exports.number().finite().min(1e-3)]).default([1, 1, 1])
}).strict();
var NodeMetadataSchema = external_exports.object({
  nodeKey: IdSchema,
  nodeName: external_exports.string().min(1).max(256),
  nodeIndex: external_exports.number().int().nonnegative().optional(),
  name: external_exports.string().min(1).max(256),
  parentKey: IdSchema.nullable().default(null),
  pivot: Vec3Schema.default([0, 0, 0]),
  motionAxis: Vec3Schema.default([0, 1, 0]),
  explodeOffset: Vec3Schema.default([0, 0, 0])
}).strict();
function validateTree(nodes, ctx, path3) {
  const parents = new Map(nodes.map((node) => [node.key, node.parent]));
  if (parents.size !== nodes.length)
    ctx.addIssue({ code: "custom", path: [path3], message: "Duplicate stable identifiers" });
  for (const node of nodes) {
    const seen = /* @__PURE__ */ new Set([node.key]);
    let parent = node.parent;
    while (parent !== null) {
      if (!parents.has(parent)) {
        ctx.addIssue({ code: "custom", path: [path3], message: `Missing parent ${parent}` });
        break;
      }
      if (seen.has(parent)) {
        ctx.addIssue({ code: "custom", path: [path3], message: `Hierarchy cycle at ${parent}` });
        break;
      }
      seen.add(parent);
      parent = parents.get(parent) ?? null;
    }
  }
}
var AssetMetadataSchema = external_exports.object({
  schemaVersion: external_exports.literal(SCHEMA_VERSION),
  assetId: IdSchema,
  name: external_exports.string().min(1).max(256),
  coordinateSystem: external_exports.object({
    unit: external_exports.literal("m"),
    upAxis: external_exports.literal("Y"),
    handedness: external_exports.literal("right")
  }).strict(),
  source: external_exports.object({
    format: external_exports.string().min(1).max(64),
    synthetic: external_exports.boolean(),
    licenseAcknowledged: external_exports.literal(true),
    description: external_exports.string().max(2e3).default("")
  }).strict(),
  nodes: external_exports.array(NodeMetadataSchema).min(1).max(2e4),
  clips: external_exports.array(external_exports.object({
    name: external_exports.string().min(1).max(256),
    durationMs: external_exports.number().finite().positive()
  }).strict()).default([])
}).strict().superRefine((data, ctx) => {
  validateTree(data.nodes.map((node) => ({ key: node.nodeKey, parent: node.parentKey })), ctx, "nodes");
  if (new Set(data.clips.map((clip) => clip.name)).size !== data.clips.length) {
    ctx.addIssue({ code: "custom", path: ["clips"], message: "Duplicate animation clip names" });
  }
});
var AssetImportOptionsSchema = external_exports.object({
  mode: external_exports.literal("auto"),
  assetId: IdSchema,
  name: external_exports.string().min(1).max(256),
  licenseAcknowledged: external_exports.literal(true),
  sourceFormat: external_exports.enum(["glb", "fbx"]),
  warnings: external_exports.array(external_exports.string().max(2e3)).max(100).default([])
}).strict();
var AssetSourceSchema = external_exports.object({
  filename: external_exports.string().min(1).max(256),
  format: external_exports.enum(["glb", "fbx"]),
  originalHash: HashSchema
}).strict();
var AssetRefSchema = external_exports.object({
  assetId: IdSchema,
  assetRevision: IdSchema,
  contentHash: HashSchema,
  metadataHash: HashSchema
}).strict();
var EntitySchema = external_exports.object({
  entityId: IdSchema,
  name: external_exports.string().min(1).max(256),
  kind: external_exports.enum(["model", "group"]),
  parentId: IdSchema.nullable().default(null),
  businessId: IdSchema.optional(),
  customData: external_exports.unknown().optional(),
  assetRef: external_exports.object({ assetId: IdSchema, assetRevision: IdSchema }).strict().optional(),
  transform: TransformSchema,
  visible: external_exports.boolean().default(true),
  renderMode: external_exports.enum(["standard", "instanced"]).default("standard"),
  material: external_exports.object({
    color: ColorSchema.optional(),
    metalness: external_exports.number().min(0).max(1).optional(),
    roughness: external_exports.number().min(0).max(1).optional()
  }).strict().default({})
}).strict().superRefine((entity, ctx) => {
  if (entity.kind === "model" !== Boolean(entity.assetRef)) {
    ctx.addIssue({ code: "custom", path: ["assetRef"], message: "Models require an asset; groups must not reference an asset" });
  }
});
var BookmarkSchema = external_exports.object({
  id: IdSchema,
  name: external_exports.string().min(1).max(256),
  position: Vec3Schema,
  target: Vec3Schema
}).strict();
var SemanticEntitySchema = external_exports.object({
  id: IdSchema,
  name: external_exports.string().min(1).max(256),
  kind: external_exports.string().min(1).max(128),
  businessId: external_exports.string().max(256).optional(),
  parentId: IdSchema.nullable().default(null),
  tags: external_exports.array(external_exports.string().max(64)).max(32).default([]),
  ref: external_exports.object({ entityId: IdSchema, nodeKey: IdSchema }).strict(),
  capabilities: external_exports.array(external_exports.string().max(64)).max(32).default([])
}).strict();
var SemanticsSchema = external_exports.object({
  contract: external_exports.string().min(1).max(64),
  source: external_exports.object({
    sceneId: external_exports.string().min(1).max(128),
    revision: external_exports.string().min(1).max(128),
    packageSha256: HashSchema.optional(),
    importedAt: external_exports.number().int().nonnegative()
  }).strict(),
  entities: external_exports.array(SemanticEntitySchema).max(1e4),
  views: external_exports.array(external_exports.object({ id: IdSchema, fov: external_exports.number().min(1).max(179).optional() }).strict()).max(100).default([]),
  presentation: external_exports.record(external_exports.string().max(128)).default({}),
  bindings: external_exports.array(external_exports.record(external_exports.unknown())).max(5e3).default([]),
  interactions: external_exports.array(external_exports.record(external_exports.unknown())).max(5e3).default([]),
  requiredCapabilities: external_exports.array(external_exports.string().max(64)).max(64).default([])
}).strict().superRefine((value, ctx) => {
  const ids = new Set(value.entities.map((entity) => entity.id));
  if (ids.size !== value.entities.length)
    ctx.addIssue({ code: "custom", path: ["entities"], message: "Duplicate semantic entity id" });
  for (const entity of value.entities) {
    if (entity.parentId && !ids.has(entity.parentId))
      ctx.addIssue({ code: "custom", path: ["entities"], message: `Missing semantic parent ${entity.parentId}` });
  }
});
var LEGACY_SCENE_KEYS = ["bindings", "explodeProfiles", "procedures"];
var SceneDocumentObject = external_exports.object({
  schemaVersion: external_exports.literal(SCHEMA_VERSION),
  projectId: external_exports.literal(PROJECT_ID),
  sceneId: IdSchema,
  sceneRevision: IdSchema,
  name: external_exports.string().min(1).max(256),
  coordinateSystem: external_exports.object({
    kind: external_exports.literal("local"),
    unit: external_exports.literal("m"),
    upAxis: external_exports.literal("Y"),
    handedness: external_exports.literal("right")
  }).strict(),
  assets: external_exports.array(AssetRefSchema).max(100),
  entities: external_exports.array(EntitySchema).max(1e4),
  bookmarks: external_exports.array(BookmarkSchema).max(100),
  environment: external_exports.object({
    background: ColorSchema.default("#101c2c"),
    ground: external_exports.boolean().default(true)
  }).strict(),
  semantics: SemanticsSchema.optional()
}).strict().superRefine((doc, ctx) => {
  validateTree(doc.entities.map((entity) => ({ key: entity.entityId, parent: entity.parentId })), ctx, "entities");
  const ids = new Set(doc.entities.map((entity) => entity.entityId));
  for (const semantic of doc.semantics?.entities || []) {
    if (!ids.has(semantic.ref.entityId))
      ctx.addIssue({ code: "custom", path: ["semantics", "entities"], message: `Semantic entity ${semantic.id} references missing model ${semantic.ref.entityId}` });
  }
  const assetKeys = new Set(doc.assets.map((asset) => `${asset.assetId}@${asset.assetRevision}`));
  if (assetKeys.size !== doc.assets.length)
    ctx.addIssue({ code: "custom", path: ["assets"], message: "Duplicate asset reference" });
  for (const entity of doc.entities) {
    if (entity.assetRef && !assetKeys.has(`${entity.assetRef.assetId}@${entity.assetRef.assetRevision}`)) {
      ctx.addIssue({ code: "custom", path: ["entities"], message: `Missing asset reference for ${entity.entityId}` });
    }
  }
});
var SceneDocumentSchema = external_exports.preprocess((value) => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return value;
  const copy = { ...value };
  for (const key2 of LEGACY_SCENE_KEYS)
    delete copy[key2];
  return copy;
}, SceneDocumentObject);
var RoleSchema = external_exports.enum(["viewer", "editor", "admin"]);
var ERROR_CODES = [
  "E_INVALID_ARGUMENT",
  "E_SCENE_NOT_READY",
  "E_ENTITY_NOT_FOUND",
  "E_ASSET_LOAD_FAILED",
  "E_SCHEMA_INCOMPATIBLE",
  "E_CAPABILITY_UNAVAILABLE",
  "E_REVISION_CONFLICT",
  "E_PERMISSION_DENIED",
  "E_OPERATION_CANCELLED",
  "E_VIEWER_DISPOSED",
  "E_CONTEXT_LOST",
  "E_NOT_FOUND",
  "E_STORAGE",
  "E_UNSUPPORTED_ASSET",
  "E_DATA_MODE",
  "E_QUEUE_LIMIT",
  "E_AUTH_REQUIRED",
  "E_DELIVERY_INVALID",
  "E_DELIVERY_EXPIRED",
  "E_UPSTREAM"
];
function uuid() {
  const source = globalThis.crypto;
  if (typeof source?.randomUUID === "function")
    return source.randomUUID();
  const bytes = new Uint8Array(16);
  if (typeof source?.getRandomValues === "function")
    source.getRandomValues(bytes);
  else
    for (let index2 = 0; index2 < 16; index2++)
      bytes[index2] = Math.floor(Math.random() * 256);
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
var TwinError = class extends Error {
  code;
  details;
  requestId;
  constructor(code, message, details = null, requestId = uuid()) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "TwinError";
    this.requestId = requestId;
  }
  toJSON() {
    return { code: this.code, message: this.message, requestId: this.requestId, details: this.details };
  }
};
function parseWith(schema, value) {
  const parsed = schema.safeParse(value);
  if (!parsed.success)
    throw new TwinError("E_INVALID_ARGUMENT", "Contract validation failed", parsed.error.issues);
  return parsed.data;
}
function parseScene(value) {
  return parseWith(SceneDocumentSchema, value);
}
function parseMetadata(value) {
  return parseWith(AssetMetadataSchema, value);
}
var AssetReportSchema = external_exports.object({
  pipelineVersion: external_exports.string(),
  bytes: external_exports.number().nonnegative(),
  triangles: external_exports.number().nonnegative(),
  meshes: external_exports.number().nonnegative(),
  materials: external_exports.number().nonnegative(),
  nodes: external_exports.number().nonnegative(),
  mappedNodes: external_exports.number().nonnegative(),
  hasSkins: external_exports.boolean(),
  animations: external_exports.array(external_exports.string()),
  requiredExtensions: external_exports.array(external_exports.string()),
  synthetic: external_exports.boolean(),
  validation: external_exports.object({ validatorVersion: external_exports.string(), errors: external_exports.number().int().nonnegative(), warnings: external_exports.number().int().nonnegative() }).strict(),
  warnings: external_exports.array(external_exports.string())
}).strict();
var AssetVersionSchema = AssetRefSchema.extend({
  name: external_exports.string(),
  createdAt: external_exports.number(),
  metadata: AssetMetadataSchema,
  report: AssetReportSchema,
  source: AssetSourceSchema.optional()
}).strict();
var ConversionJobSchema = external_exports.object({
  id: IdSchema,
  status: external_exports.enum(["queued", "running", "ready", "failed"]),
  assetId: IdSchema,
  sourceHash: HashSchema,
  metadataHash: HashSchema,
  source: AssetSourceSchema.optional(),
  createdAt: external_exports.number(),
  updatedAt: external_exports.number(),
  attempts: external_exports.number().int(),
  assetRevision: IdSchema.optional(),
  error: external_exports.object({ code: external_exports.string(), message: external_exports.string() }).strict().optional()
}).strict();
var DraftSchema = external_exports.object({ version: external_exports.number().int(), document: SceneDocumentSchema, updatedAt: external_exports.number() }).strict();
var CustomApiNameSchema = external_exports.string().regex(/^[a-zA-Z_$][a-zA-Z0-9_$]{0,63}$/, "customApi name must be a JavaScript identifier");
var CUSTOM_API_PARAM_TYPES = ["string", "number", "boolean", "object", "array", "entityId", "nodeRef", "any"];
var CustomApiParamSchema = external_exports.object({
  name: CustomApiNameSchema,
  type: external_exports.enum(CUSTOM_API_PARAM_TYPES).default("any"),
  required: external_exports.boolean().default(false),
  description: external_exports.string().max(500).default(""),
  default: external_exports.unknown().optional()
}).strict();
var CustomFeatureMetaSchema = external_exports.object({
  featureId: IdSchema,
  version: external_exports.number().int().positive(),
  name: CustomApiNameSchema,
  title: external_exports.string().min(1).max(120),
  description: external_exports.string().max(2e3).default(""),
  category: external_exports.string().min(1).max(40).default("\u901A\u7528"),
  params: external_exports.array(CustomApiParamSchema).max(32).default([]),
  returns: external_exports.string().max(500).default(""),
  /** Case(s) the function was developed for; the library groups by this. */
  originSceneIds: external_exports.array(IdSchema).max(50).default([]),
  /** Source file inside the repository, for maintainers. */
  source: external_exports.string().max(300).default(""),
  changelog: external_exports.string().max(500).default(""),
  /** sdk: implemented in @twin/custom-sdk; package: shipped as a customApi package (e.g. inside a DSL bundle). */
  origin: external_exports.enum(["sdk", "package"]).default("sdk"),
  package: external_exports.object({ packageId: IdSchema, packageVersion: external_exports.string().max(40), hash: HashSchema }).strict().optional()
}).strict();
var CUSTOM_API_PACKAGE_SCHEMA = "twin-custom-api-package/1";
var CustomApiPackageFunctionSchema = CustomFeatureMetaSchema.omit({ origin: true, package: true, featureId: true }).extend({ featureId: IdSchema.optional() }).strict();
var CustomApiPackageManifestSchema = external_exports.object({
  schema: external_exports.literal(CUSTOM_API_PACKAGE_SCHEMA),
  packageId: IdSchema,
  version: external_exports.string().regex(/^\d+\.\d+\.\d+([-+][0-9A-Za-z.-]+)?$/, "version must be semver"),
  title: external_exports.string().min(1).max(120),
  description: external_exports.string().max(2e3).default(""),
  /** Scene contract this package belongs to (one-to-one with the DSL scene contract). */
  contract: external_exports.object({ id: external_exports.string().min(1).max(128), version: external_exports.string().min(1).max(64) }).strict().optional(),
  entry: external_exports.string().regex(/^[\w.-]+\.m?js$/).default("index.js"),
  sha256: HashSchema,
  functions: external_exports.array(CustomApiPackageFunctionSchema).min(1).max(100)
}).strict().superRefine((value, ctx) => {
  const keys = value.functions.map((fn) => `${fn.featureId ?? `${value.packageId}.${fn.name}`}@${fn.version}`);
  if (new Set(keys).size !== keys.length)
    ctx.addIssue({ code: "custom", path: ["functions"], message: "Duplicate function id/version in package" });
});
var CustomApiPackageSchema = external_exports.object({
  hash: HashSchema,
  packageId: IdSchema,
  version: external_exports.string(),
  sceneId: IdSchema.nullable(),
  uploadedAt: external_exports.number(),
  uploadedBy: external_exports.string(),
  bytes: external_exports.number().int().nonnegative(),
  warnings: external_exports.array(external_exports.string()),
  manifest: CustomApiPackageManifestSchema
}).strict();
var CustomApiBindingSchema = external_exports.object({
  name: CustomApiNameSchema,
  featureId: IdSchema,
  version: external_exports.number().int().positive(),
  /** Package that provides the implementation (package functions only); filled by the platform when omitted. */
  packageHash: HashSchema.optional()
}).strict();
var CustomApiBindingsSchema = external_exports.array(CustomApiBindingSchema).max(200).superRefine((list, ctx) => {
  const names = new Set(list.map((item) => item.name));
  if (names.size !== list.length)
    ctx.addIssue({ code: "custom", message: "Duplicate customApi name in case" });
});
var CustomApiDefinitionSchema = CustomFeatureMetaSchema.omit({ name: true }).extend({ name: CustomApiNameSchema, featureName: CustomApiNameSchema }).strict();
var ReleaseSchema = external_exports.object({
  revision: IdSchema,
  manifestHash: HashSchema,
  createdAt: external_exports.number(),
  sourceDraftVersion: external_exports.number().int(),
  document: SceneDocumentSchema,
  customApis: external_exports.array(CustomApiBindingSchema).optional()
}).strict();
var SceneSummarySchema = external_exports.object({
  sceneId: IdSchema,
  name: external_exports.string(),
  draftVersion: external_exports.number().int(),
  publishedRevision: IdSchema.nullable(),
  updatedAt: external_exports.number().optional(),
  publishedAt: external_exports.number().nullable().optional(),
  entityCount: external_exports.number().int().nonnegative().optional(),
  assetCount: external_exports.number().int().nonnegative().optional(),
  semanticCount: external_exports.number().int().nonnegative().optional(),
  contract: external_exports.string().nullable().optional(),
  customApiCount: external_exports.number().int().nonnegative().optional()
}).strict();
var SessionSchema = external_exports.object({ role: RoleSchema, username: external_exports.string().optional(), projectId: external_exports.literal(PROJECT_ID), mode: external_exports.literal("local-development") }).strict();
var ApiErrorSchema = external_exports.object({
  code: external_exports.enum(ERROR_CODES),
  message: external_exports.string(),
  requestId: external_exports.string(),
  details: external_exports.unknown().optional()
});
function validateSceneAssets(doc, assets) {
  const findMetadata = (entityId) => {
    const entity = doc.entities.find((item) => item.entityId === entityId);
    if (!entity?.assetRef)
      throw new TwinError("E_INVALID_ARGUMENT", `Entity ${entityId} has no model asset`);
    const metadata = assets.get(`${entity.assetRef.assetId}@${entity.assetRef.assetRevision}`);
    if (!metadata)
      throw new TwinError("E_ASSET_LOAD_FAILED", `Missing metadata for ${entityId}`);
    return metadata;
  };
  for (const entity of doc.entities) {
    if (entity.assetRef) {
      const metadata = findMetadata(entity.entityId);
      if (entity.renderMode === "instanced" && metadata.clips.length) {
        throw new TwinError("E_CAPABILITY_UNAVAILABLE", `Animated asset ${entity.entityId} cannot use the P0 instancing path`);
      }
    }
  }
  for (const semantic of doc.semantics?.entities || []) {
    const metadata = findMetadata(semantic.ref.entityId);
    if (!metadata.nodes.some((node) => node.nodeKey === semantic.ref.nodeKey)) {
      throw new TwinError("E_INVALID_ARGUMENT", `Semantic entity ${semantic.id} references node ${semantic.ref.nodeKey} that is not in asset ${metadata.assetId}`);
    }
  }
}

// services/platform/dist/asset-inspect.js
import validator from "gltf-validator";
import { MeshoptDecoder } from "meshoptimizer";
var MESHOPT = "EXT_meshopt_compression";
var PIPELINE_VERSION = "p1-model-import-1";
var Index = external_exports.number().int().nonnegative();
var GltfSchema = external_exports.object({
  asset: external_exports.object({ version: external_exports.literal("2.0") }).passthrough(),
  scene: Index.default(0),
  scenes: external_exports.array(external_exports.object({ nodes: external_exports.array(Index).default([]) }).passthrough()).min(1),
  nodes: external_exports.array(external_exports.object({
    name: external_exports.string().optional(),
    children: external_exports.array(Index).default([]),
    mesh: Index.optional(),
    skin: Index.optional()
  }).passthrough()).max(2e4).default([]),
  meshes: external_exports.array(external_exports.object({
    primitives: external_exports.array(external_exports.object({
      attributes: external_exports.record(Index),
      indices: Index.optional(),
      mode: Index.default(4)
    }).passthrough()).max(1e3)
  }).passthrough()).max(2e4).default([]),
  materials: external_exports.array(external_exports.unknown()).max(1e4).default([]),
  // EXT_meshopt_compression 的回退 buffer 不含数据（extensions.EXT_meshopt_compression.fallback），因此允许 2 个。
  buffers: external_exports.array(external_exports.object({ byteLength: Index, uri: external_exports.string().optional() }).passthrough()).max(2).default([]),
  bufferViews: external_exports.array(external_exports.object({
    buffer: Index,
    byteOffset: Index.default(0),
    byteLength: Index,
    byteStride: Index.optional()
  }).passthrough()).default([]),
  accessors: external_exports.array(external_exports.object({
    bufferView: Index.optional(),
    byteOffset: Index.default(0),
    componentType: Index,
    count: Index.max(4e6),
    type: external_exports.enum(["SCALAR", "VEC2", "VEC3", "VEC4", "MAT2", "MAT3", "MAT4"]),
    sparse: external_exports.unknown().optional()
  }).passthrough()).default([]),
  images: external_exports.array(external_exports.object({ uri: external_exports.string().optional(), bufferView: Index.optional() }).passthrough()).default([]),
  animations: external_exports.array(external_exports.object({
    name: external_exports.string().optional(),
    samplers: external_exports.array(external_exports.object({ input: Index, output: Index }).passthrough()),
    channels: external_exports.array(external_exports.object({ sampler: Index, target: external_exports.object({ node: Index.optional(), path: external_exports.string() }).passthrough() }).passthrough())
  }).passthrough()).default([]),
  extensionsRequired: external_exports.array(external_exports.string()).default([])
}).passthrough();
var supported = /* @__PURE__ */ new Set([
  "KHR_materials_unlit",
  "KHR_materials_clearcoat",
  "KHR_materials_transmission",
  "KHR_materials_ior",
  "KHR_materials_specular",
  "KHR_materials_sheen",
  "KHR_materials_volume",
  "KHR_materials_emissive_strength",
  "KHR_materials_iridescence",
  "KHR_materials_anisotropy",
  "KHR_texture_transform",
  "KHR_mesh_quantization",
  MESHOPT,
  "EXT_texture_webp",
  "EXT_texture_avif"
]);
function invalid(message) {
  throw new TwinError("E_UNSUPPORTED_ASSET", message);
}
function at(list, index2, label) {
  if (!Number.isInteger(index2) || index2 < 0 || index2 >= list.length)
    invalid(`Invalid ${label} index ${index2}`);
  return list[index2];
}
async function inspectGlb(bytes, input) {
  const automatic = "mode" in input ? input : null;
  let metadata = "mode" in input ? {
    schemaVersion: "1.0.0",
    assetId: input.assetId,
    name: input.name,
    coordinateSystem: { unit: "m", upAxis: "Y", handedness: "right" },
    source: {
      format: input.sourceFormat,
      synthetic: false,
      licenseAcknowledged: true,
      description: "Automatically mapped render nodes; business IDs, engineering dimensions and motion semantics require human acceptance."
    },
    nodes: [],
    clips: []
  } : input;
  if (bytes.byteLength < 20 || bytes.byteLength > MAX_ASSET_BYTES)
    invalid(`GLB must be between 20 bytes and ${MAX_ASSET_MIB} MiB`);
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (data.getUint32(0, true) !== 1179937895 || data.getUint32(4, true) !== 2 || data.getUint32(8, true) !== bytes.byteLength)
    invalid("Invalid GLB 2.0 header or length");
  let offset = 12;
  let json;
  let binary = new Uint8Array();
  let jsonSeen = false;
  let binarySeen = false;
  while (offset < bytes.byteLength) {
    if (offset + 8 > bytes.byteLength)
      invalid("Truncated GLB chunk");
    const length = data.getUint32(offset, true);
    const type = data.getUint32(offset + 4, true);
    offset += 8;
    if (length % 4 !== 0 || offset + length > bytes.byteLength)
      invalid("Invalid GLB chunk length");
    const chunk = bytes.subarray(offset, offset + length);
    if (type === 1313821514) {
      if (jsonSeen || offset !== 20 || length > 64 * 1024 * 1024)
        invalid("Invalid or excessive GLB JSON chunk");
      jsonSeen = true;
      try {
        json = JSON.parse(new TextDecoder().decode(chunk));
      } catch (error) {
        if (error instanceof SyntaxError)
          invalid("GLB JSON is malformed");
        throw error;
      }
    } else if (type === 5130562) {
      if (binarySeen || !jsonSeen)
        invalid("Invalid GLB binary chunk order");
      binarySeen = true;
      binary = new Uint8Array(chunk);
    } else
      invalid("P0 only accepts standard JSON/BIN GLB chunks");
    offset += length;
  }
  const parsed = GltfSchema.safeParse(json);
  if (!parsed.success)
    invalid(`Invalid glTF structure: ${parsed.error.issues[0]?.message}`);
  const gltf = parsed.data;
  for (const extension of gltf.extensionsRequired)
    if (!supported.has(extension)) {
      invalid(`Required extension ${extension} is not enabled in P0; provide an uncompressed, self-contained GLB`);
    }
  if (gltf.buffers.some((buffer) => buffer.uri) || gltf.images.some((image) => image.uri)) {
    invalid("External and data-URI resources are not accepted; embed buffers and images in GLB bufferViews");
  }
  const fallbacks = /* @__PURE__ */ new Set();
  gltf.buffers.forEach((buffer, index2) => {
    const ext = buffer.extensions?.[MESHOPT];
    if (index2 > 0 && !ext?.fallback)
      invalid("Only one GLB binary buffer is accepted (plus EXT_meshopt_compression fallback buffers)");
    if (ext?.fallback)
      fallbacks.add(index2);
  });
  if (gltf.buffers.length && !fallbacks.has(0) && gltf.buffers[0].byteLength > binary.byteLength)
    invalid("Missing binary data");
  const compressedOf = (view) => view.extensions?.[MESHOPT];
  for (const view of gltf.bufferViews) {
    const compressed = compressedOf(view);
    if (fallbacks.has(view.buffer) && !compressed)
      invalid("BufferView reads a meshopt fallback buffer without decompression");
    if (compressed) {
      if (fallbacks.has(compressed.buffer))
        invalid("Compressed data must reside in the GLB binary buffer");
      if ((compressed.byteOffset ?? 0) + compressed.byteLength > binary.byteLength)
        invalid("Compressed bufferView exceeds buffer bounds");
      if (view.byteLength !== compressed.count * compressed.byteStride)
        invalid("Compressed bufferView size mismatch");
      continue;
    }
    const buffer = at(gltf.buffers, view.buffer, "buffer");
    if (view.byteOffset + view.byteLength > buffer.byteLength)
      invalid("BufferView exceeds buffer bounds");
  }
  if (gltf.bufferViews.some((view) => compressedOf(view)))
    await MeshoptDecoder.ready;
  const decoded = /* @__PURE__ */ new Map();
  const viewBytes = (index2) => {
    const view = at(gltf.bufferViews, index2, "bufferView");
    const compressed = compressedOf(view);
    if (!compressed)
      return binary.subarray(view.byteOffset, view.byteOffset + view.byteLength);
    let bytes2 = decoded.get(index2);
    if (!bytes2) {
      bytes2 = new Uint8Array(compressed.count * compressed.byteStride);
      const offset2 = compressed.byteOffset ?? 0;
      try {
        MeshoptDecoder.decodeGltfBuffer(bytes2, compressed.count, compressed.byteStride, binary.subarray(offset2, offset2 + compressed.byteLength), compressed.mode, compressed.filter);
      } catch {
        invalid("EXT_meshopt_compression data cannot be decoded");
      }
      decoded.set(index2, bytes2);
    }
    return bytes2;
  };
  const componentBytes = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
  const sizes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
  for (const accessor of gltf.accessors) {
    const width = componentBytes[accessor.componentType];
    if (!width)
      invalid("Unsupported accessor component type");
    if (accessor.bufferView === void 0 || accessor.sparse)
      invalid("P0 importer requires dense accessors with bufferViews");
    const view = at(gltf.bufferViews, accessor.bufferView, "bufferView");
    const matrixDimension = accessor.type.startsWith("MAT") ? Number(accessor.type.slice(3)) : 0;
    const elementBytes = matrixDimension ? Math.ceil(matrixDimension * width / 4) * 4 * matrixDimension : sizes[accessor.type] * width;
    const stride = view.byteStride ?? elementBytes;
    if (stride < elementBytes || accessor.byteOffset + Math.max(0, accessor.count - 1) * stride + (accessor.count ? elementBytes : 0) > view.byteLength) {
      invalid("Accessor exceeds bufferView bounds");
    }
  }
  for (const image of gltf.images) {
    if (image.bufferView === void 0)
      invalid("Image has no embedded bufferView");
    at(gltf.bufferViews, image.bufferView, "image bufferView");
  }
  const parentIndices = /* @__PURE__ */ new Map();
  const nameIndices = /* @__PURE__ */ new Map();
  gltf.nodes.forEach((node, index2) => {
    if (node.name)
      nameIndices.set(node.name, [...nameIndices.get(node.name) || [], index2]);
    if (node.mesh !== void 0)
      at(gltf.meshes, node.mesh, "mesh");
    for (const child of node.children) {
      at(gltf.nodes, child, "child");
      if (parentIndices.has(child))
        invalid("Node has multiple parents");
      parentIndices.set(child, index2);
    }
  });
  const active = at(gltf.scenes, gltf.scene, "scene");
  const reachable = /* @__PURE__ */ new Set();
  const pending = active.nodes.map((index2) => ({ index: index2, depth: 0 }));
  while (pending.length) {
    const item = pending.pop();
    at(gltf.nodes, item.index, "scene node");
    if (item.depth > 256 || reachable.has(item.index))
      invalid("Scene node cycle, repeated root or excessive depth");
    reachable.add(item.index);
    pending.push(...gltf.nodes[item.index].children.map((index2) => ({ index: index2, depth: item.depth + 1 })));
  }
  if (automatic) {
    metadata.nodes = [...reachable].sort((a, b) => a - b).map((index2) => {
      const parent = parentIndices.get(index2);
      const name = gltf.nodes[index2].name || `node_${index2}`;
      return {
        nodeKey: `node-${index2}`,
        nodeIndex: index2,
        nodeName: name,
        name,
        parentKey: parent !== void 0 && reachable.has(parent) ? `node-${parent}` : null,
        pivot: [0, 0, 0],
        motionAxis: [0, 1, 0],
        explodeOffset: [0, 0, 0]
      };
    });
  }
  const metadataIndices = /* @__PURE__ */ new Map();
  const mappedIndices = /* @__PURE__ */ new Set();
  for (const node of metadata.nodes) {
    const matches = nameIndices.get(node.nodeName) || [];
    const index2 = node.nodeIndex ?? (matches.length === 1 ? matches[0] : -1);
    if (index2 < 0 || !reachable.has(index2) || (gltf.nodes[index2].name || `node_${index2}`) !== node.nodeName) {
      invalid(`Node ${node.nodeKey} has no unique active glTF mapping; provide nodeIndex for duplicate names`);
    }
    if (mappedIndices.has(index2))
      invalid("Multiple semantic nodes map to the same glTF node");
    mappedIndices.add(index2);
    metadataIndices.set(node.nodeKey, index2);
  }
  for (const node of metadata.nodes) {
    if (!node.parentKey)
      continue;
    const expected = metadataIndices.get(node.parentKey);
    let parent = parentIndices.get(metadataIndices.get(node.nodeKey));
    while (parent !== void 0 && parent !== expected)
      parent = parentIndices.get(parent);
    if (parent !== expected)
      invalid(`Semantic parent mismatch for ${node.nodeKey}`);
  }
  let triangles = 0;
  for (const mesh of gltf.meshes)
    for (const primitive of mesh.primitives) {
      for (const index2 of Object.values(primitive.attributes))
        at(gltf.accessors, index2, "attribute");
      const countIndex = primitive.indices ?? primitive.attributes.POSITION;
      if (countIndex === void 0)
        invalid("Mesh primitive has no positions");
      const accessor = at(gltf.accessors, countIndex, "primitive accessor");
      if (primitive.mode === 4)
        triangles += Math.floor(accessor.count / 3);
      else if (primitive.mode === 5 || primitive.mode === 6)
        triangles += Math.max(0, accessor.count - 2);
    }
  const clipNames = [];
  gltf.animations.forEach((animation, index2) => {
    const name = animation.name || `animation_${index2}`;
    clipNames.push(name);
    let duration = 0;
    for (const sampler of animation.samplers) {
      const accessor = at(gltf.accessors, sampler.input, "animation input");
      at(gltf.accessors, sampler.output, "animation output");
      if (accessor.type !== "SCALAR" || accessor.componentType !== 5126 || accessor.bufferView === void 0)
        invalid("Invalid animation time accessor");
      const view = at(gltf.bufferViews, accessor.bufferView, "animation bufferView");
      const source = viewBytes(accessor.bufferView);
      const times = new DataView(source.buffer, source.byteOffset, source.byteLength);
      let previous = -Infinity;
      for (let sample = 0; sample < accessor.count; sample++) {
        const time = times.getFloat32(accessor.byteOffset + sample * (view.byteStride ?? 4), true);
        if (!Number.isFinite(time) || time < 0 || time <= previous)
          invalid("Animation times must be finite, nonnegative and strictly increasing");
        previous = time;
        duration = Math.max(duration, time * 1e3);
      }
    }
    for (const channel of animation.channels) {
      at(animation.samplers, channel.sampler, "animation sampler");
      if (channel.target.node !== void 0 && !reachable.has(channel.target.node))
        invalid("Animation targets an inactive node");
    }
    if (automatic)
      metadata.clips.push({ name, durationMs: duration });
    const declared = metadata.clips.find((clip) => clip.name === name);
    if (!declared || Math.abs(declared.durationMs - duration) > 1)
      invalid(`Animation metadata missing or duration mismatch: ${name}`);
  });
  if (metadata.clips.some((clip) => !clipNames.includes(clip.name)))
    invalid("Metadata references an absent animation");
  if (!gltf.meshes.length || ![...reachable].some((index2) => gltf.nodes[index2].mesh !== void 0))
    invalid("Active scene has no mesh geometry");
  metadata = parseMetadata(metadata);
  const validation = external_exports.object({
    issues: external_exports.object({
      numErrors: external_exports.number().int().nonnegative(),
      numWarnings: external_exports.number().int().nonnegative(),
      messages: external_exports.array(external_exports.object({ code: external_exports.string(), message: external_exports.string(), severity: external_exports.number() }).passthrough())
    }).passthrough()
  }).passthrough().parse(await validator.validateBytes(bytes, {
    maxIssues: 30,
    externalResourceFunction: async () => {
      throw new TwinError("E_UNSUPPORTED_ASSET", "External resources are not allowed");
    }
  }));
  const errors = validation.issues.messages.filter((item) => item.severity === 0);
  const tolerated = !gltf.extensionsRequired.includes("KHR_lights_punctual") && errors.length === validation.issues.numErrors && errors.length > 0 && errors.every((item) => item.code.startsWith("KHR_LIGHTS_PUNCTUAL_"));
  if (validation.issues.numErrors && !tolerated) {
    const issue = errors.find((item) => !item.code.startsWith("KHR_LIGHTS_PUNCTUAL_")) || errors[0];
    invalid(`Khronos glTF validation failed: ${issue?.code || "INVALID_GLTF"}: ${issue?.message || "Asset has format errors"}`);
  }
  const report = {
    pipelineVersion: PIPELINE_VERSION,
    bytes: bytes.byteLength,
    triangles,
    meshes: gltf.meshes.length,
    materials: gltf.materials.length,
    nodes: gltf.nodes.length,
    mappedNodes: metadata.nodes.length,
    hasSkins: gltf.nodes.some((node) => node.skin !== void 0),
    animations: clipNames,
    requiredExtensions: gltf.extensionsRequired,
    synthetic: metadata.source.synthetic,
    validation: { validatorVersion: validator.version(), errors: validation.issues.numErrors, warnings: validation.issues.numWarnings },
    warnings: [
      "Server validates normalized GLB. Geometry optimization and engineering fidelity acceptance are not performed.",
      ...automatic ? ["Generated node keys are stable within this asset revision, not cross-export BOM identifiers.", ...automatic.warnings] : [],
      ...metadata.source.synthetic ? ["Synthetic development fixture; not real-asset fidelity acceptance."] : [],
      ...metadata.nodes.length < reachable.size ? ["Some render nodes inherit their nearest mapped semantic ancestor."] : [],
      ...tolerated ? errors.map((issue) => `Tolerated optional-extension error ${issue.code}: ${issue.message}`) : [],
      ...validation.issues.messages.filter((issue) => issue.severity === 1).slice(0, 10).map((issue) => `${issue.code}: ${issue.message}`)
    ]
  };
  return { report, metadata: { ...metadata, nodes: metadata.nodes.map((node) => ({ ...node, nodeIndex: metadataIndices.get(node.nodeKey) })) } };
}

// packages/custom-sdk/dist/define.js
function defineCustomApi(meta, run) {
  return { meta: parseWith(CustomFeatureMetaSchema, meta), run };
}
function assertEntity(viewer, entityId) {
  if (!viewer.scene.getDocument().entities.some((entity) => entity.entityId === entityId)) {
    throw new TwinError("E_ENTITY_NOT_FOUND", `\u5B9E\u4F53 ${entityId} \u4E0D\u5728\u5F53\u524D\u573A\u666F\u4E2D`);
  }
}
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new TwinError("E_OPERATION_CANCELLED", "\u8C03\u7528\u5DF2\u53D6\u6D88"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new TwinError("E_OPERATION_CANCELLED", "\u8C03\u7528\u5DF2\u53D6\u6D88"));
    }, { once: true });
  });
}

// packages/custom-sdk/dist/features/pump.js
var focusDevice = defineCustomApi({
  featureId: "pump.focus-device",
  version: 1,
  name: "focusDevice",
  title: "\u805A\u7126\u8BBE\u5907",
  description: "\u9009\u4E2D\u5E76\u98DE\u5230\u6307\u5B9A\u8BBE\u5907\uFF0C\u53EF\u9009\u9694\u79BB\u663E\u793A\uFF08\u5176\u4F59\u8BBE\u5907\u6DE1\u5316\uFF09\u3002",
  category: "\u8BBE\u5907",
  originSceneIds: ["line-a"],
  source: "packages/custom-sdk/src/features/pump.ts",
  params: [
    { name: "entityId", type: "entityId", required: true, description: "\u8BBE\u5907\u5B9E\u4F53 ID\uFF0C\u5982 device-0002" },
    { name: "durationMs", type: "number", required: false, description: "\u98DE\u884C\u65F6\u957F\uFF08\u6BEB\u79D2\uFF09", default: 600 },
    { name: "isolate", type: "boolean", required: false, description: "\u662F\u5426\u9694\u79BB\u663E\u793A", default: false }
  ],
  returns: "{ entityId, name }"
}, async ({ viewer, params }) => {
  assertEntity(viewer, params.entityId);
  viewer.selection.set({ entityId: params.entityId }, "api");
  viewer.selection.isolate(params.isolate ? params.entityId : null);
  await viewer.camera.focus({ entityId: params.entityId }, params.durationMs);
  const entity = viewer.scene.getDocument().entities.find((item) => item.entityId === params.entityId);
  return { entityId: entity.entityId, name: entity.name };
});
var inspectionTour = defineCustomApi({
  featureId: "pump.inspection-tour",
  version: 1,
  name: "inspectionTour",
  title: "\u5DE1\u68C0\u6F2B\u6E38",
  description: "\u4F9D\u6B21\u805A\u7126\u591A\u4E2A\u8BBE\u5907\u5E76\u505C\u7559\uFF0C\u7ED3\u675F\u540E\u6E05\u9664\u9009\u4E2D\uFF1B\u8C03\u7528\u65B9\u53D6\u6D88\u65F6\u7ACB\u5373\u505C\u6B62\u3002",
  category: "\u5DE1\u68C0",
  originSceneIds: ["line-a"],
  source: "packages/custom-sdk/src/features/pump.ts",
  params: [
    { name: "entityIds", type: "array", required: false, description: "\u5DE1\u68C0\u987A\u5E8F\uFF1B\u7F3A\u7701\u4E3A\u573A\u666F\u4E2D\u5168\u90E8\u5E26\u4E1A\u52A1 ID \u7684\u8BBE\u5907" },
    { name: "dwellMs", type: "number", required: false, description: "\u6BCF\u53F0\u8BBE\u5907\u505C\u7559\u65F6\u957F\uFF08\u6BEB\u79D2\uFF09", default: 1200 }
  ],
  returns: "{ visited: string[] }"
}, async ({ viewer, params, api, signal, log }) => {
  const ids = params.entityIds?.length ? params.entityIds : viewer.scene.getDocument().entities.filter((entity) => entity.businessId).map((entity) => entity.entityId);
  if (!ids.length)
    throw new TwinError("E_ENTITY_NOT_FOUND", "\u6CA1\u6709\u53EF\u5DE1\u68C0\u7684\u8BBE\u5907");
  const visited = [];
  for (const entityId of ids) {
    await api.call("focusDevice", { entityId, durationMs: 500 }, { signal });
    log("\u5DE1\u68C0", entityId);
    visited.push(entityId);
    await sleep(params.dwellMs, signal);
  }
  viewer.selection.clear();
  return { visited };
});

// packages/custom-sdk/dist/features/factory.js
var locateEquipment = defineCustomApi({
  featureId: "factory.locate-equipment",
  version: 1,
  name: "locateEquipment",
  title: "\u6309\u4E1A\u52A1\u7F16\u53F7\u5B9A\u4F4D\u8BBE\u5907",
  description: "\u5728\u6848\u4F8B\u4E1A\u52A1\u5B9E\u4F53\u4E2D\u6309 businessId / \u540D\u79F0\uFF08\u5305\u542B\u5339\u914D\uFF09\u67E5\u627E\u8BBE\u5907\uFF0C\u9009\u4E2D\u5E76\u805A\u7126\u5230\u5BF9\u5E94\u6A21\u578B\u8282\u70B9\u3002",
  category: "\u8BBE\u5907",
  originSceneIds: ["factory-dsl"],
  source: "packages/custom-sdk/src/features/factory.ts",
  params: [
    { name: "keyword", type: "string", required: true, description: "\u4E1A\u52A1\u7F16\u53F7\u6216\u540D\u79F0\u5173\u952E\u5B57" },
    { name: "durationMs", type: "number", required: false, description: "\u98DE\u884C\u65F6\u957F\uFF08\u6BEB\u79D2\uFF09", default: 800 }
  ],
  returns: "{ id, name, businessId, matches }"
}, async ({ viewer, params }) => {
  const entities = viewer.scene.getDocument().semantics?.entities || [];
  if (!entities.length)
    throw new TwinError("E_CAPABILITY_UNAVAILABLE", "\u5F53\u524D\u6848\u4F8B\u6CA1\u6709\u4E1A\u52A1\u5B9E\u4F53\uFF08\u9700\u5BFC\u5165 DSL \u573A\u666F\u5305\uFF09");
  const text = params.keyword.trim().toLowerCase();
  const matches = entities.filter((entity) => entity.businessId?.toLowerCase() === text).concat(entities.filter((entity) => entity.businessId?.toLowerCase() !== text && `${entity.businessId || ""} ${entity.name}`.toLowerCase().includes(text)));
  const target = matches[0];
  if (!target)
    throw new TwinError("E_ENTITY_NOT_FOUND", `\u6CA1\u6709\u5339\u914D\u300C${params.keyword}\u300D\u7684\u8BBE\u5907`);
  const ref = { entityId: target.ref.entityId, nodeKey: target.ref.nodeKey };
  viewer.selection.set(ref, "api");
  await viewer.camera.focus(ref, params.durationMs);
  return { id: target.id, name: target.name, businessId: target.businessId ?? null, matches: matches.length };
});

// packages/custom-sdk/dist/registry.js
var CUSTOM_APIS = [
  focusDevice,
  inspectionTour,
  locateEquipment
];
var key = (featureId, version) => `${featureId}@${version}`;
var index = /* @__PURE__ */ new Map();
for (const item of CUSTOM_APIS) {
  const id = key(item.meta.featureId, item.meta.version);
  if (index.has(id))
    throw new Error(`Duplicate customApi implementation ${id}`);
  index.set(id, item);
}
function customApiCatalog() {
  return CUSTOM_APIS.map((item) => structuredClone(item.meta));
}

// packages/custom-sdk/dist/packages.js
var nativeImport = new Function("url", "return import(url)");

// services/platform/dist/package-inspect.js
var BARE_IMPORT = /(?:^|[\s;}])import\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"'./][^"']*)["']/g;
var BARE_DYNAMIC = /\bimport\(\s*["']([^"'./][^"']*)["']\s*\)/g;
var EXPORTS_FUNCTIONS = /export\s*\{[^}]*\bfunctions\b[^}]*\}|export\s+(?:const|let|var)\s+functions\b|export\s+default\b/;
var FORBIDDEN = [
  [/new\s+\w*\.?WebGLRenderer\s*\(/, "\u521B\u5EFA\u4E86\u81EA\u5DF1\u7684 WebGLRenderer\uFF08\u8BF7\u4F7F\u7528 host.renderer\uFF09"],
  [/\.setAnimationLoop\s*\(/, "\u8BBE\u7F6E\u4E86\u81EA\u5DF1\u7684\u6E32\u67D3\u5FAA\u73AF\uFF08\u8BF7\u4F7F\u7528 host.onFrame\uFF09"]
];
var WARNINGS = [
  [/requestAnimationFrame\s*\(/, "\u4F7F\u7528\u4E86 requestAnimationFrame\uFF0C\u5EFA\u8BAE\u6539\u7528 host.onFrame \u4EE5\u4FBF\u7EDF\u4E00\u56DE\u6536"],
  [/document\.(body|querySelector)|\.innerHTML\s*=/, "\u76F4\u63A5\u64CD\u4F5C\u9875\u9762 DOM\uFF1B\u5B9A\u5236\u63A5\u53E3\u4E0D\u5E94\u751F\u6210\u9875\u9762 UI"],
  [/REVISION\s*=\s*["']\d+/, "\u7591\u4F3C\u6253\u5305\u4E86\u72EC\u7ACB\u7684 three.js \u526F\u672C\uFF08\u5E94\u7531\u5BBF\u4E3B\u6CE8\u5165\uFF09"]
];
function inspectPackageCode(code) {
  const errors = [];
  const bare = /* @__PURE__ */ new Set();
  for (const pattern of [BARE_IMPORT, BARE_DYNAMIC])
    for (const match of code.matchAll(pattern))
      bare.add(match[1]);
  if (bare.size)
    errors.push(`\u5B58\u5728\u672A\u6253\u5305\u7684\u6A21\u5757\u4F9D\u8D56\uFF1A${[...bare].slice(0, 8).join(", ")}\uFF08three \u987B\u6620\u5C04\u5230\u5BBF\u4E3B\uFF0C\u5176\u4F59\u4F9D\u8D56\u987B\u6253\u8FDB\u5305\u5185\uFF09`);
  if (!EXPORTS_FUNCTIONS.test(code))
    errors.push("\u672A\u5BFC\u51FA functions \u6570\u7EC4");
  for (const [pattern, text] of FORBIDDEN)
    if (pattern.test(code))
      errors.push(text);
  return { errors, warnings: WARNINGS.filter(([pattern]) => pattern.test(code)).map(([, text]) => text) };
}

// services/platform/dist/store.js
var digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
var encode = (value) => Buffer.from(JSON.stringify(value), "utf8");
function errorCode(error, code) {
  return error instanceof Error && "code" in error && error.code === code;
}
function jsonText(value) {
  if (typeof value !== "string")
    throw new TwinError("E_STORAGE", "Stored record is not JSON text");
  try {
    return JSON.parse(value);
  } catch (error) {
    if (error instanceof SyntaxError)
      throw new TwinError("E_STORAGE", "Stored JSON is corrupt");
    throw error;
  }
}
var BlobStore = class {
  directory;
  constructor(directory) {
    this.directory = directory;
    mkdirSync(directory, { recursive: true });
  }
  filename(hash) {
    return path.join(this.directory, parseWith(HashSchema, hash));
  }
  async put(bytes) {
    const hash = digest(bytes);
    const target = this.filename(hash);
    const temp = path.join(this.directory, `${hash}.${randomUUID()}.tmp`);
    await writeFile(temp, bytes, { flag: "wx" });
    try {
      try {
        await link(temp, target);
      } catch (error) {
        if (!errorCode(error, "EEXIST"))
          throw error;
        await this.read(hash);
      }
    } finally {
      await unlink(temp);
    }
    return hash;
  }
  async read(hash) {
    let bytes;
    try {
      bytes = await readFile(this.filename(hash));
    } catch (error) {
      if (errorCode(error, "ENOENT"))
        throw new TwinError("E_STORAGE", `Content ${hash} is missing`);
      throw error;
    }
    if (digest(bytes) !== hash)
      throw new TwinError("E_STORAGE", `Content integrity check failed: ${hash}`);
    return bytes;
  }
  async readJSON(hash) {
    return jsonText((await this.read(hash)).toString("utf8"));
  }
};
var PlatformStore = class {
  directory;
  catalog;
  db;
  blobs;
  constructor(directory, catalog = customApiCatalog) {
    this.directory = directory;
    this.catalog = catalog;
    mkdirSync(directory, { recursive: true });
    this.blobs = new BlobStore(path.join(directory, "objects"));
    this.db = new DatabaseSync(path.join(directory, "platform.sqlite"));
    this.db.exec(`
      PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY, job_key TEXT UNIQUE NOT NULL, status TEXT NOT NULL,
        lease_until INTEGER NOT NULL DEFAULT 0, record TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS assets (
        asset_id TEXT NOT NULL, revision TEXT NOT NULL, record TEXT NOT NULL,
        PRIMARY KEY(asset_id, revision)
      );
      CREATE TABLE IF NOT EXISTS scenes (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, version INTEGER NOT NULL,
        draft TEXT NOT NULL, updated_at INTEGER NOT NULL, published_revision TEXT
      );
      CREATE TABLE IF NOT EXISTS releases (
        scene_id TEXT NOT NULL REFERENCES scenes(id), revision TEXT NOT NULL,
        record TEXT NOT NULL, PRIMARY KEY(scene_id, revision)
      );
      CREATE TABLE IF NOT EXISTS audit (
        id TEXT PRIMARY KEY, at INTEGER NOT NULL, action TEXT NOT NULL, subject TEXT NOT NULL, actor TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS custom_features (
        feature_id TEXT NOT NULL, version INTEGER NOT NULL, origin_scene_id TEXT NOT NULL, record TEXT NOT NULL,
        PRIMARY KEY(feature_id, version)
      );
      CREATE TABLE IF NOT EXISTS scene_custom_apis (
        scene_id TEXT PRIMARY KEY REFERENCES scenes(id), bindings TEXT NOT NULL, updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS custom_api_packages (
        hash TEXT PRIMARY KEY, package_id TEXT NOT NULL, version TEXT NOT NULL, scene_id TEXT, record TEXT NOT NULL, created_at INTEGER NOT NULL
      );
    `);
  }
  close() {
    this.db.close();
  }
  transaction(operation) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = operation();
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  audit(action, subject, actor) {
    this.db.prepare("INSERT INTO audit VALUES (?, ?, ?, ?, ?)").run(randomUUID(), Date.now(), action, subject, actor);
  }
  recordAudit(action, subject, actor) {
    this.audit(action, subject.slice(0, 200), actor.slice(0, 200));
  }
  record(schema, query, ...parameters) {
    const row = this.db.prepare(query).get(...parameters);
    if (!row)
      throw new TwinError("E_NOT_FOUND", "Requested record does not exist");
    return parseWith(schema, jsonText(row.record));
  }
  async importAsset(bytes, rawMetadata, actor, original) {
    if (bytes.byteLength > MAX_ASSET_BYTES)
      throw new TwinError("E_INVALID_ARGUMENT", `Asset exceeds ${MAX_ASSET_BYTES / 1024 / 1024} MiB limit`);
    const metadata = parseWith(external_exports.union([AssetImportOptionsSchema, AssetMetadataSchema]), rawMetadata);
    if (original && (!original.bytes.length || original.bytes.length > MAX_ASSET_BYTES))
      throw new TwinError("E_INVALID_ARGUMENT", `Original file must be between 1 byte and ${MAX_ASSET_BYTES / 1024 / 1024} MiB`);
    if ("mode" in metadata && metadata.sourceFormat === "fbx" && !original)
      throw new TwinError("E_INVALID_ARGUMENT", "FBX imports require the original FBX file");
    const source = original ? parseWith(AssetSourceSchema, {
      filename: original.filename,
      format: "mode" in metadata ? metadata.sourceFormat : "glb",
      originalHash: await this.blobs.put(original.bytes)
    }) : void 0;
    const sourceHash = await this.blobs.put(bytes);
    const metadataHash = await this.blobs.put(encode(metadata));
    const key2 = `${metadata.assetId}:${sourceHash}:${metadataHash}:${source?.originalHash || ""}:${PIPELINE_VERSION}`;
    return this.transaction(() => {
      const existing = this.db.prepare("SELECT record FROM jobs WHERE job_key=?").get(key2);
      if (existing)
        return parseWith(ConversionJobSchema, jsonText(existing.record));
      const pending = this.db.prepare("SELECT COUNT(*) AS count FROM jobs WHERE status IN ('queued','running')").get();
      if (Number(pending?.count) >= 100)
        throw new TwinError("E_QUEUE_LIMIT", "Asset queue is full");
      const job = {
        id: randomUUID(),
        status: "queued",
        assetId: metadata.assetId,
        sourceHash,
        metadataHash,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        attempts: 0,
        source
      };
      this.db.prepare("INSERT INTO jobs (id,job_key,status,record) VALUES (?,?,?,?)").run(job.id, key2, job.status, JSON.stringify(job));
      this.audit("asset.import", job.id, actor);
      return job;
    });
  }
  jobs() {
    return this.db.prepare("SELECT record FROM jobs ORDER BY rowid DESC LIMIT 100").all().map((row) => parseWith(ConversionJobSchema, jsonText(row.record)));
  }
  job(id) {
    return this.record(ConversionJobSchema, "SELECT record FROM jobs WHERE id=?", parseWith(IdSchema, id));
  }
  retryJob(id, actor) {
    return this.transaction(() => {
      const job = this.job(id);
      if (job.status !== "failed" || job.attempts >= 3)
        throw new TwinError("E_INVALID_ARGUMENT", "Only failed jobs with fewer than three attempts can be retried");
      const retry = { ...job, status: "queued", error: void 0, updatedAt: Date.now() };
      this.db.prepare("UPDATE jobs SET status=?,lease_until=0,record=? WHERE id=?").run(retry.status, JSON.stringify(retry), id);
      this.audit("asset.retry", id, actor);
      return retry;
    });
  }
  claimJob() {
    return this.transaction(() => {
      const rows = this.db.prepare("SELECT record FROM jobs WHERE status='queued' OR (status='running' AND lease_until<?) ORDER BY rowid LIMIT 10").all(Date.now());
      for (const row of rows) {
        const job = parseWith(ConversionJobSchema, jsonText(row.record));
        if (job.attempts >= 3) {
          const failed = { ...job, status: "failed", updatedAt: Date.now(), error: { code: "E_STORAGE", message: "Worker lease expired too many times" } };
          this.db.prepare("UPDATE jobs SET status=?,record=? WHERE id=?").run(failed.status, JSON.stringify(failed), job.id);
          continue;
        }
        const claimed = { ...job, status: "running", attempts: job.attempts + 1, updatedAt: Date.now() };
        this.db.prepare("UPDATE jobs SET status=?,lease_until=?,record=? WHERE id=?").run(claimed.status, Date.now() + 6e4, JSON.stringify(claimed), claimed.id);
        return claimed;
      }
      return null;
    });
  }
  async processNextJob() {
    const job = this.claimJob();
    if (!job)
      return false;
    try {
      const metadata = parseWith(external_exports.union([AssetImportOptionsSchema, AssetMetadataSchema]), await this.blobs.readJSON(job.metadataHash));
      const bytes = await this.blobs.read(job.sourceHash);
      const inspected = await inspectGlb(bytes, metadata);
      const normalizedMetadataHash = await this.blobs.put(encode(inspected.metadata));
      const revision = `a-${digest(`${job.sourceHash}:${normalizedMetadataHash}:${PIPELINE_VERSION}`).slice(0, 24)}`;
      const version = {
        assetId: job.assetId,
        assetRevision: revision,
        contentHash: job.sourceHash,
        metadataHash: normalizedMetadataHash,
        name: metadata.name,
        createdAt: Date.now(),
        metadata: inspected.metadata,
        report: inspected.report,
        source: job.source
      };
      this.transaction(() => {
        const current = this.job(job.id);
        if (current.status !== "running" || current.attempts !== job.attempts)
          throw new TwinError("E_REVISION_CONFLICT", "Job lease ownership changed");
        this.db.prepare("INSERT OR IGNORE INTO assets VALUES (?,?,?)").run(version.assetId, revision, JSON.stringify(version));
        const ready = { ...job, status: "ready", assetRevision: revision, updatedAt: Date.now() };
        this.db.prepare("UPDATE jobs SET status=?,lease_until=0,record=? WHERE id=?").run(ready.status, JSON.stringify(ready), job.id);
        this.audit("asset.ready", job.id, "worker");
      });
    } catch (error) {
      const failure = error instanceof TwinError ? error : new TwinError("E_STORAGE", "Asset processing failed; inspect worker diagnostics");
      console.error("Asset job failed", { jobId: job.id, code: failure.code, error });
      this.transaction(() => {
        const current = this.job(job.id);
        if (current.status !== "running" || current.attempts !== job.attempts)
          return;
        const failed = { ...job, status: "failed", updatedAt: Date.now(), error: { code: failure.code, message: failure.message } };
        this.db.prepare("UPDATE jobs SET status=?,lease_until=0,record=? WHERE id=?").run(failed.status, JSON.stringify(failed), job.id);
        this.audit("asset.failed", job.id, "worker");
      });
    }
    return true;
  }
  assets() {
    return this.db.prepare("SELECT record FROM assets ORDER BY rowid DESC").all().map((row) => parseWith(AssetVersionSchema, jsonText(row.record)));
  }
  asset(id, revision) {
    return this.record(AssetVersionSchema, "SELECT record FROM assets WHERE asset_id=? AND revision=?", parseWith(IdSchema, id), parseWith(IdSchema, revision));
  }
  releasedAssets() {
    const refs = /* @__PURE__ */ new Set();
    for (const row of this.db.prepare("SELECT record FROM releases").all()) {
      const release = parseWith(ReleaseSchema, jsonText(row.record));
      for (const asset of release.document.assets)
        refs.add(`${asset.assetId}@${asset.assetRevision}`);
    }
    return refs;
  }
  publicAssets() {
    const refs = this.releasedAssets();
    return this.assets().filter((asset) => refs.has(`${asset.assetId}@${asset.assetRevision}`));
  }
  mayReadAsset(id, revision) {
    return this.releasedAssets().has(`${id}@${revision}`);
  }
  mayReadBlob(hash) {
    return this.publicAssets().some((asset) => asset.contentHash === hash || asset.metadataHash === hash);
  }
  /** Cheap single-scene lookup for hot paths (delivery / object reads). */
  sceneHead(id) {
    const row = this.db.prepare("SELECT id,name,published_revision FROM scenes WHERE id=?").get(id);
    return row ? { sceneId: String(row.id), name: String(row.name), publishedRevision: row.published_revision ? String(row.published_revision) : null } : null;
  }
  summaries() {
    return this.db.prepare("SELECT id,name,version,published_revision,updated_at,draft FROM scenes ORDER BY updated_at DESC").all().map((row) => {
      const draft = jsonText(row.draft);
      let publishedAt = null;
      if (row.published_revision) {
        const release = this.db.prepare("SELECT record FROM releases WHERE scene_id=? AND revision=?").get(row.id, row.published_revision);
        if (release)
          publishedAt = Number(jsonText(release.record).createdAt) || null;
      }
      return parseWith(SceneSummarySchema, {
        sceneId: row.id,
        name: row.name,
        draftVersion: row.version,
        publishedRevision: row.published_revision,
        updatedAt: row.updated_at,
        publishedAt,
        entityCount: draft.entities?.length || 0,
        assetCount: draft.assets?.length || 0,
        semanticCount: draft.semantics?.entities?.length || 0,
        contract: draft.semantics?.contract || null,
        customApiCount: this.customApis(String(row.id)).length
      });
    });
  }
  draft(id) {
    const row = this.db.prepare("SELECT version,draft,updated_at FROM scenes WHERE id=?").get(parseWith(IdSchema, id));
    if (!row)
      throw new TwinError("E_NOT_FOUND", "Scene does not exist");
    return parseWith(DraftSchema, { version: row.version, document: jsonText(row.draft), updatedAt: row.updated_at });
  }
  createScene(raw, actor) {
    const document = parseScene(raw);
    if (document.sceneRevision !== "draft")
      throw new TwinError("E_INVALID_ARGUMENT", "New scenes must use the draft revision");
    return this.transaction(() => {
      if (this.db.prepare("SELECT id FROM scenes WHERE id=?").get(document.sceneId))
        throw new TwinError("E_REVISION_CONFLICT", "Scene already exists");
      const time = Date.now();
      this.db.prepare("INSERT INTO scenes VALUES (?,?,?,?,?,NULL)").run(document.sceneId, document.name, 1, JSON.stringify(document), time);
      this.audit("scene.create", document.sceneId, actor);
      return this.draft(document.sceneId);
    });
  }
  saveDraft(id, raw, expectedVersion, actor) {
    const document = parseScene(raw);
    if (document.sceneId !== id || document.sceneRevision !== "draft")
      throw new TwinError("E_INVALID_ARGUMENT", "Draft scene identity/revision mismatch");
    return this.transaction(() => {
      this.draft(id);
      const result = this.db.prepare("UPDATE scenes SET name=?,draft=?,version=version+1,updated_at=? WHERE id=? AND version=?").run(document.name, JSON.stringify(document), Date.now(), id, expectedVersion);
      if (Number(result.changes) !== 1)
        throw new TwinError("E_REVISION_CONFLICT", "Draft changed; reload and merge instead of overwriting");
      this.audit("scene.save", id, actor);
      return this.draft(id);
    });
  }
  async validateDocument(document) {
    const metadata = /* @__PURE__ */ new Map();
    for (const ref of document.assets) {
      const asset = this.asset(ref.assetId, ref.assetRevision);
      if (asset.contentHash !== ref.contentHash || asset.metadataHash !== ref.metadataHash)
        throw new TwinError("E_INVALID_ARGUMENT", "Asset reference hash mismatch");
      await this.blobs.read(asset.contentHash);
      const meta = parseMetadata(await this.blobs.readJSON(asset.metadataHash));
      metadata.set(`${ref.assetId}@${ref.assetRevision}`, meta);
      if (asset.report.hasSkins && document.entities.some((entity) => entity.assetRef?.assetId === ref.assetId && entity.assetRef.assetRevision === ref.assetRevision && entity.renderMode === "instanced")) {
        throw new TwinError("E_CAPABILITY_UNAVAILABLE", "P0 instancing does not support skinned assets");
      }
    }
    validateSceneAssets(document, metadata);
  }
  async publish(id, expectedVersion, actor) {
    const draft = this.draft(id);
    if (draft.version !== expectedVersion)
      throw new TwinError("E_REVISION_CONFLICT", "Draft version changed");
    await this.validateDocument(draft.document);
    const customApis = this.customApis(id);
    this.resolveCustomApis(customApis);
    const revision = `r-${randomUUID()}`;
    const document = parseScene({ ...draft.document, sceneRevision: revision });
    const manifestHash = await this.blobs.put(encode(document));
    const release = { revision, manifestHash, createdAt: Date.now(), sourceDraftVersion: draft.version, document, customApis };
    return this.transaction(() => {
      if (this.draft(id).version !== expectedVersion)
        throw new TwinError("E_REVISION_CONFLICT", "Draft changed during publication; publication not activated");
      this.db.prepare("INSERT INTO releases VALUES (?,?,?)").run(id, revision, JSON.stringify(release));
      this.db.prepare("UPDATE scenes SET published_revision=? WHERE id=?").run(revision, id);
      this.audit("scene.publish", `${id}:${revision}`, actor);
      return release;
    });
  }
  releases(id) {
    this.draft(id);
    return this.db.prepare("SELECT record FROM releases WHERE scene_id=? ORDER BY rowid DESC").all(id).map((row) => parseWith(ReleaseSchema, jsonText(row.record)));
  }
  async release(id, requested = "published") {
    let revision = requested;
    if (revision === "published") {
      const summary = this.sceneHead(id);
      if (!summary?.publishedRevision)
        throw new TwinError("E_NOT_FOUND", "Scene has no published version");
      revision = summary.publishedRevision;
    }
    const release = this.record(ReleaseSchema, "SELECT record FROM releases WHERE scene_id=? AND revision=?", parseWith(IdSchema, id), parseWith(IdSchema, revision));
    const document = parseScene(await this.blobs.readJSON(release.manifestHash));
    if (document.sceneRevision !== revision || document.sceneId !== id)
      throw new TwinError("E_STORAGE", "Release identity mismatch");
    return { ...release, document };
  }
  async rollback(id, revision, expectedPublishedRevision, actor) {
    const release = await this.release(id, revision);
    await this.validateDocument(release.document);
    this.transaction(() => {
      const result = this.db.prepare("UPDATE scenes SET published_revision=? WHERE id=? AND published_revision=?").run(revision, id, expectedPublishedRevision);
      if (Number(result.changes) !== 1)
        throw new TwinError("E_REVISION_CONFLICT", "Published version changed; reload before rolling back");
      this.audit("scene.rollback", `${id}:${revision}`, actor);
    });
    return release;
  }
  /* ---------------- customApi: library comes from code (@twin/custom-sdk), cases only bind function@version ---------------- */
  /** Built-in (@twin/custom-sdk) functions plus every function shipped in an uploaded package. */
  features() {
    return [...this.catalog(), ...this.packageFeatures()];
  }
  customApiPackages() {
    return this.db.prepare("SELECT record FROM custom_api_packages ORDER BY created_at DESC").all().map((row) => parseWith(CustomApiPackageSchema, jsonText(row.record)));
  }
  packageFeatures() {
    return this.customApiPackages().flatMap((pkg) => pkg.manifest.functions.map((fn) => parseWith(CustomFeatureMetaSchema, {
      ...fn,
      featureId: fn.featureId ?? `${pkg.packageId}.${fn.name}`,
      originSceneIds: fn.originSceneIds.length ? fn.originSceneIds : pkg.sceneId ? [pkg.sceneId] : [],
      source: fn.source || `${pkg.packageId}@${pkg.version}/${pkg.manifest.entry}`,
      origin: "package",
      package: { packageId: pkg.packageId, packageVersion: pkg.version, hash: pkg.hash }
    })));
  }
  /**
   * Stores a customApi package (manifest + pre-bundled ES module). A function id@version is immutable:
   * re-uploading identical bytes is a no-op, changed code under an existing function version is rejected.
   */
  async uploadCustomApiPackage(raw, actor) {
    const body = parseWith(external_exports.object({ sceneId: IdSchema.nullable().default(null), manifest: external_exports.unknown(), code: external_exports.string().min(1).max(16 * 1024 * 1024) }).strict(), raw);
    const manifest = parseWith(CustomApiPackageManifestSchema, body.manifest);
    const bytes = Buffer.from(body.code, "utf8");
    const hash = digest(bytes);
    if (hash !== manifest.sha256)
      throw new TwinError("E_INVALID_ARGUMENT", `\u5165\u53E3\u6587\u4EF6 sha256 \u4E0E manifest \u4E0D\u4E00\u81F4\uFF08\u5B9E\u9645 ${hash}\uFF09`);
    if (body.sceneId && !this.sceneHead(body.sceneId))
      throw new TwinError("E_NOT_FOUND", "Case does not exist");
    const existing = this.db.prepare("SELECT record FROM custom_api_packages WHERE hash=?").get(hash);
    if (existing)
      return parseWith(CustomApiPackageSchema, jsonText(existing.record));
    const { errors, warnings } = inspectPackageCode(body.code);
    if (errors.length)
      throw new TwinError("E_UNSUPPORTED_ASSET", `customApi \u5305\u4E0D\u53EF\u8FD0\u884C\uFF1A${errors.join("\uFF1B")}`, { errors });
    const taken = new Map(this.features().map((meta) => [`${meta.featureId}@${meta.version}`, meta]));
    for (const fn of manifest.functions) {
      const key2 = `${fn.featureId ?? `${manifest.packageId}.${fn.name}`}@${fn.version}`;
      const other = taken.get(key2);
      if (other && !(other.origin === "package" && other.package?.packageId === manifest.packageId))
        throw new TwinError("E_REVISION_CONFLICT", `\u51FD\u6570 ${key2} \u5DF2\u5B58\u5728\uFF08${other.origin === "sdk" ? "\u5B9A\u5236 SDK" : `\u5305 ${other.package?.packageId}@${other.package?.packageVersion}`}\uFF09\uFF0C\u4FEE\u6539\u5B9E\u73B0\u8BF7\u63D0\u5347\u51FD\u6570 version`);
    }
    await this.blobs.put(bytes);
    const record = parseWith(CustomApiPackageSchema, {
      hash,
      packageId: manifest.packageId,
      version: manifest.version,
      sceneId: body.sceneId,
      uploadedAt: Date.now(),
      uploadedBy: actor,
      bytes: bytes.byteLength,
      warnings,
      manifest
    });
    this.transaction(() => {
      this.db.prepare("INSERT INTO custom_api_packages VALUES (?,?,?,?,?,?)").run(hash, record.packageId, record.version, record.sceneId, JSON.stringify(record), record.uploadedAt);
      this.audit("customApi.package", `${record.packageId}@${record.version}:${hash.slice(0, 12)}`, actor);
    });
    return record;
  }
  /** Package hashes a release needs at runtime (delivery may read exactly these objects). */
  async releasePackageHashes(sceneId) {
    const { definitions } = await this.customApisAt(sceneId, "published");
    return new Set(definitions.flatMap((item) => item.package ? [item.package.hash] : []));
  }
  /** Every implemented function (latest version first) with the cases binding it. */
  featureLibrary() {
    const scenes = new Map(this.db.prepare("SELECT id,published_revision FROM scenes").all().map((row) => [String(row.id), Boolean(row.published_revision)]));
    const usage = /* @__PURE__ */ new Map();
    for (const row of this.db.prepare("SELECT scene_id,bindings FROM scene_custom_apis").all()) {
      const sceneId = String(row.scene_id);
      for (const binding of parseWith(CustomApiBindingsSchema, jsonText(row.bindings))) {
        const list = usage.get(binding.featureId) || [];
        list.push({ sceneId, name: binding.name, version: binding.version, published: scenes.get(sceneId) || false });
        usage.set(binding.featureId, list);
      }
    }
    const byId = /* @__PURE__ */ new Map();
    for (const meta of this.latestFeatures())
      byId.set(meta.featureId, [...byId.get(meta.featureId) || [], meta]);
    return [...byId.values()].map((versions) => {
      versions.sort((a, b) => b.version - a.version);
      return { latest: versions[0], versions, usedBy: usage.get(versions[0].featureId) || [] };
    });
  }
  /** One entry per function version: the most recently uploaded package wins over older ones re-shipping it. */
  latestFeatures() {
    const seen = /* @__PURE__ */ new Set();
    return this.features().filter((meta) => {
      const key2 = `${meta.featureId}@${meta.version}`;
      if (seen.has(key2))
        return false;
      seen.add(key2);
      return true;
    });
  }
  /** Draft bindings of a case (published releases keep their own frozen copy). */
  customApis(sceneId) {
    const row = this.db.prepare("SELECT bindings FROM scene_custom_apis WHERE scene_id=?").get(sceneId);
    return row ? parseWith(CustomApiBindingsSchema, jsonText(row.bindings)) : [];
  }
  setCustomApis(sceneId, raw, actor) {
    this.draft(sceneId);
    const latest = new Map(this.latestFeatures().map((meta) => [`${meta.featureId}@${meta.version}`, meta]));
    const bindings = parseWith(CustomApiBindingsSchema, raw).map((binding) => {
      const meta = latest.get(`${binding.featureId}@${binding.version}`);
      if (meta?.origin !== "package") {
        const { packageHash: _drop, ...rest } = binding;
        return rest;
      }
      return { ...binding, packageHash: binding.packageHash ?? meta.package.hash };
    });
    this.resolveCustomApis(bindings);
    return this.transaction(() => {
      this.db.prepare("INSERT INTO scene_custom_apis VALUES (?,?,?) ON CONFLICT(scene_id) DO UPDATE SET bindings=excluded.bindings, updated_at=excluded.updated_at").run(sceneId, JSON.stringify(bindings), Date.now());
      this.audit("scene.customApis", `${sceneId}:${bindings.map((item) => `${item.name}=${item.featureId}@${item.version}`).join(",")}`.slice(0, 200), actor);
      return bindings;
    });
  }
  resolveCustomApis(bindings) {
    const all = this.features();
    const catalog = new Map(this.latestFeatures().map((meta) => [`${meta.featureId}@${meta.version}`, meta]));
    return bindings.map((binding) => {
      const feature = binding.packageHash ? all.find((meta) => meta.featureId === binding.featureId && meta.version === binding.version && meta.package?.hash === binding.packageHash) : catalog.get(`${binding.featureId}@${binding.version}`);
      if (!feature)
        throw new TwinError("E_NOT_FOUND", `customApi ${binding.name} \u5F15\u7528\u7684\u51FD\u6570 ${binding.featureId}@v${binding.version} \u4E0D\u5728\u5B9A\u5236 SDK \u6216\u5DF2\u4E0A\u4F20\u7684\u63A5\u53E3\u5305\u4E2D`);
      return { ...feature, name: binding.name, featureName: feature.name };
    });
  }
  /** Bindings of a case version: 'draft', 'published' or a release revision. */
  async customApisAt(sceneId, revision) {
    if (revision === "draft") {
      this.draft(sceneId);
      const bindings2 = this.customApis(sceneId);
      return { revision, bindings: bindings2, definitions: this.resolveCustomApis(bindings2) };
    }
    const release = await this.release(sceneId, revision);
    const bindings = release.customApis || [];
    return { revision: release.revision, bindings, definitions: this.resolveCustomApis(bindings) };
  }
  auditEvents() {
    const schema = external_exports.object({ id: external_exports.string(), at: external_exports.number(), action: external_exports.string(), subject: external_exports.string(), actor: external_exports.string() });
    return this.db.prepare("SELECT * FROM audit ORDER BY at DESC LIMIT 100").all().map((row) => parseWith(schema, row));
  }
};

// services/platform/dist/worker.js
var store = new PlatformStore(path2.resolve(process.env.TWIN_DATA_DIR || ".data"));
var stopped = false;
process.once("SIGINT", () => {
  stopped = true;
});
process.once("SIGTERM", () => {
  stopped = true;
});
console.log("Asset worker started; normalized GLB validation, automatic metadata and versioned packaging.");
try {
  while (!stopped)
    if (!await store.processNextJob())
      await delay(300);
} catch (error) {
  console.error("Asset worker stopped unexpectedly", error);
  process.exitCode = 1;
} finally {
  store.close();
}
