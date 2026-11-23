/**
 * wdpapi → twinSDK 迁移工具：按 AST 剔除业务代码中的 wdpapi 调用，保留 UI 与业务面板逻辑。
 *
 * 规则：
 *  1. 删除来自 wdpapi 包 / utils/wdpapi 封装的 import，记录导入名为"污染源"
 *  2. 引用污染源、App / wdpApp / window.App、或调用 UE 实体方法（SetEntityOutline 等）的语句整句删除
 *  3. 由被删语句声明 / 赋值的变量（const res = await addPOI(...)）继续污染，依赖它的语句一并删除（迭代至稳定）
 *  4. 以源码区间删除，未触及的代码保持逐字节不变；每个被删过语句的方法前插入
 *     // [twin 待实现] 原 wdpapi 调用：A → B → C
 *
 * 用法：node scripts/strip-wdpapi.js <file...>          （.js 或 .vue，直接改写）
 *       node scripts/strip-wdpapi.js --report <file...> 只统计，不写文件
 */
const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const WDP_SOURCE = /(^wdpapi$)|(@utilsWdpApi)|(utils\/wdpapi)|(\.\.\/wdpapi\/)/;
const WDP_GLOBALS = new Set(["App", "wdpApp", "WdpApi"]);
// UE 实体对象 / App 命名空间上的方法：出现即视为 wdpapi 调用
const WDP_METHODS = new Set([
  "SetEntityOutline", "SetEntityHighlight", "SetOutline", "SetVisible", "SetVisibleByObjects",
  "GetByTypes", "GetByEids", "GetByCustomId", "GetObjectEid", "RunCustomizeApi", "onClick",
  "SetLocation", "SetRotator", "SetScale3D", "SetScale3d", "UpdateCamera", "FlyTo", "FocusByCustomId",
  "ClearByTypes", "ClearByEids", "ClearByObjects", "RegisterSceneEvent", "RegisterEvent",
]);
const PARSER_OPTS = {
  sourceType: "module",
  plugins: ["jsx", "optionalChaining", "nullishCoalescingOperator", "dynamicImport", "classProperties", "objectRestSpread"],
};

function scriptBlock(source, file) {
  if (!file.endsWith(".vue")) return { start: 0, end: source.length };
  const open = source.match(/<script[^>]*>/);
  if (!open) return null;
  const start = open.index + open[0].length;
  return { start, end: source.indexOf("</script>", start) };
}

function memberText(node) {
  if (!node) return "";
  if (node.type === "Identifier") return node.name;
  if (node.type === "ThisExpression") return "this";
  if (node.type === "MemberExpression" || node.type === "OptionalMemberExpression") {
    const prop = node.computed ? "[…]" : node.property.name || node.property.value;
    return `${memberText(node.object)}.${prop}`;
  }
  if (node.type === "CallExpression" || node.type === "OptionalCallExpression") return `${memberText(node.callee)}()`;
  if (node.type === "AwaitExpression") return memberText(node.argument);
  return "";
}

/** 调用表达式 → 可读 API 名：App.Scene.Add / addPOI / <实体>.SetVisible */
function apiName(callee, tainted) {
  const text = memberText(callee)
    .replace(/^this\.\$store\.state\.wdpApp/, "App")
    .replace(/^(store\.state|this|self\.\$store\.state|_this\.\$store\.state)\.wdpApp/, "App")
    .replace(/^window\.App/, "App");
  if (!text) return null;
  const clean = text.replace(/\(\)/g, "");
  const root = clean.split(".")[0];
  if (root === "App") return clean;
  const last = clean.split(".").pop();
  if (["forEach", "map", "filter", "find", "some", "every", "push", "slice", "concat", "includes", "indexOf", "then", "catch", "finally"].includes(last)) return null;
  if (tainted.has(root)) return clean.includes(".") ? `<实体>.${last}` : clean;
  if (WDP_METHODS.has(last)) return `<实体>.${last}`;
  return null;
}

function isWdpMember(node) {
  const text = memberText(node);
  return /(^|\.)wdpApp(\.|$)/.test(text) || /^window\.App(\.|$)/.test(text) || /^this\.App(\.|$)/.test(text);
}

function traverseIds(id, out = {}) {
  if (!id) return out;
  if (id.type === "Identifier") out[id.name] = true;
  else if (id.type === "ObjectPattern") id.properties.forEach((p) => traverseIds(p.value || p.argument, out));
  else if (id.type === "ArrayPattern") id.elements.forEach((e) => traverseIds(e, out));
  else if (id.type === "AssignmentPattern") traverseIds(id.left, out);
  else if (id.type === "RestElement") traverseIds(id.argument, out);
  return out;
}

function analyze(code) {
  const ast = parse(code, PARSER_OPTS);
  const tainted = new Set();
  const importRemovals = [];
  for (const node of ast.program.body) {
    if (node.type === "ImportDeclaration" && WDP_SOURCE.test(node.source.value)) {
      node.specifiers.forEach((s) => tainted.add(s.local.name));
      importRemovals.push(node);
    }
  }
  const removals = new Map();
  const apiLog = new Map();
  const within = (node) => [...removals.keys()].some((k) => k !== node && !removals.get(k).element && k.start <= node.start && k.end >= node.end);
  let changed = true;
  let guard = 0;
  while (changed && guard++ < 30) {
    changed = false;
    traverse(ast, {
      enter(p) {
        const n = p.node;
        if (n.type === "StringLiteral" && n.value === "wdpApp" && p.parentPath && p.parentPath.isArrayExpression()) {
          if (!removals.has(n)) {
            removals.set(n, { start: n.start, end: n.end, element: true });
            changed = true;
          }
          return;
        }
        let hit = false;
        if (n.type === "Identifier" && p.isReferencedIdentifier()) {
          if (tainted.has(n.name)) hit = true;
          else if (WDP_GLOBALS.has(n.name) && !p.scope.hasBinding(n.name)) hit = true;
        }
        if ((n.type === "MemberExpression" || n.type === "OptionalMemberExpression") && isWdpMember(n)) hit = true;
        if ((n.type === "MemberExpression" || n.type === "OptionalMemberExpression") && !n.computed && n.property
          && WDP_METHODS.has(n.property.name) && n.object.type !== "ThisExpression"
          && p.parentPath && (p.parentPath.isCallExpression() || p.parentPath.isOptionalCallExpression()) && p.parentPath.node.callee === n) hit = true;
        if (!hit) return;
        const stmt = p.findParent((q) => q.isStatement() && !q.isBlockStatement() && (q.inList || (q.parentPath && q.parentPath.isProgram())));
        if (!stmt || stmt.isImportDeclaration() || removals.has(stmt.node) || within(stmt.node)) return;
        if (stmt.isVariableDeclaration()) {
          stmt.node.declarations.forEach((d) => Object.keys(traverseIds(d.id)).forEach((name) => tainted.add(name)));
        }
        if (stmt.isFunctionDeclaration() && stmt.node.id) tainted.add(stmt.node.id.name);
        stmt.traverse({
          AssignmentExpression(a) {
            if (a.node.left.type === "Identifier") tainted.add(a.node.left.name);
          },
        });
        const names = [];
        const collect = (callee, isNew) => {
          const name = apiName(callee, tainted);
          if (name && !names.includes(name)) names.push(isNew ? `new ${name}` : name);
        };
        stmt.traverse({
          "CallExpression|OptionalCallExpression"(c) { collect(c.node.callee, false); },
          NewExpression(c) { collect(c.node.callee, true); },
        });
        const owner = p.findParent((q) => q.isObjectMethod() || q.isClassMethod() || q.isFunctionDeclaration()
          || ((q.isFunctionExpression() || q.isArrowFunctionExpression()) && q.parentPath.isObjectProperty()));
        if (owner) {
          const key = owner.isObjectProperty && owner.parentPath.isObjectProperty() ? owner.parentPath.node : owner.node;
          const list = apiLog.get(key) || [];
          names.forEach((nm) => list.push(nm));
          apiLog.set(key, list);
        }
        removals.set(stmt.node, { start: stmt.node.start, end: stmt.node.end });
        changed = true;
      },
    });
  }
  return { importRemovals, removals, apiLog };
}

function expandToLine(code, start, end) {
  let s = start;
  while (s > 0 && (code[s - 1] === " " || code[s - 1] === "\t")) s--;
  const lineStart = s === 0 || code[s - 1] === "\n";
  let e = end;
  while (e < code.length && (code[e] === " " || code[e] === "\t" || code[e] === ";")) e++;
  if (lineStart && code[e] === "\r") e++;
  if (lineStart && code[e] === "\n") e++;
  return lineStart ? [s, e] : [start, end];
}

function transformScript(code) {
  const { importRemovals, removals, apiLog } = analyze(code);
  const edits = [];
  importRemovals.forEach((n) => {
    const [s, e] = expandToLine(code, n.start, n.end);
    edits.push({ start: s, end: e, text: "" });
  });
  const ranges = [...removals.entries()].map(([node, r]) => ({ node, ...r })).sort((a, b) => a.start - b.start || b.end - a.end);
  const outer = [];
  for (const r of ranges) {
    const prev = outer[outer.length - 1];
    if (prev && r.start >= prev.start && r.end <= prev.end) continue;
    outer.push(r);
  }
  for (const r of outer) {
    if (r.element) {
      let s = r.start;
      let e = r.end;
      const after = code.slice(e).match(/^\s*,\s*/);
      if (after) e += after[0].length;
      else {
        const before = code.slice(0, s).match(/,\s*$/);
        if (before) s -= before[0].length;
      }
      edits.push({ start: s, end: e, text: "" });
      continue;
    }
    const [s, e] = expandToLine(code, r.start, r.end);
    edits.push({ start: s, end: e, text: "" });
  }
  for (const [node, names] of apiLog.entries()) {
    const lineStart = code.lastIndexOf("\n", node.start) + 1;
    const indent = code.slice(lineStart, node.start).match(/^\s*/)[0];
    edits.push({ start: lineStart, end: lineStart, text: `${indent}// [twin 待实现] 原 wdpapi 调用：${names.join(" → ") || "（见功能清单）"}\n` });
  }
  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let out = code;
  let last = Infinity;
  for (const ed of edits) {
    if (ed.end > last) continue;
    out = out.slice(0, ed.start) + ed.text + out.slice(ed.end);
    last = ed.start;
  }
  return { out, removed: outer.length + importRemovals.length };
}

function mergeComments(script) {
  return script.replace(/((?:[ \t]*\/\/ \[twin 待实现\] 原 wdpapi 调用：[^\n]*\n){2,})/g, (m) => {
    const indent = m.match(/^[ \t]*/)[0];
    const apis = [];
    m.trim().split("\n").forEach((l) => l.trim().replace("// [twin 待实现] 原 wdpapi 调用：", "").split(" → ").forEach((a) => {
      if (a && a !== "（见功能清单）" && !apis.includes(a)) apis.push(a);
    }));
    return `${indent}// [twin 待实现] 原 wdpapi 调用：${apis.join(" → ") || "（见功能清单）"}\n`;
  });
}

function processFile(file, write) {
  const source = fs.readFileSync(file, "utf8");
  const block = scriptBlock(source, file);
  if (!block) return { file, skipped: "no script" };
  let script = source.slice(block.start, block.end);
  let total = 0;
  for (let i = 0; i < 8; i++) {
    const r = transformScript(script);
    if (!r.removed) break;
    total += r.removed;
    script = r.out;
  }
  script = mergeComments(script);
  parse(script, PARSER_OPTS);
  if (write && total) fs.writeFileSync(file, source.slice(0, block.start) + script + source.slice(block.end), "utf8");
  return { file: path.relative(process.cwd(), file), removed: total };
}

const args = process.argv.slice(2);
const report = args[0] === "--report";
const files = report ? args.slice(1) : args;
const summary = files.map((f) => {
  try {
    return processFile(path.resolve(f), !report);
  } catch (error) {
    return { file: f, error: error.message };
  }
});
console.log(JSON.stringify(summary, null, 1));
