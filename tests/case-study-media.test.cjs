const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, console, URL, FormData, File, Buffer, process: { env: { NODE_ENV: 'production' } }, require: name => dependencies[name] ?? require(name), ...globals });
  return module.exports;
}
const resolver = load('src/lib/media/resolve-image-url.ts');
const visuals = load('src/types/case-study-visual.ts', { '@/lib/media/resolve-image-url': resolver });
const media = load('src/lib/media/case-study-media.ts', { '@/types/case-study-visual': visuals });

test('cleared canonical image never resurrects obsolete URL; IDs are deterministic', () => {
  const cleared = visuals.normalizeCaseStudyVisual({ id: 'stable', imageUrl: '', url: 'https://example.com/old.png' });
  assert.equal(cleared.imageUrl, ''); assert.equal(cleared.url, '');
  assert.equal(cleared.id, 'stable');
  assert.equal(visuals.normalizeCaseStudyVisual('legacy.png').id, visuals.normalizeCaseStudyVisual('legacy.png').id);
  assert.notEqual(visuals.normalizeCaseStudyVisual('legacy.png', 0).id, visuals.normalizeCaseStudyVisual('legacy.png', 1).id);
});

test('save synchronizes media and legacy images without losing visual settings', () => {
  const item = { id: 'one', imageUrl: 'https://example.com/new.png', url: 'https://example.com/old.png', displayType: 'dashboard', displaySize: 'medium', backgroundType: 'custom', backgroundColor: '#ffffff', padding: 24, radius: 8, fit: 'contain', alt: 'Alt', caption: 'Caption' };
  const result = media.normalizeSectionMedia({ images: ['old.png'], metadata: { media: [item, { imageUrl: 'blob:temporary' }] } });
  assert.equal(result.images.length, 1);
  assert.equal(result.images[0], item.imageUrl);
  for (const key of Object.keys(item)) assert.equal(result.metadata.media[0][key], key === 'url' ? item.imageUrl : item[key]);
  assert.equal(media.normalizeSectionMedia({ images: ['old.png'], metadata: { media: [] } }).images.length, 0);
});

test('production upload responses reject temporary and local paths', () => {
  for (const raw of ['blob:temp', '/uploads/test.png', 'file:///test.png', 'C:\\test.png', 'public/uploads/test.png', 'test.png', 'https://', 'data:image/png;base64,AAAA', {}, null]) {
    assert.throws(() => media.resolveUploadedImageUrl(raw));
  }
  assert.equal(media.resolveUploadedImageUrl('https://example.supabase.co/storage/v1/object/public/portfolio-images/a.png'), 'https://example.supabase.co/storage/v1/object/public/portfolio-images/a.png');
});

test('case study saves do not dispatch dashboard refresh; other mutations still do', async () => {
  let refreshes = 0;
  const client = load('src/lib/dashboard/action-client.ts', { './transport': { decodeDashboardData: x => x } }, {
    Event, fetch: async () => Response.json({ success: true }),
    window: { dispatchEvent: () => refreshes++ },
  });
  await client.dashboardAction('updateCaseStudyAction')({}, new FormData());
  await client.dashboardAction('createCaseStudyAction')({}, new FormData());
  assert.equal(refreshes, 0);
  await client.dashboardAction('deleteCaseStudyAction')('id');
  assert.equal(refreshes, 1);
});

test('production storage failure returns an error without writing local files', async () => {
  let writes = 0;
  const api = load('src/app/api/upload/route.ts', {
    '@/lib/dashboard/auth': { requireAdmin: async () => ({ authorized: true }) },
    'fs/promises': { mkdir: async () => writes++, writeFile: async () => writes++ },
  });
  const form = new FormData(); form.set('file', new File(['image'], 'test.png', { type: 'image/png' }));
  const result = await api.POST({ formData: async () => form });
  assert.equal(result.status, 500); assert.equal(writes, 0);
  assert.match((await result.json()).error, /Permanent image upload failed/);
});

test('update uses a transaction and revalidates old and new actual project paths', async () => {
  const paths = []; let saved;
  const project = { id: 'project', slug: 'old-project', projectType: 'Personal Project' };
  const tx = {
    caseStudy: { update: async args => { saved = args.data; return args.data; } },
    caseStudySection: { deleteMany: async () => {}, createMany: async () => {} },
    project: { update: async args => ({ ...project, ...args.data }) },
  };
  const api = load('src/app/dashboard/(protected)/case-studies/actions.ts', {
    'next/cache': { revalidatePath: path => paths.push(path) },
    '@/lib/dashboard/auth': { requireAdmin: async () => ({ authorized: true }) },
    '@/lib/database/prisma': { prisma: { caseStudy: { findUnique: async () => ({ id: 'case', slug: 'old-case', projectId: project.id, project, status: 'DRAFT' }) }, $transaction: async fn => fn(tx) } },
    '@/lib/media/resolve-image-url': resolver,
    '@/lib/media/case-study-media': media,
    '@/lib/constants/project-types': { isWorkProjectType: () => false, isPersonalProjectType: () => true },
  });
  const form = new FormData();
  for (const [key,value] of Object.entries({ id: 'case', title: 'Title', slug: 'new-case', sectionsJson: '[]', technologies: 'React,Figma', showOnHome: 'true' })) form.set(key,value);
  assert.equal((await api.updateCaseStudyAction({}, form)).success, true);
  assert.equal(saved.metadata.technologies.length, 2);
  assert.equal(saved.metadata.showOnHome, true);
  for (const path of ['/case-studies/old-case', '/case-studies/new-case', '/personal-projects/old-project', '/personal-projects/new-case']) assert.ok(paths.includes(path), path);
  assert.ok(!paths.includes('/works/old-project'));
});

function hookHarness() {
  const slots = []; let cursor = 0; let effects = []; const tasks = [];
  const react = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef(initial) { const i = cursor++; slots[i] ??= { current: initial }; return slots[i]; },
    useTransition() { return [false, fn => { tasks.push(fn()); }]; },
    useEffect(effect, deps) { const i = cursor++; if (!slots[i] || deps.some((value, index) => !Object.is(value, slots[i][index]))) effects.push(effect); slots[i] = deps; },
  };
  return { react, settle: () => Promise.all(tasks), render(component, props) { cursor = 0; effects = []; const tree = component(props); for (const effect of effects) effect(); return tree; } };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };

test('broken visual recovers after URL replacement and keeps preview loading eager', () => {
  const hooks = hookHarness();
  const { CaseStudyVisualBlock } = load('src/components/case-study/CaseStudyVisualBlock.tsx', {
    react: hooks.react, 'react/jsx-runtime': jsx, 'lucide-react': { ImageOff: 'ImageOff' },
    '@/types/case-study-visual': visuals, '@/lib/media/resolve-image-url': resolver,
  });
  const props = { visual: { imageUrl: 'https://example.com/broken.png' }, isPreview: true };
  let tree = hooks.render(CaseStudyVisualBlock, props);
  nodes(tree).find(node => node.type === 'img').props.onError();
  tree = hooks.render(CaseStudyVisualBlock, props);
  assert.equal(nodes(tree).filter(node => node.type === 'img').length, 0);
  const replaced = { ...props, visual: { imageUrl: 'https://example.com/new.png' } };
  hooks.render(CaseStudyVisualBlock, replaced);
  tree = hooks.render(CaseStudyVisualBlock, replaced);
  const img = nodes(tree).find(node => node.type === 'img');
  assert.equal(img.props.src, replaced.visual.imageUrl);
  assert.equal(img.props.loading, 'eager');
});

test('remove image emits both cleared URL fields', () => {
  const hooks = hookHarness(); let changed;
  const { CaseStudyVisualEditor } = load('src/components/dashboard/case-studies/CaseStudyVisualEditor.tsx', {
    react: hooks.react, 'react/jsx-runtime': jsx, 'lucide-react': {},
    '@/types/case-study-visual': visuals, '@/lib/media/resolve-image-url': resolver,
    '@/lib/media/case-study-media': media, '@/components/case-study/CaseStudyVisualBlock': { CaseStudyVisualBlock: 'Preview' },
  });
  const tree = hooks.render(CaseStudyVisualEditor, { value: { imageUrl: 'https://example.com/old.png', url: 'https://example.com/old.png' }, onChange: value => { changed = value; } });
  nodes(tree).find(node => node.props?.title === 'Remove image').props.onClick();
  assert.equal(changed.imageUrl, ''); assert.equal(changed.url, '');
});

test('dashboard subscribes only to intentional refresh, never generic window focus', () => {
  const hooks = hookHarness(); const events = [];
  const { DashboardPage } = load('src/components/dashboard/DashboardPage.tsx', {
    react: hooks.react, 'react/jsx-runtime': jsx,
    'next/navigation': { useParams: () => ({}), useSearchParams: () => new URLSearchParams(), useRouter: () => ({}) },
    '@/lib/dashboard/transport': { decodeDashboardData: value => value },
    '@/components/dashboard/DashboardSkeleton': { DashboardSkeleton: 'Skeleton' },
  }, { URLSearchParams, AbortController, window: { addEventListener: name => events.push(name) }, fetch: async () => Response.json({}) });
  hooks.render(DashboardPage, { view: 'case-study', component: 'Editor' });
  assert.deepEqual(events, ['dashboard:refresh']);
});

test('editor keeps Final Screens after upload and save; preview uses unsaved React state', async () => {
  const hooks = hookHarness(); let payload;
  const { AdvancedCaseStudyEditor } = load('src/components/dashboard/case-studies/AdvancedCaseStudyEditor.tsx', {
    react: hooks.react, 'react/jsx-runtime': jsx, 'lucide-react': {}, 'next/image': 'Image', 'next/link': 'Link',
    '@/lib/dashboard/client-actions': { updateCaseStudyAction: async (_, form) => { payload = form; return { success: true }; } },
    '@/components/dashboard/ImageUploader': { ImageUploader: 'ImageUploader' },
    '@/components/dashboard/TechStackPicker': { TechStackPicker: 'TechStackPicker' },
    './CaseStudyEditorPreview': { CaseStudyEditorPreview: 'UnsavedPreview' },
    '@/components/dashboard/case-studies/CaseStudyVisualEditor': { CaseStudyVisualEditor: 'VisualEditor' },
    '@/lib/media/case-study-media': media, '@/types/case-study-visual': visuals, '@/lib/media/resolve-image-url': resolver,
  }, { sessionStorage: { getItem: () => null, setItem: () => {} }, window: { addEventListener() {}, removeEventListener() {} }, alert: message => assert.fail(message) });
  const props = { caseStudy: { id: 'case', title: 'Saved title', slug: 'case', sections: [{ slug: 'final-screens', title: 'Final Screens', images: ['old.png'] }] } };
  let tree = hooks.render(AdvancedCaseStudyEditor, props);
  const text = value => typeof value === 'string' ? value : Array.isArray(value) ? value.map(text).join('') : value?.props ? text(value.props.children) : '';
  const button = label => nodes(tree).find(node => node.type === 'button' && text(node).includes(label));
  nodes(tree).find(node => node.type === 'input' && node.props.value === 'Saved title').props.onChange({ target: { value: 'Unsaved title' } });
  button('Final Screens').props.onClick();
  tree = hooks.render(AdvancedCaseStudyEditor, props);
  let visual = nodes(tree).find(node => node.type === 'VisualEditor');
  visual.props.onChange({ ...visual.props.visual, imageUrl: 'https://example.com/new.png', url: 'https://example.com/new.png', padding: 32 });
  tree = hooks.render(AdvancedCaseStudyEditor, props);
  button('Preview').props.onClick();
  tree = hooks.render(AdvancedCaseStudyEditor, props);
  const preview = nodes(tree).find(node => node.type === 'UnsavedPreview');
  assert.equal(preview.props.caseStudy.title, 'Unsaved title');
  assert.equal(preview.props.caseStudy.sections[0].metadata.media[0].padding, 32);
  button('Save Draft').props.onClick(); await hooks.settle();
  tree = hooks.render(AdvancedCaseStudyEditor, props);
  visual = nodes(tree).find(node => node.type === 'VisualEditor');
  assert.ok(visual, 'Final Screens remains open');
  assert.equal(visual.props.visual.imageUrl, 'https://example.com/new.png');
  assert.equal(JSON.parse(payload.get('sectionsJson'))[0].images[0], 'https://example.com/new.png');
});
