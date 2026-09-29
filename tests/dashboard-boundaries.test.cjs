const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextResponse } = require('next/server');

function load(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(file, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, console, URL, FormData, Date,
    require: name => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name),
    ...globals,
  }, { filename: file });
  return module.exports;
}

const transport = load('src/lib/dashboard/transport.ts');
const input = load('src/lib/dashboard/action-input.ts');

test('all client action bindings resolve to the same allowlisted server operation', () => {
  const source = fs.readFileSync('src/lib/dashboard/action-registry.ts', 'utf8');
  const dependencies = { 'server-only': {} };
  for (const match of source.matchAll(/import \{ (\w+) \} from '([^']+)'/g)) {
    dependencies[match[2]] ??= {};
    dependencies[match[2]][match[1]] = match[1];
  }
  const server = load('src/lib/dashboard/action-registry.ts', dependencies).dashboardActions;
  const client = load('src/lib/dashboard/client-actions.ts', { './action-client': { dashboardAction: name => name } });
  assert.equal(Object.keys(server).length, 65);
  for (const [name, value] of Object.entries(server)) assert.equal(client[name], value);
  assert.equal(Object.keys(client).length, Object.keys(server).length);
});

test('all client action bindings resolve to the same allowlisted server operation', () => {
  const source = fs.readFileSync('src/lib/dashboard/action-registry.ts', 'utf8');
  const dependencies = { 'server-only': {} };
  for (const match of source.matchAll(/import \{ (\w+) \} from '([^']+)'/g)) {
    dependencies[match[2]] ??= {};
    dependencies[match[2]][match[1]] = match[1];
  }
  const server = load('src/lib/dashboard/action-registry.ts', dependencies).dashboardActions;
  const client = load('src/lib/dashboard/client-actions.ts', { './action-client': { dashboardAction: name => name } });
  assert.equal(Object.keys(server).length, 65);
  for (const [name, value] of Object.entries(server)) assert.equal(client[name], value);
  assert.equal(Object.keys(client).length, Object.keys(server).length);
});

test('Date transport preserves dates and leaves user strings and JSON keys intact', () => {
  const date = new Date('2026-09-29T00:00:00Z');
  const value = { rows: [{ createdAt: date, text: date.toISOString() }], metadata: { $date: 'user content' } };
  const decoded = transport.decodeDashboardData(JSON.parse(JSON.stringify(transport.encodeDashboardData(value))));
  assert.equal(decoded.rows[0].createdAt.getTime(), date.getTime());
  assert.equal(decoded.rows[0].text, date.toISOString());
  assert.equal(decoded.metadata.$date, 'user content');
});

test('requireAdmin rejects missing and non-admin sessions, supports bearer sessions', async () => {
  let session = null;
  let received;
  const auth = load('src/lib/dashboard/auth.ts', {
    '@/lib/auth/session': { verifySession: async token => { received = token; return session; } },
  });
  assert.equal((await auth.requireAdmin()).authorized, false);
  session = { user: { role: 'USER' } };
  assert.equal((await auth.requireAdmin()).authorized, false);
  session = { user: { role: 'ADMIN' } };
  assert.equal((await auth.requireAdmin(new Request('http://localhost', { headers: { Authorization: 'Bearer example' } }))).authorized, true);
  assert.equal(received, 'example');
});

test('page and action endpoints authorize before loaders, dispatch, or body parsing', async () => {
  let authorized = false;
  let calls = 0;
  const dependencies = {
    '@/lib/dashboard/auth': { requireAdmin: async () => authorized ? { authorized: true } : { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } },
    '@/lib/dashboard/page-loaders': { pageLoaders: { example: async () => { calls++; return { private: true }; } } },
    '@/lib/dashboard/action-registry': { dashboardActions: { example: async value => { calls++; return value; } } },
    '@/lib/dashboard/transport': transport,
    '@/lib/dashboard/action-input': input,
  };
  // Unused imports are deliberately inert. Any real database access would fail.
  const source = fs.readFileSync('src/app/api/dashboard/[[...path]]/route.ts', 'utf8');
  for (const match of source.matchAll(/from ['"](@\/[^'"]+)['"]/g)) dependencies[match[1]] ??= {};
  const api = load('src/app/api/dashboard/[[...path]]/route.ts', dependencies);
  const context = path => ({ params: Promise.resolve({ path }) });
  assert.equal((await api.GET(new Request('http://localhost/api/dashboard/page-data?_view=example'), context(['page-data']))).status, 401);
  assert.equal((await api.POST(new Request('http://localhost/api/dashboard/actions/example', { method: 'POST', body: 'not form data' }), context(['actions', 'example']))).status, 401);
  assert.equal(calls, 0);
  authorized = true;
  assert.equal((await api.GET(new Request('http://localhost/api/dashboard/page-data?_view=__proto__'), context(['page-data']))).status, 404);
  const body = new FormData(); body.set('$args', JSON.stringify([{ kind: 'json', value: 'preserved' }]));
  const request = (origin, header = '1') => new Request('http://localhost/api/dashboard/actions/example', { method: 'POST', headers: { Origin: origin, 'X-Dashboard-Action': header }, body });
  assert.equal((await api.POST(request('https://attacker.example'), context(['actions', 'example']))).status, 403);
  assert.equal((await api.POST(request('http://localhost', ''), context(['actions', 'example']))).status, 403);
  assert.equal((await api.POST(request('http://localhost'), context(['actions', 'constructor']))).status, 404);
  assert.equal(calls, 0);
  const response = await api.POST(request('http://localhost'), context(['actions', 'example']));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data, 'preserved');
  assert.equal(calls, 1);
});

test('client transport preserves action name, repeated fields, files, and previous form state', async () => {
  let sent;
  let refreshed = 0;
  const client = load('src/lib/dashboard/action-client.ts', { './transport': transport }, {
    Event,
    window: { dispatchEvent: () => refreshed++, location: { assign: () => assert.fail('Unexpected redirect') } },
    fetch: async (url, options) => { sent = { url, options }; return Response.json(transport.encodeDashboardData({ success: true })); },
  });
  const form = new FormData();
  form.append('ids', 'one'); form.append('ids', 'two');
  form.append('file', new Blob(['contents'], { type: 'text/plain' }), 'resume.txt');
  await client.dashboardAction('saveEducationAction')({ error: 'old error' }, form);
  assert.equal(sent.url, '/api/dashboard/actions/saveEducationAction');
  assert.equal(sent.options.headers['X-Dashboard-Action'], '1');
  const decoded = input.decodeActionArguments(sent.options.body);
  assert.equal(decoded[0].error, 'old error');
  assert.deepEqual(Array.from(decoded[1].getAll('ids')), ['one', 'two']);
  assert.equal(await decoded[1].get('file').text(), 'contents');
  assert.equal(decoded[1].get('file').name, 'resume.txt');
  assert.equal(refreshed, 1);
});
