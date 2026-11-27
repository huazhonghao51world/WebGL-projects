import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// services/platform/dist/volume-worker.js
import { parentPort, workerData } from "node:worker_threads";

// services/platform/dist/volume.js
import { mkdir, readFile, rename, stat as stat2, writeFile } from "node:fs/promises";

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
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
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
  const { data, path: path2, errorMaps, issueData } = params;
  const fullPath = [...path2, ...issueData.path || []];
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
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
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
  constructor(parent, value, path2, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path2;
    this._key = key;
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
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
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
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
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
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
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
  setKey(key, schema) {
    return this.augment({ [key]: schema });
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
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
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
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
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
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
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
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
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
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
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
function validateTree(nodes, ctx, path2) {
  const parents = new Map(nodes.map((node) => [node.key, node.parent]));
  if (parents.size !== nodes.length)
    ctx.addIssue({ code: "custom", path: [path2], message: "Duplicate stable identifiers" });
  for (const node of nodes) {
    const seen = /* @__PURE__ */ new Set([node.key]);
    let parent = node.parent;
    while (parent !== null) {
      if (!parents.has(parent)) {
        ctx.addIssue({ code: "custom", path: [path2], message: `Missing parent ${parent}` });
        break;
      }
      if (seen.has(parent)) {
        ctx.addIssue({ code: "custom", path: [path2], message: `Hierarchy cycle at ${parent}` });
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
  for (const key of LEGACY_SCENE_KEYS)
    delete copy[key];
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
    for (let index = 0; index < 16; index++)
      bytes[index] = Math.floor(Math.random() * 256);
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

// packages/runtime/dist/vtk/types.js
var CELL = {
  VERTEX: 1,
  POLY_VERTEX: 2,
  LINE: 3,
  POLY_LINE: 4,
  TRIANGLE: 5,
  TRIANGLE_STRIP: 6,
  POLYGON: 7,
  PIXEL: 8,
  QUAD: 9,
  TETRA: 10,
  VOXEL: 11,
  HEXAHEDRON: 12,
  WEDGE: 13,
  PYRAMID: 14,
  QUADRATIC_EDGE: 21,
  QUADRATIC_TRIANGLE: 22,
  QUADRATIC_QUAD: 23,
  QUADRATIC_TETRA: 24,
  QUADRATIC_HEXAHEDRON: 25,
  QUADRATIC_WEDGE: 26,
  QUADRATIC_PYRAMID: 27,
  POLYHEDRON: 42
};
var U32Builder = class {
  buffer;
  length = 0;
  constructor(capacity = 1024) {
    this.buffer = new Uint32Array(Math.max(16, capacity));
  }
  push(value) {
    if (this.length === this.buffer.length) {
      const next = new Uint32Array(this.buffer.length * 2);
      next.set(this.buffer);
      this.buffer = next;
    }
    this.buffer[this.length++] = value;
  }
  finish() {
    return this.buffer.slice(0, this.length);
  }
};
var VtkFormatError = class extends Error {
  code;
  constructor(message, code = "E_UNSUPPORTED_ASSET") {
    super(message);
    this.code = code;
    this.name = "VtkFormatError";
  }
};

// packages/runtime/dist/vtk/legacy.js
var SIZES = {
  bit: 0,
  unsigned_char: 1,
  char: 1,
  unsigned_short: 2,
  short: 2,
  unsigned_int: 4,
  int: 4,
  unsigned_long: 8,
  long: 8,
  float: 4,
  double: 8,
  vtktypeint64: 8,
  vtktypeuint64: 8,
  vtkidtype: 8,
  vtktypeint32: 4,
  vtktypeuint32: 4
};
var Reader = class {
  bytes;
  binary;
  pos = 0;
  view;
  constructor(bytes, binary) {
    this.bytes = bytes;
    this.binary = binary;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  get done() {
    this.skipSpace();
    return this.pos >= this.bytes.length;
  }
  skipSpace() {
    const b = this.bytes;
    while (this.pos < b.length && b[this.pos] <= 32)
      this.pos++;
  }
  /** Next whitespace-delimited token (empty at EOF). */
  token() {
    this.skipSpace();
    const b = this.bytes;
    const start = this.pos;
    while (this.pos < b.length && b[this.pos] > 32)
      this.pos++;
    let text = "";
    for (let i = start; i < this.pos; i++)
      text += String.fromCharCode(b[i]);
    return text;
  }
  /** Rest of the current line, trimmed. */
  line() {
    const b = this.bytes;
    let text = "";
    while (this.pos < b.length && b[this.pos] !== 10)
      text += String.fromCharCode(b[this.pos++]);
    if (this.pos < b.length)
      this.pos++;
    return text.trim();
  }
  /** Next non-empty line. */
  nextLine() {
    let text = "";
    while (!text && this.pos < this.bytes.length)
      text = this.line();
    return text;
  }
  int() {
    const t = this.token();
    const v = Number(t);
    if (!Number.isFinite(v))
      throw new VtkFormatError(`Expected a number, got "${t}"`);
    return v;
  }
  /** Positions the cursor at the first byte of a binary block (after the header line's newline). */
  enterBinary() {
    const b = this.bytes;
    if (this.pos > 0 && b[this.pos - 1] === 10)
      return;
    while (this.pos < b.length && b[this.pos] !== 10)
      this.pos++;
    this.pos++;
  }
  numbers(count, type, out = new Float32Array(count)) {
    const kind = type.toLowerCase();
    if (!this.binary) {
      for (let i = 0; i < count; i++) {
        const t = this.token();
        if (!t)
          throw new VtkFormatError("Unexpected end of file");
        out[i] = Number(t);
      }
      return out;
    }
    const size = SIZES[kind];
    if (!size)
      throw new VtkFormatError(`Unsupported binary data type ${type}`);
    this.enterBinary();
    const v = this.view;
    let p = this.pos;
    if (p + count * size > this.bytes.length)
      throw new VtkFormatError("Binary block exceeds file size");
    for (let i = 0; i < count; i++, p += size) {
      switch (kind) {
        case "float":
          out[i] = v.getFloat32(p);
          break;
        case "double":
          out[i] = v.getFloat64(p);
          break;
        case "int":
        case "vtktypeint32":
          out[i] = v.getInt32(p);
          break;
        case "unsigned_int":
        case "vtktypeuint32":
          out[i] = v.getUint32(p);
          break;
        case "short":
          out[i] = v.getInt16(p);
          break;
        case "unsigned_short":
          out[i] = v.getUint16(p);
          break;
        case "char":
          out[i] = v.getInt8(p);
          break;
        case "unsigned_char":
          out[i] = v.getUint8(p);
          break;
        default:
          out[i] = Number(v.getBigInt64(p));
          break;
      }
    }
    this.pos = p;
    return out;
  }
  /** Raw unsigned bytes (COLOR_SCALARS in binary files). */
  bytesAsUnit(count) {
    this.enterBinary();
    const out = new Float32Array(count);
    for (let i = 0; i < count; i++)
      out[i] = this.bytes[this.pos + i] / 255;
    this.pos += count;
    return out;
  }
};
function readCellBlock(r, version, first, second) {
  if (version >= 5) {
    const kw = r.token().toUpperCase();
    if (kw !== "OFFSETS")
      throw new VtkFormatError(`Expected OFFSETS, got ${kw}`);
    const offsets2 = r.numbers(first, r.token(), new Uint32Array(first));
    const kw2 = r.token().toUpperCase();
    if (kw2 !== "CONNECTIVITY")
      throw new VtkFormatError(`Expected CONNECTIVITY, got ${kw2}`);
    const connectivity2 = r.numbers(second, r.token(), new Uint32Array(second));
    return { offsets: offsets2, connectivity: connectivity2 };
  }
  const raw = r.numbers(second, "int", new Uint32Array(second));
  const offsets = new Uint32Array(first + 1);
  const connectivity = new Uint32Array(second - first);
  let p = 0;
  let c = 0;
  for (let i = 0; i < first; i++) {
    const n = raw[p++];
    offsets[i] = c;
    for (let k = 0; k < n; k++)
      connectivity[c++] = raw[p++];
  }
  offsets[first] = c;
  return { offsets, connectivity };
}
function structuredCells(dims) {
  const [nx, ny, nz] = dims;
  const id = (p) => p[0] + nx * (p[1] + ny * p[2]);
  const axes = [0, 1, 2].filter((axis) => dims[axis] > 1);
  const types = [];
  const conn = new U32Builder();
  const offs = new U32Builder();
  offs.push(0);
  if (axes.length < 2)
    return { cellTypes: new Uint8Array(0), offsets: offs.finish(), connectivity: conn.finish() };
  const corners3 = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
  const corners2 = [[0, 0], [1, 0], [1, 1], [0, 1]];
  for (let k = 0; k < Math.max(nz - 1, 1); k++)
    for (let j = 0; j < Math.max(ny - 1, 1); j++)
      for (let i = 0; i < Math.max(nx - 1, 1); i++) {
        const base = [i, j, k];
        if (axes.length === 3) {
          for (const c of corners3)
            conn.push(id([i + c[0], j + c[1], k + c[2]]));
          types.push(CELL.HEXAHEDRON);
        } else {
          for (const [u, w] of corners2) {
            const p = [...base];
            p[axes[0]] += u;
            p[axes[1]] += w;
            conn.push(id(p));
          }
          types.push(CELL.QUAD);
        }
        offs.push(conn.length);
      }
  return { cellTypes: Uint8Array.from(types), offsets: offs.finish(), connectivity: conn.finish() };
}
function parseVtkLegacy(input, name = "vtk") {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const probe = new Reader(bytes, false);
  const header = probe.line();
  const match = /^#\s*vtk DataFile Version\s+(\d+)(?:\.(\d+))?/i.exec(header);
  if (!match)
    throw new VtkFormatError('Not a VTK legacy file (missing "# vtk DataFile Version" header)');
  const version = Number(match[1]) + Number(match[2] || 0) / 10;
  probe.line();
  const encoding = probe.nextLine().toUpperCase();
  if (encoding !== "ASCII" && encoding !== "BINARY")
    throw new VtkFormatError(`Unknown encoding ${encoding}`);
  const r = new Reader(bytes, encoding === "BINARY");
  r.pos = probe.pos;
  let dataset = "";
  let points = null;
  let dims = null;
  let origin = [0, 0, 0];
  let spacing = [1, 1, 1];
  const rect = [];
  let cellTypes = null;
  let cells = null;
  const poly = [];
  const pointData = [];
  const cellData = [];
  let target = null;
  let tuples = 0;
  const push = (array) => {
    if (target)
      target.push(array);
  };
  while (!r.done) {
    const kw = r.token().toUpperCase();
    switch (kw) {
      case "DATASET":
        dataset = r.token().toUpperCase();
        break;
      case "POINTS": {
        const n = r.int();
        points = r.numbers(n * 3, r.token());
        break;
      }
      case "DIMENSIONS":
        dims = [r.int(), r.int(), r.int()];
        break;
      case "ORIGIN":
        origin = [r.int(), r.int(), r.int()];
        break;
      case "SPACING":
      case "ASPECT_RATIO":
        spacing = [r.int(), r.int(), r.int()];
        break;
      case "X_COORDINATES":
      case "Y_COORDINATES":
      case "Z_COORDINATES": {
        const n = r.int();
        rect.push(r.numbers(n, r.token()));
        break;
      }
      case "CELLS": {
        const a = r.int(), b = r.int();
        cells = readCellBlock(r, version, a, b);
        break;
      }
      case "CELL_TYPES": {
        const n = r.int();
        cellTypes = Uint8Array.from(r.numbers(n, "int", new Uint32Array(n)));
        break;
      }
      case "VERTICES":
      case "LINES":
      case "POLYGONS":
      case "TRIANGLE_STRIPS": {
        const a = r.int(), b = r.int();
        const type = { VERTICES: CELL.POLY_VERTEX, LINES: CELL.POLY_LINE, POLYGONS: CELL.POLYGON, TRIANGLE_STRIPS: CELL.TRIANGLE_STRIP }[kw];
        poly.push({ type, block: readCellBlock(r, version, a, b) });
        break;
      }
      case "POINT_DATA":
        tuples = r.int();
        target = pointData;
        break;
      case "CELL_DATA":
        tuples = r.int();
        target = cellData;
        break;
      case "SCALARS": {
        const parts = r.line().split(/\s+/);
        const [fieldName, type] = parts;
        const components = Number(parts[2] || 1);
        const save = r.pos;
        const maybe = r.token().toUpperCase();
        if (maybe === "LOOKUP_TABLE")
          r.token();
        else
          r.pos = save;
        push({ name: fieldName, components, data: r.numbers(tuples * components, type) });
        break;
      }
      case "VECTORS":
      case "NORMALS": {
        const fieldName = r.token();
        push({ name: fieldName, components: 3, data: r.numbers(tuples * 3, r.token()) });
        break;
      }
      case "TENSORS":
      case "TENSORS6": {
        const fieldName = r.token();
        const c = kw === "TENSORS" ? 9 : 6;
        push({ name: fieldName, components: c, data: r.numbers(tuples * c, r.token()) });
        break;
      }
      case "TEXTURE_COORDINATES": {
        const fieldName = r.token();
        const c = r.int();
        push({ name: fieldName, components: c, data: r.numbers(tuples * c, r.token()) });
        break;
      }
      case "COLOR_SCALARS": {
        const fieldName = r.token();
        const c = r.int();
        push({ name: fieldName, components: c, data: r.binary ? r.bytesAsUnit(tuples * c) : r.numbers(tuples * c, "float") });
        break;
      }
      case "LOOKUP_TABLE": {
        r.token();
        const n = r.int();
        r.binary ? r.bytesAsUnit(n * 4) : r.numbers(n * 4, "float");
        break;
      }
      case "FIELD": {
        r.token();
        const count = r.int();
        for (let i = 0; i < count; i++) {
          const arrayName = r.token();
          const components = r.int();
          const n = r.int();
          const type = r.token();
          if (arrayName.toUpperCase() === "NULL_ARRAY")
            continue;
          const data = r.numbers(n * components, type);
          if (target && n === tuples)
            target.push({ name: arrayName, components, data });
          const save = r.pos;
          const next = r.token().toUpperCase();
          if (next === "METADATA")
            skipMetadata(r);
          else
            r.pos = save;
        }
        break;
      }
      case "METADATA":
        skipMetadata(r);
        break;
      case "":
        break;
      default:
        throw new VtkFormatError(`Unsupported VTK keyword ${kw}`);
    }
  }
  let piece;
  if (dataset === "UNSTRUCTURED_GRID") {
    if (!points || !cells || !cellTypes)
      throw new VtkFormatError("UNSTRUCTURED_GRID requires POINTS, CELLS and CELL_TYPES");
    const { offsets, connectivity } = cells;
    piece = { name, points, cellTypes, offsets: offsets.length === cellTypes.length ? appendEnd(offsets, connectivity.length) : offsets, connectivity, pointData, cellData };
  } else if (dataset === "POLYDATA") {
    if (!points)
      throw new VtkFormatError("POLYDATA requires POINTS");
    const types = [];
    const offs = new U32Builder();
    const conn = new U32Builder();
    offs.push(0);
    for (const { type, block } of poly) {
      const count = block.offsets.length - 1;
      for (let i = 0; i < count; i++) {
        for (let k = block.offsets[i]; k < block.offsets[i + 1]; k++)
          conn.push(block.connectivity[k]);
        offs.push(conn.length);
        types.push(type);
      }
    }
    piece = { name, points, cellTypes: Uint8Array.from(types), offsets: offs.finish(), connectivity: conn.finish(), pointData, cellData };
  } else if (dataset === "STRUCTURED_GRID" || dataset === "STRUCTURED_POINTS" || dataset === "RECTILINEAR_GRID") {
    if (!dims)
      throw new VtkFormatError(`${dataset} requires DIMENSIONS`);
    const [nx, ny, nz] = dims;
    if (dataset !== "STRUCTURED_GRID") {
      points = new Float32Array(nx * ny * nz * 3);
      let p = 0;
      for (let k = 0; k < nz; k++)
        for (let j = 0; j < ny; j++)
          for (let i = 0; i < nx; i++) {
            if (dataset === "RECTILINEAR_GRID") {
              points[p++] = rect[0][i];
              points[p++] = rect[1][j];
              points[p++] = rect[2][k];
            } else {
              points[p++] = origin[0] + i * spacing[0];
              points[p++] = origin[1] + j * spacing[1];
              points[p++] = origin[2] + k * spacing[2];
            }
          }
    }
    if (!points)
      throw new VtkFormatError("STRUCTURED_GRID requires POINTS");
    piece = { name, points, ...structuredCells(dims), pointData, cellData };
  } else
    throw new VtkFormatError(`Unsupported DATASET ${dataset || "(missing)"}`);
  return { pieces: [piece] };
}
function appendEnd(offsets, end) {
  const out = new Uint32Array(offsets.length + 1);
  out.set(offsets);
  out[offsets.length] = end;
  return out;
}
function skipMetadata(r) {
  r.line();
  while (r.pos < r.bytes.length) {
    if (!r.line())
      break;
  }
}

// packages/runtime/dist/vtk/ensight.js
function parseEnsightCase(text) {
  const lines = text.split(/\r?\n/);
  let section = "";
  const out = { geometry: { file: "", timeSet: null }, variables: [], timeSets: [] };
  let currentSet = null;
  let collecting = null;
  let remaining = 0;
  let start = 0, increment = 1;
  const finishSet = () => {
    if (currentSet && !currentSet.fileNumbers.length && remaining > 0)
      for (let i = 0; i < remaining; i++)
        currentSet.fileNumbers.push(start + i * increment);
  };
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line)
      continue;
    if (/^(FORMAT|GEOMETRY|VARIABLE|TIME|FILE|MATERIAL|BLOCK_CONTINUATION|SCRIPTS)$/i.test(line)) {
      section = line.toUpperCase();
      collecting = null;
      continue;
    }
    if (section === "GEOMETRY") {
      const m = /^model:\s*(.*)$/i.exec(line);
      if (m) {
        const parts = m[1].trim().split(/\s+/);
        const numeric = parts.filter((p) => /^\d+$/.test(p));
        const file = parts.filter((p) => !/^\d+$/.test(p) && p !== "change_coords_only").pop() || "";
        out.geometry = { file, timeSet: numeric.length ? Number(numeric[0]) : null };
      }
    } else if (section === "VARIABLE") {
      const m = /^(scalar|vector|tensor symm|tensor asym|complex scalar|complex vector)\s+per\s+(node|element|measured node):\s*(.*)$/i.exec(line);
      if (!m || /complex/i.test(m[1]) || /measured/i.test(m[2]))
        continue;
      const tokens = m[3].trim().split(/\s+/);
      let timeSet = null;
      const ints = [];
      while (tokens.length > 2 && /^\d+$/.test(tokens[0]))
        ints.push(Number(tokens.shift()));
      if (ints.length)
        timeSet = ints[0];
      const file = tokens.pop();
      const name = tokens.join(" ");
      const kind = /^scalar/i.test(m[1]) ? "scalar" : /^vector/i.test(m[1]) ? "vector" : /symm/i.test(m[1]) ? "tensor" : "tensor9";
      out.variables.push({ kind, association: m[2].toLowerCase() === "node" ? "node" : "element", name, file, timeSet });
    } else if (section === "TIME") {
      let m;
      if (m = /^time set:\s*(\d+)/i.exec(line)) {
        finishSet();
        currentSet = { id: Number(m[1]), values: [], fileNumbers: [] };
        out.timeSets.push(currentSet);
        collecting = null;
        start = 0;
        increment = 1;
        remaining = 0;
        continue;
      }
      if (!currentSet)
        continue;
      if (m = /^number of steps:\s*(\d+)/i.exec(line)) {
        remaining = Number(m[1]);
        continue;
      }
      if (m = /^filename start number:\s*(-?\d+)/i.exec(line)) {
        start = Number(m[1]);
        continue;
      }
      if (m = /^filename increment:\s*(-?\d+)/i.exec(line)) {
        increment = Number(m[1]);
        continue;
      }
      if (m = /^filename numbers:\s*(.*)$/i.exec(line)) {
        collecting = "numbers";
        pushNumbers(currentSet.fileNumbers, m[1]);
        continue;
      }
      if (m = /^time values:\s*(.*)$/i.exec(line)) {
        collecting = "values";
        pushNumbers(currentSet.values, m[1]);
        continue;
      }
      if (collecting === "numbers")
        pushNumbers(currentSet.fileNumbers, line);
      else if (collecting === "values")
        pushNumbers(currentSet.values, line);
    }
  }
  finishSet();
  if (!out.geometry.file)
    throw new VtkFormatError("EnSight case has no GEOMETRY model");
  return out;
}
function pushNumbers(target, text) {
  for (const t of text.trim().split(/\s+/))
    if (t)
      target.push(Number(t));
}
function ensightFileName(pattern, fileNumber) {
  if (fileNumber === void 0)
    return pattern;
  return pattern.replace(/\*+/, (stars) => String(fileNumber).padStart(stars.length, "0"));
}
var BinReader = class {
  bytes;
  pos = 0;
  little = true;
  view;
  constructor(bytes) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  get done() {
    return this.pos >= this.bytes.length;
  }
  str() {
    let s = "";
    for (let i = 0; i < 80 && this.pos + i < this.bytes.length; i++) {
      const c = this.bytes[this.pos + i];
      if (c === 0)
        break;
      s += String.fromCharCode(c);
    }
    this.pos += 80;
    return s.trim();
  }
  peekStr() {
    const p = this.pos;
    const s = this.str();
    this.pos = p;
    return s;
  }
  int() {
    const v = this.view.getInt32(this.pos, this.little);
    this.pos += 4;
    return v;
  }
  ints(n) {
    const out = new Uint32Array(n);
    for (let i = 0; i < n; i++, this.pos += 4)
      out[i] = this.view.getInt32(this.pos, this.little);
    return out;
  }
  floats(n, out = new Float32Array(n), stride = 1, offset = 0) {
    for (let i = 0; i < n; i++, this.pos += 4)
      out[i * stride + offset] = this.view.getFloat32(this.pos, this.little);
    return out;
  }
  skip(bytes) {
    this.pos += bytes;
  }
};
var ELEMENTS = {
  point: { nodes: 1, vtk: CELL.VERTEX, corners: 1 },
  bar2: { nodes: 2, vtk: CELL.LINE, corners: 2 },
  bar3: { nodes: 3, vtk: CELL.LINE, corners: 2 },
  tria3: { nodes: 3, vtk: CELL.TRIANGLE, corners: 3 },
  tria6: { nodes: 6, vtk: CELL.TRIANGLE, corners: 3 },
  quad4: { nodes: 4, vtk: CELL.QUAD, corners: 4 },
  quad8: { nodes: 8, vtk: CELL.QUAD, corners: 4 },
  tetra4: { nodes: 4, vtk: CELL.TETRA, corners: 4 },
  tetra10: { nodes: 10, vtk: CELL.TETRA, corners: 4 },
  pyramid5: { nodes: 5, vtk: CELL.PYRAMID, corners: 5 },
  pyramid13: { nodes: 13, vtk: CELL.PYRAMID, corners: 5 },
  penta6: { nodes: 6, vtk: CELL.WEDGE, corners: 6 },
  penta15: { nodes: 15, vtk: CELL.WEDGE, corners: 6 },
  hexa8: { nodes: 8, vtk: CELL.HEXAHEDRON, corners: 8 },
  hexa20: { nodes: 20, vtk: CELL.HEXAHEDRON, corners: 8 }
};
var elementKey = (type) => type.replace(/^g_/, "");
function detectEndian(r, partOffset) {
  const view = new DataView(r.bytes.buffer, r.bytes.byteOffset + partOffset, 4);
  const le = view.getInt32(0, true);
  r.little = le > 0 && le < 1e8;
}
var COMPONENTS = { scalar: 1, vector: 3, tensor: 6, tensor9: 9 };
function ensightPartSamples(bytes, partName) {
  const r = new BinReader(bytes);
  const format2 = r.str();
  if (!/binary/i.test(format2) || /fortran/i.test(format2))
    throw new VtkFormatError(`Only C Binary EnSight geometry is supported (found "${format2 || "ASCII"}")`);
  r.str();
  r.str();
  const hasNodeIds = /given|ignore/.test(r.str().toLowerCase());
  const hasElementIds = /given|ignore/.test(r.str().toLowerCase());
  if (r.peekStr().toLowerCase().startsWith("extents")) {
    r.str();
    r.skip(24);
  }
  if (r.peekStr().toLowerCase() === "part")
    detectEndian(r, r.pos + 80);
  const parts = [];
  let nodes = null;
  let centers = null;
  while (!r.done) {
    if (r.str().toLowerCase() !== "part")
      throw new VtkFormatError('Expected "part"');
    const id = r.int();
    const name = r.str();
    if (r.str().toLowerCase().startsWith("block"))
      throw new VtkFormatError(`Structured EnSight part "${name}" is not supported`);
    const keep = name === partName;
    const nn = r.int();
    if (hasNodeIds)
      r.skip(nn * 4);
    let xyz = null;
    if (keep) {
      xyz = new Float32Array(nn * 3);
      for (let c = 0; c < 3; c++)
        r.floats(nn, xyz, 3, c);
    } else
      r.skip(nn * 12);
    const layout = { id, name, nodes: nn, blocks: [] };
    const chunks = [];
    while (!r.done && r.peekStr().toLowerCase() !== "part") {
      const type = r.str().toLowerCase();
      const key = elementKey(type);
      const ne = r.int();
      layout.blocks.push({ type, count: ne });
      if (hasElementIds)
        r.skip(ne * 4);
      const fixed = ELEMENTS[key];
      const out = keep ? new Float32Array(ne * 3) : null;
      const add = (e, node, weight) => {
        const s = (node - 1) * 3;
        out[e * 3] += xyz[s] * weight;
        out[e * 3 + 1] += xyz[s + 1] * weight;
        out[e * 3 + 2] += xyz[s + 2] * weight;
      };
      if (fixed) {
        if (!keep) {
          r.skip(ne * fixed.nodes * 4);
          continue;
        }
        const ids = r.ints(ne * fixed.nodes);
        const w = 1 / fixed.corners;
        for (let e = 0; e < ne; e++)
          for (let k = 0; k < fixed.corners; k++)
            add(e, ids[e * fixed.nodes + k], w);
      } else if (key === "nsided") {
        const counts = r.ints(ne);
        let total = 0;
        for (const c of counts)
          total += c;
        if (!keep) {
          r.skip(total * 4);
          continue;
        }
        const ids = r.ints(total);
        let p = 0;
        for (let e = 0; e < ne; e++) {
          const w = 1 / counts[e];
          for (let k = 0; k < counts[e]; k++)
            add(e, ids[p++], w);
        }
      } else if (key === "nfaced") {
        const faceCounts = r.ints(ne);
        let faces = 0;
        for (const c of faceCounts)
          faces += c;
        const nodeCounts = r.ints(faces);
        let total = 0;
        for (const c of nodeCounts)
          total += c;
        if (!keep) {
          r.skip(total * 4);
          continue;
        }
        const ids = r.ints(total);
        let f = 0, p = 0;
        for (let e = 0; e < ne; e++) {
          let n = 0;
          for (let j = 0; j < faceCounts[e]; j++)
            n += nodeCounts[f + j];
          for (let j = 0; j < faceCounts[e]; j++, f++)
            for (let k = 0; k < nodeCounts[f]; k++)
              add(e, ids[p++], 1 / n);
        }
      } else
        throw new VtkFormatError(`Unsupported EnSight element type "${type}" in part "${name}"`);
      if (out)
        chunks.push(out);
    }
    parts.push(layout);
    if (keep && xyz) {
      nodes = xyz;
      centers = new Float32Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        centers.set(chunk, offset);
        offset += chunk.length;
      }
    }
  }
  if (!nodes || !centers)
    throw new VtkFormatError(`Part "${partName}" not found (available: ${parts.map((p) => p.name).join(", ")})`, "E_INVALID_ARGUMENT");
  const piece = { name: partName, points: new Float32Array(0), cellTypes: new Uint8Array(0), offsets: new Uint32Array(0), connectivity: new Uint32Array(0), pointData: [], cellData: [] };
  return { layout: { dataset: { pieces: [piece] }, parts, little: r.little }, part: partName, nodes, centers };
}
function readEnsightVariable(bytes, variable, geometry) {
  const r = new BinReader(bytes);
  r.little = geometry.little;
  r.str();
  const components = COMPONENTS[variable.kind];
  const byId = new Map(geometry.parts.map((part) => [part.id, part]));
  const pieces = new Map(geometry.dataset.pieces.map((piece) => [piece.name, piece]));
  while (!r.done) {
    const kw = r.str().toLowerCase();
    if (kw !== "part")
      throw new VtkFormatError(`Variable ${variable.name}: expected "part", found "${kw}"`);
    const part = byId.get(r.int());
    if (!part)
      throw new VtkFormatError(`Variable ${variable.name} references an unknown part`);
    const piece = pieces.get(part.name);
    if (variable.association === "node") {
      r.str();
      if (!piece) {
        r.skip(part.nodes * components * 4);
        continue;
      }
      const data2 = new Float32Array(part.nodes * components);
      for (let c = 0; c < components; c++)
        r.floats(part.nodes, data2, components, c);
      piece.pointData.push({ name: variable.name, components, data: data2 });
      continue;
    }
    const total = part.blocks.reduce((sum, block) => sum + block.count, 0);
    const data = piece ? new Float32Array(total * components).fill(NaN) : null;
    const starts = /* @__PURE__ */ new Map();
    let acc = 0;
    for (const block of part.blocks) {
      starts.set(block.type, { start: acc, count: block.count });
      acc += block.count;
    }
    while (!r.done && r.peekStr().toLowerCase() !== "part") {
      const type = r.str().toLowerCase();
      const block = starts.get(type);
      if (!block)
        throw new VtkFormatError(`Variable ${variable.name}: element type ${type} not in part ${part.name}`);
      if (!data) {
        r.skip(block.count * components * 4);
        continue;
      }
      for (let c = 0; c < components; c++)
        r.floats(block.count, data, components, block.start * components + c);
    }
    if (piece && data)
      piece.cellData.push({ name: variable.name, components, data });
  }
}

// packages/runtime/dist/vtk/surface.js
var FACES = {
  [CELL.TETRA]: [[0, 1, 3], [1, 2, 3], [2, 0, 3], [0, 2, 1]],
  [CELL.HEXAHEDRON]: [[0, 4, 7, 3], [1, 2, 6, 5], [0, 1, 5, 4], [3, 7, 6, 2], [0, 3, 2, 1], [4, 5, 6, 7]],
  [CELL.VOXEL]: [[0, 4, 6, 2], [1, 3, 7, 5], [0, 1, 5, 4], [2, 6, 7, 3], [0, 2, 3, 1], [4, 5, 7, 6]],
  [CELL.WEDGE]: [[0, 1, 2], [3, 5, 4], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]],
  [CELL.PYRAMID]: [[0, 3, 2, 1], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]]
};
FACES[CELL.QUADRATIC_TETRA] = FACES[CELL.TETRA];
FACES[CELL.QUADRATIC_HEXAHEDRON] = FACES[CELL.HEXAHEDRON];
FACES[CELL.QUADRATIC_WEDGE] = FACES[CELL.WEDGE];
FACES[CELL.QUADRATIC_PYRAMID] = FACES[CELL.PYRAMID];
var CORNERS_2D = {
  [CELL.TRIANGLE]: [0, 1, 2],
  [CELL.QUADRATIC_TRIANGLE]: [0, 1, 2],
  [CELL.QUAD]: [0, 1, 2, 3],
  [CELL.QUADRATIC_QUAD]: [0, 1, 2, 3],
  [CELL.PIXEL]: [0, 1, 3, 2]
};

// packages/runtime/dist/vtk/loader.js
function filePath(url) {
  let path2 = decodeURI(url.replace(/^file:\/\//i, "")).replace(/\\/g, "/");
  if (/^\/[a-zA-Z]:\//.test(path2))
    path2 = path2.slice(1);
  return path2;
}
function joinUrl(base, relative) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(relative) || /^[a-zA-Z]:[\\/]/.test(relative))
    return relative;
  if (/^https?:/i.test(base))
    return new URL(relative, base).toString();
  const normalized = base.replace(/\\/g, "/");
  const parts = normalized.slice(0, normalized.lastIndexOf("/")).split("/");
  for (const segment of relative.replace(/\\/g, "/").split("/")) {
    if (segment === "..")
      parts.pop();
    else if (segment && segment !== ".")
      parts.push(segment);
  }
  return parts.join("/");
}

// packages/runtime/dist/vtk/volume.js
var MAX_GRID = 16e6;
function magnitudeRange(array) {
  let min = Infinity, max = -Infinity;
  const c = array.components;
  for (let t = 0; t < array.data.length / c; t++) {
    let v;
    if (c === 1)
      v = array.data[t];
    else {
      let s = 0;
      for (let k = 0; k < c; k++)
        s += array.data[t * c + k] ** 2;
      v = Math.sqrt(s);
    }
    if (Number.isNaN(v))
      continue;
    if (v < min)
      min = v;
    if (v > max)
      max = v;
  }
  return Number.isFinite(min) ? [min, max] : [0, 0];
}
function pickVelocity(arrays, requested) {
  if (requested)
    return arrays.some((a) => a.name === requested && a.components === 3) ? requested : null;
  for (const name of ["U", "velocity", "Velocity", "VELOCITY", "V", "vel"])
    if (arrays.some((a) => a.name === name && a.components === 3))
      return name;
  return arrays.find((a) => a.components === 3)?.name ?? null;
}
function voxelize(part, positions, arrays, options) {
  const n = positions.length / 3;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++)
    for (let c = 0; c < 3; c++) {
      const v = positions[i * 3 + c];
      if (v < min[c])
        min[c] = v;
      if (v > max[c])
        max[c] = v;
    }
  if (!n)
    throw new VtkFormatError(`Part "${part}" has no samples`);
  const extent = [0, 1, 2].map((c) => max[c] - min[c]);
  const largest = Math.max(...extent, 1e-9);
  const sized = extent.map((e) => Math.max(e, largest / 1e3));
  let cell = Math.cbrt(sized[0] * sized[1] * sized[2] / Math.max(options.points * 3, 1));
  let dims = sized.map((e) => Math.max(1, Math.ceil(e / cell)));
  while (dims[0] * dims[1] * dims[2] > MAX_GRID) {
    cell *= 1.1;
    dims = sized.map((e) => Math.max(1, Math.ceil(e / cell)));
  }
  const total = dims[0] * dims[1] * dims[2];
  const voxel = new Int32Array(n);
  const count = new Uint32Array(total);
  for (let i = 0; i < n; i++) {
    const ix = Math.min(dims[0] - 1, Math.floor((positions[i * 3] - min[0]) / cell));
    const iy = Math.min(dims[1] - 1, Math.floor((positions[i * 3 + 1] - min[1]) / cell));
    const iz = Math.min(dims[2] - 1, Math.floor((positions[i * 3 + 2] - min[2]) / cell));
    const v = ix + dims[0] * (iy + dims[1] * iz);
    voxel[i] = v;
    count[v]++;
  }
  let occupied = 0;
  for (let v = 0; v < total; v++)
    if (count[v])
      occupied++;
  const keepRatio = Math.min(1, options.points / occupied);
  const point = new Int32Array(total).fill(-1);
  let kept = 0, carry = 0;
  for (let v = 0; v < total; v++) {
    if (!count[v])
      continue;
    carry += keepRatio;
    if (carry >= 1) {
      carry -= 1;
      point[v] = kept++;
    }
  }
  const average = (data, components, target, index) => {
    const sums = new Float64Array(target.length);
    for (let i = 0; i < n; i++) {
      const slot = index ? index[voxel[i]] : voxel[i];
      if (slot < 0)
        continue;
      for (let c = 0; c < components; c++)
        sums[slot * components + c] += data[i * components + c];
    }
    for (let v = 0; v < total; v++) {
      const slot = index ? index[v] : v;
      if (slot < 0 || !count[v])
        continue;
      for (let c = 0; c < components; c++)
        target[slot * components + c] = sums[slot * components + c] / count[v];
    }
  };
  const pointPositions = new Float32Array(kept * 3);
  average(positions, 3, pointPositions, point);
  const wanted = options.fields ? arrays.filter((a) => options.fields.includes(a.name)) : arrays;
  const fields = wanted.map((array) => {
    const data = new Float32Array(kept * array.components);
    average(array.data, array.components, data, point);
    return { name: array.name, components: array.components, range: magnitudeRange({ components: array.components, data }), data };
  });
  const velocityName = pickVelocity(arrays, options.velocity);
  let velocity = null;
  if (velocityName) {
    const source = arrays.find((a) => a.name === velocityName);
    const data = new Float32Array(total * 3);
    average(source.data, 3, data, null);
    velocity = { name: velocityName, maxSpeed: magnitudeRange({ components: 3, data })[1], data };
  } else if (options.velocity)
    throw new VtkFormatError(`Velocity field ${options.velocity} not found or not a vector`, "E_INVALID_ARGUMENT");
  return { part, samples: n, count: kept, positions: pointPositions, fields, bounds: { min, max }, grid: { dims, min, cell }, velocity };
}
var MAGIC = 1280267860;
function encodeVolume(volume) {
  const chunks = [];
  let offset = 0;
  const add = (data) => {
    const at = offset;
    chunks.push(data);
    offset += data.length;
    return at;
  };
  const header = {
    part: volume.part,
    samples: volume.samples,
    count: volume.count,
    bounds: volume.bounds,
    grid: volume.grid,
    positions: add(volume.positions),
    fields: volume.fields.map((f) => ({ name: f.name, components: f.components, range: f.range, offset: add(f.data) })),
    velocity: volume.velocity ? { name: volume.velocity.name, maxSpeed: volume.velocity.maxSpeed, offset: add(volume.velocity.data) } : null
  };
  const json = new TextEncoder().encode(JSON.stringify(header));
  const headerBytes = 8 + Math.ceil(json.length / 4) * 4;
  const out = new Uint8Array(headerBytes + offset * 4);
  const view = new DataView(out.buffer);
  view.setUint32(0, MAGIC, true);
  view.setUint32(4, json.length, true);
  out.set(json, 8);
  let p = headerBytes;
  for (const chunk of chunks) {
    out.set(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength), p);
    p += chunk.byteLength;
  }
  return out;
}
function format(url) {
  const path2 = url.split(/[?#]/)[0].toLowerCase();
  if (path2.endsWith(".json"))
    return "dataset";
  if (path2.endsWith(".case") || path2.endsWith(".encas"))
    return "ensight";
  return "vtk";
}
async function buildVolume(request2, read) {
  let url = request2.url;
  let part = request2.part;
  if (format(url) === "dataset") {
    const manifest = JSON.parse(new TextDecoder().decode(await read(url)));
    const caseId = request2.caseId || manifest.defaultCase || manifest.cases?.[0]?.id;
    const entry = manifest.cases?.find((item) => item.id === caseId);
    if (!entry)
      throw new VtkFormatError(`Case ${caseId} not found in dataset.json`, "E_INVALID_ARGUMENT");
    part ??= Object.entries(manifest.parts || {}).find(([, info]) => info.role === "volume")?.[0];
    url = joinUrl(url, entry.entry);
  }
  if (format(url) === "ensight") {
    const description = parseEnsightCase(new TextDecoder().decode(await read(url)));
    const geometryBytes = await read(joinUrl(url, ensightFileName(description.geometry.file, void 0)));
    if (!part) {
      const text = new TextDecoder("latin1").decode(geometryBytes.subarray(0, Math.min(geometryBytes.length, 1 << 20)));
      part = text.includes("internalMesh") ? "internalMesh" : void 0;
    }
    const samples = ensightPartSamples(geometryBytes, part ?? "");
    const variables = description.variables.filter((v) => !request2.fields || request2.fields.includes(v.name) || v.name === request2.velocity || !request2.velocity && v.kind === "vector");
    for (const variable of variables) {
      const numbers = description.timeSets.find((set) => set.id === variable.timeSet)?.fileNumbers;
      readEnsightVariable(await read(joinUrl(url, ensightFileName(variable.file, numbers?.[0]))), variable, samples.layout);
    }
    const piece2 = samples.layout.dataset.pieces[0];
    const byCell = piece2.cellData.length >= piece2.pointData.length;
    return voxelize(samples.part, byCell ? samples.centers : samples.nodes, byCell ? piece2.cellData : piece2.pointData, request2);
  }
  const dataset = parseVtkLegacy(await read(url));
  const piece = dataset.pieces[0];
  if (piece.pointData.length >= piece.cellData.length)
    return voxelize(piece.name, piece.points, piece.pointData, request2);
  const centers = new Float32Array(piece.cellTypes.length * 3);
  for (let c = 0; c < piece.cellTypes.length; c++) {
    const start = piece.offsets[c], end = piece.offsets[c + 1];
    for (let k = start; k < end; k++)
      for (let a = 0; a < 3; a++)
        centers[c * 3 + a] += piece.points[piece.connectivity[k] * 3 + a] / (end - start);
  }
  return voxelize(piece.name, centers, piece.cellData, request2);
}

// services/platform/dist/files.js
import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import path from "node:path";
var LocalFileService = class _LocalFileService {
  configuredRoots;
  roots;
  constructor(configuredRoots) {
    this.configuredRoots = configuredRoots;
    const roots2 = configuredRoots;
    this.roots = Promise.all(roots2.filter(Boolean).map(async (root) => {
      try {
        return await realpath(path.resolve(root));
      } catch {
        return null;
      }
    })).then((list) => list.filter((root) => root !== null));
  }
  static fromEnv(value = process.env.TWIN_FILE_ROOTS || "") {
    return new _LocalFileService(value.split(";").map((item) => item.trim()).filter(Boolean));
  }
  async configured() {
    return (await this.roots).length > 0;
  }
  async resolve(raw) {
    const roots2 = await this.roots;
    if (typeof raw !== "string" || !raw || raw.length > 4096 || raw.includes("\0"))
      throw new TwinError("E_INVALID_ARGUMENT", "path query parameter is required");
    if (!path.isAbsolute(raw))
      throw new TwinError("E_INVALID_ARGUMENT", "path must be absolute");
    let file;
    try {
      file = await realpath(path.resolve(raw));
    } catch {
      throw new TwinError("E_NOT_FOUND", "File not found");
    }
    const inside = !roots2.length || roots2.some((root) => {
      const relative = path.relative(root, file);
      return relative === "" || !relative.startsWith("..") && !path.isAbsolute(relative);
    });
    if (!inside)
      throw new TwinError("E_PERMISSION_DENIED", "Path is outside TWIN_FILE_ROOTS");
    const info = await stat(file);
    if (!info.isFile())
      throw new TwinError("E_NOT_FOUND", "Not a file");
    return { file, size: info.size };
  }
  /** Parses a single `bytes=` range; null means the whole file. */
  static range(header, size) {
    if (!header)
      return null;
    const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
    if (!match || !match[1] && !match[2])
      throw new TwinError("E_INVALID_ARGUMENT", "Unsupported Range header");
    let start;
    let end;
    if (!match[1]) {
      start = Math.max(0, size - Number(match[2]));
      end = size - 1;
    } else {
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    }
    if (start > end || start >= size)
      throw new TwinError("E_INVALID_ARGUMENT", "Range not satisfiable");
    return { start, end };
  }
  static stream(file, range) {
    return range ? createReadStream(file, range) : createReadStream(file);
  }
};

// services/platform/dist/volume.js
function volumeReader(files) {
  return async (url) => {
    if (/^file:/i.test(url)) {
      const { file } = await files.resolve(filePath(url));
      return new Uint8Array(await readFile(file));
    }
    if (/^https?:/i.test(url)) {
      const response = await fetch(url);
      if (!response.ok)
        throw new TwinError(response.status === 404 ? "E_NOT_FOUND" : "E_UPSTREAM", `Failed to load ${url}: HTTP ${response.status}`);
      return new Uint8Array(await response.arrayBuffer());
    }
    throw new TwinError("E_INVALID_ARGUMENT", "Volume sources must be file:// or absolute http(s):// URLs");
  };
}
async function buildVolumePayload(request2, roots2) {
  return encodeVolume(await buildVolume(request2, volumeReader(new LocalFileService(roots2))));
}

// services/platform/dist/volume-worker.js
var { request, roots } = workerData;
try {
  const bytes = await buildVolumePayload(request, roots);
  parentPort.postMessage({ bytes }, [bytes.buffer]);
} catch (error) {
  const failure = error;
  parentPort.postMessage({ error: { code: failure.code, message: failure.message || String(error) } });
}
