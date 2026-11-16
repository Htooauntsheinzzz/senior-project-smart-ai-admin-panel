const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

// Shared table paging (src/utils/pagination.ts): every admin table shows 10 rows per page.
function load(file) {
  const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = { exports: {} }
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(require, module, module.exports)
  return module.exports
}
const p = load('src/utils/pagination.ts')
const rows = Array.from({ length: 23 }, (_, i) => i + 1)

test('tables use 10 rows per page', () => {
  assert.equal(p.TABLE_PAGE_SIZE, 10)
  assert.deepEqual(p.paginate(rows, 1).rows, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  assert.deepEqual(p.paginate(rows, 3), { page: 3, pageCount: 3, rows: [21, 22, 23] })
})

test('out-of-range pages are clamped (e.g. after deleting the last row of the last page)', () => {
  assert.equal(p.paginate(rows.slice(0, 20), 3).page, 2)
  assert.equal(p.paginate(rows, 0).page, 1)
  assert.deepEqual(p.paginate([], 1), { page: 1, pageCount: 1, rows: [] })
})

test('footer summary', () => {
  assert.equal(p.pageSummary(10, 10, 23, 'courses'), 'Showing 11–20 of 23 courses')
  assert.equal(p.pageSummary(20, 3, 23), 'Showing 21–23 of 23')
  assert.equal(p.pageSummary(0, 0, 0, 'courses'), 'Showing 0 of 0 courses')
})
