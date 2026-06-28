import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mammoth from 'mammoth'
import sharp from 'sharp'
import { parse } from 'node-html-parser'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RULES_DIR = path.join(ROOT, 'rules')
const PUBLIC_DIR = path.join(ROOT, 'public', 'rules')
const OUT_TS = path.join(ROOT, 'src', 'assets', 'data', 'rules.generated.ts')

const MAX_DIM = 768
const WEBP_QUALITY = 82

const BASE_STYLE_MAP = [
  "p[style-name='toc 1'] => p.toc:fresh",
  "p[style-name='toc 2'] => p.toc:fresh",
  "p[style-name='toc 3'] => p.toc:fresh",
  "p[style-name='toc 4'] => p.toc:fresh",
  "p[style-name='TOC Heading'] => p.toc:fresh",
]

const HEADING_BY_ID = [
  "p[style-id='1'] => h1:fresh",
  "p[style-id='21'] => h2:fresh",
  "p[style-id='31'] => h3:fresh",
]

const DOCS = [
  { file: 'Obschie_pravila_TES-2026_v2_2.docx', slug: 'obschie', title: 'Общие правила', version: '2.2', icon: 'rules', styleMap: HEADING_BY_ID },
  { file: '1_Pravila_po_ekonomike_v1_6_1_5.docx', slug: 'economy', title: 'Экономика', version: '1.6', icon: 'economy' },
  { file: 'Pravila_Alkhimia_TES-2026_v1_0.docx', slug: 'alchemy', title: 'Алхимия', version: '1.0', icon: 'alchemy' },
  { file: 'Pravila_Kuznechestvo_i_Yuvelirka_TES-2026_v1_0.docx', slug: 'smithing', title: 'Кузнечество и ювелирка', version: '1.0', icon: 'smithing' },
  { file: 'Pravila_SadovodstvoTES-2026_v2_0.docx', slug: 'gardening', title: 'Садоводство', version: '2.0', icon: 'gardening' },
  { file: 'Pravila_Vera_religia_i_zhrechestvo_TES-2026_v1_0.docx', slug: 'faith', title: 'Вера, религия и жречество', version: '1.0', icon: 'faith' },
  { file: 'Pravila_Zacharovanie_TES-2026_v1_0.docx', slug: 'enchanting', title: 'Зачарование', version: '1.0', icon: 'enchanting' },
]

const CLASS_CHAPTER = 'Описание навыков и магии'
const CLASS_GENERAL = new Set(['Общие правила навыков', 'Общие правила магии'])
const CLASS_META = {
  Воин: { icon: 'warrior' },
  Маг: { icon: 'mage' },
  Вор: { icon: 'thief' },
  Жрец: { icon: 'priest' },
  Алхимик: { icon: 'alchemy', craftSlug: 'alchemy' },
  Зачарователь: { icon: 'enchanting', craftSlug: 'enchanting' },
  Кузнец: { icon: 'smithing', craftSlug: 'smithing' },
  Ювелир: { icon: 'jeweler', craftSlug: 'smithing' },
  Садовод: { icon: 'gardening', craftSlug: 'gardening' },
  'Экономист-Строитель': { icon: 'builder' },
  'Экономист-Управленец': { icon: 'manager' },
  'Экономист-Новатор': { icon: 'innovator' },
  Полководец: { icon: 'commander' },
}

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function sortWords(text) {
  return normalize(text).toLowerCase().split(' ').sort().join(' ')
}

function isFullyBold(p) {
  const text = normalize(p.text)
  if (!text) return false
  const strongText = normalize(p.querySelectorAll('strong').map((s) => s.text).join(''))
  return strongText.length > 0 && strongText.replace(/\s+/g, '') === text.replace(/\s+/g, '')
}

function isHeaderParagraph(p) {
  if (p.querySelector('img')) return false
  const text = normalize(p.text)
  if (!text || text.length > 80) return false
  if (/^[-–—•·*]/.test(text)) return false
  if (/^\d+[.)]/.test(text)) return false
  if (isFullyBold(p)) return true
  if (/[:：]$/.test(text)) return true
  return false
}

async function compressImages(images, slug) {
  const dir = path.join(PUBLIC_DIR, slug)
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  let totalIn = 0
  let totalOut = 0
  for (let i = 0; i < images.length; i++) {
    totalIn += images[i].length
    const out = path.join(dir, `${i + 1}.webp`)
    await sharp(images[i])
      .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(out)
    totalOut += fs.statSync(out).size
  }
  return { totalIn, totalOut }
}

function unwrapCallouts(root) {
  for (const table of root.querySelectorAll('table')) {
    const cells = table.querySelectorAll('td, th')
    if (cells.length === 1) {
      const aside = parse('<aside class="rule-callout"></aside>').querySelector('aside')
      aside.set_content(cells[0].innerHTML)
      table.replaceWith(aside)
    }
  }
}

function buildTree(root, doc) {
  const blocks = root.childNodes.filter((n) => n.nodeType === 1)
  const hasHeadings = root.querySelector('h1, h2, h3') != null
  const rootNodes = []
  const introNodes = []
  const stack = []

  for (const el of blocks) {
    if ((el.getAttribute('class') || '').includes('toc')) continue
    if (normalize(el.text) === '' && !el.querySelector('img')) continue

    const tag = (el.tagName || '').toLowerCase()
    let level = 0
    if (/^h[1-6]$/.test(tag)) {
      if (hasHeadings && Number(tag[1]) <= 4) level = Number(tag[1])
    } else if (tag === 'p' && !hasHeadings && isHeaderParagraph(el)) {
      level = 1
    }

    if (level) {
      const node = { title: normalize(el.text), level, nodes: [], children: [] }
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop()
      if (stack.length) stack[stack.length - 1].children.push(node)
      else rootNodes.push(node)
      stack.push(node)
    } else if (stack.length) {
      stack[stack.length - 1].nodes.push(el)
    } else {
      introNodes.push(el)
    }
  }

  const NOISE = /^(оглавление|содержание)$|^версия[\s\d._-]/i
  const introClean = introNodes.filter((n) => {
    const text = normalize(n.text)
    return sortWords(text) !== sortWords(doc.title) && !NOISE.test(text)
  })

  return { rootNodes, intro: introClean.map((n) => n.outerHTML).join('') }
}

function makeCounter(slug) {
  let n = 0
  return () => `${slug}-${n++}`
}

function nodeHtml(node) {
  return node.nodes.map((n) => n.outerHTML).join('')
}

function nodeText(node) {
  const own = normalize(`${node.title} ${node.nodes.map((n) => n.text).join(' ')}`)
  const kids = node.children.map(nodeText).join(' ')
  return normalize(`${own} ${kids}`)
}

function serializeSection(node, nextId) {
  return {
    id: nextId(),
    title: node.title,
    level: node.level,
    html: nodeHtml(node),
    text: normalize(`${node.title} ${node.nodes.map((n) => n.text).join(' ')}`),
    children: node.children.map((child) => serializeSection(child, nextId)),
  }
}

async function processDoc(doc) {
  const images = []
  const result = await mammoth.convertToHtml(
    { path: path.join(RULES_DIR, doc.file) },
    {
      styleMap: [...BASE_STYLE_MAP, ...(doc.styleMap || [])],
      convertImage: mammoth.images.imgElement(async (image) => {
        const buf = await image.readAsBuffer()
        images.push(buf)
        return { src: `__IMG_${images.length}__` }
      }),
    },
  )

  const stats = await compressImages(images, doc.slug)
  const html = result.value.replace(/__IMG_(\d+)__/g, (_, n) => `/rules/${doc.slug}/${n}.webp`)

  const root = parse(html, { blockTextElements: { script: false, style: false } })
  unwrapCallouts(root)
  const { rootNodes, intro } = buildTree(root, doc)

  return { doc, rootNodes, intro, imageCount: images.length, stats }
}

function extractClasses(rootNodes) {
  const index = rootNodes.findIndex((n) => normalize(n.title) === CLASS_CHAPTER)
  if (index < 0) return null
  const chapter = rootNodes.splice(index, 1)[0]
  const nextId = makeCounter('classes')

  const general = chapter.children
    .filter((c) => CLASS_GENERAL.has(normalize(c.title)))
    .map((c) => serializeSection(c, nextId))

  const classes = chapter.children
    .filter((c) => !CLASS_GENERAL.has(normalize(c.title)))
    .map((c) => {
      const meta = CLASS_META[normalize(c.title)] || { icon: 'rules' }
      return {
        id: nextId(),
        name: c.title,
        icon: meta.icon,
        craftSlug: meta.craftSlug ?? null,
        html: nodeHtml(c),
        text: nodeText(c),
        sections: c.children.map((child) => serializeSection(child, nextId)),
      }
    })

  return { intro: nodeHtml(chapter), general, classes }
}

const processed = []
for (const doc of DOCS) processed.push(await processDoc(doc))

let ruleClasses = null
const docs = processed.map(({ doc, rootNodes, intro, imageCount }) => {
  const nextId = makeCounter(doc.slug)
  if (doc.slug === 'obschie') ruleClasses = extractClasses(rootNodes)
  return {
    id: doc.slug,
    title: doc.title,
    version: doc.version,
    icon: doc.icon,
    intro,
    originalImages: Array.from(
      { length: imageCount },
      (_, i) => `/rules/${doc.slug}/${i + 1}.webp`,
    ),
    sections: rootNodes.map((node) => serializeSection(node, nextId)),
  }
})

const kb = (n) => Math.round(n / 1024)
for (const { doc, rootNodes, imageCount, stats } of processed) {
  const total = doc.slug === 'obschie' ? rootNodes.length : rootNodes.length
  console.log(`${doc.title.padEnd(28)} top:${String(total).padStart(3)}  images:${String(imageCount).padStart(3)}  ${kb(stats.totalIn)}KB→${kb(stats.totalOut)}KB`)
}
if (ruleClasses) {
  console.log(`\nКлассы: ${ruleClasses.classes.length} → ${ruleClasses.classes.map((c) => c.name).join(', ')}`)
  console.log(`Вводные: ${ruleClasses.general.map((g) => g.title).join(', ')}`)
}

const header = `// AUTO-GENERATED by scripts/build-rules.mjs — НЕ редактировать вручную.
// Источник: rules/*.docx. Пересборка: npm run rules:build
import type { IconName } from '@/components/ui/icons'

export interface RuleSection {
  id: string
  title: string
  level: number
  html: string
  text: string
  children: RuleSection[]
}

export interface RuleDoc {
  id: string
  title: string
  version: string
  icon: IconName
  intro: string
  originalImages: string[]
  sections: RuleSection[]
}

export interface RuleClass {
  id: string
  name: string
  icon: IconName
  craftSlug: string | null
  html: string
  text: string
  sections: RuleSection[]
}

export interface RuleClasses {
  intro: string
  general: RuleSection[]
  classes: RuleClass[]
}

export const ruleDocs: RuleDoc[] = ${JSON.stringify(docs, null, 2)}

export const ruleClasses: RuleClasses = ${JSON.stringify(ruleClasses, null, 2)}
`

fs.writeFileSync(OUT_TS, header, 'utf8')
console.log(`\n✓ ${OUT_TS}  (${kb(fs.statSync(OUT_TS).size)}KB)`)
