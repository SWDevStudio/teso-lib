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

const DOCS = [
  { file: 'Obschie_pravila_TES-2026_v2_2.docx', slug: 'obschie', title: 'Общие правила', version: '2.2', icon: 'rules' },
  { file: 'Pravila_Alkhimia_TES-2026_v1_0.docx', slug: 'alchemy', title: 'Алхимия', version: '1.0', icon: 'alchemy' },
  { file: 'Pravila_Kuznechestvo_i_Yuvelirka_TES-2026_v1_0.docx', slug: 'smithing', title: 'Кузнечество и ювелирка', version: '1.0', icon: 'smithing' },
  { file: 'Pravila_SadovodstvoTES-2026_v2_0.docx', slug: 'gardening', title: 'Садоводство', version: '2.0', icon: 'gardening' },
  { file: 'Pravila_Vera_religia_i_zhrechestvo_TES-2026_v1_0.docx', slug: 'faith', title: 'Вера, религия и жречество', version: '1.0', icon: 'faith' },
  { file: 'Pravila_Zacharovanie_TES-2026_v1_0.docx', slug: 'enchanting', title: 'Зачарование', version: '1.0', icon: 'enchanting' },
]

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim()
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

function splitSections(root, doc) {
  const blocks = root.childNodes.filter((n) => n.nodeType === 1)
  const hasHeadings = root.querySelector('h1, h2, h3') != null
  const sections = []
  const introNodes = []
  let current = null

  for (const el of blocks) {
    if ((el.getAttribute('class') || '').includes('toc')) continue
    if (normalize(el.text) === '' && !el.querySelector('img')) continue

    const tag = (el.tagName || '').toLowerCase()
    let boundary = false
    let level = 1
    if (/^h[1-6]$/.test(tag)) {
      if (hasHeadings && Number(tag[1]) <= 3) {
        boundary = true
        level = Number(tag[1])
      }
    } else if (tag === 'p' && !hasHeadings && isHeaderParagraph(el)) {
      boundary = true
    }

    if (boundary) {
      current = { title: normalize(el.text), level, nodes: [] }
      sections.push(current)
    } else if (current) {
      current.nodes.push(el)
    } else {
      introNodes.push(el)
    }
  }

  const sortWords = (s) => normalize(s).toLowerCase().split(' ').sort().join(' ')
  let intro = introNodes
  if (sections.length && sortWords(sections[0].title) === sortWords(doc.title)) {
    intro = introNodes.concat(sections.shift().nodes)
  }

  const NOISE = /^(оглавление|содержание)$|^версия[\s\d._-]/i
  const introNodesClean = intro.filter((n) => sortWords(n.text) !== sortWords(doc.title))

  return {
    intro: introNodesClean.map((n) => n.outerHTML).join(''),
    sections: sections
      .filter((s) => !NOISE.test(normalize(s.title)))
      .map((s, i) => ({
      id: `${doc.slug}-${i}`,
      title: s.title,
      level: s.level,
      html: s.nodes.map((n) => n.outerHTML).join(''),
      text: normalize(`${s.title} ${s.nodes.map((n) => n.text).join(' ')}`),
    })),
  }
}

async function processDoc(doc) {
  const images = []
  const result = await mammoth.convertToHtml(
    { path: path.join(RULES_DIR, doc.file) },
    {
      styleMap: [
        "p[style-name='toc 1'] => p.toc:fresh",
        "p[style-name='toc 2'] => p.toc:fresh",
        "p[style-name='toc 3'] => p.toc:fresh",
        "p[style-name='toc 4'] => p.toc:fresh",
        "p[style-name='TOC Heading'] => p.toc:fresh",
      ],
      convertImage: mammoth.images.imgElement(async (image) => {
        const buf = await image.readAsBuffer()
        images.push(buf)
        return { src: `__IMG_${images.length}__` }
      }),
    },
  )

  const stats = await compressImages(images, doc.slug)
  let html = result.value.replace(/__IMG_(\d+)__/g, (_, n) => `/rules/${doc.slug}/${n}.webp`)

  const root = parse(html, { blockTextElements: { script: false, style: false } })
  unwrapCallouts(root)
  const { intro, sections } = splitSections(root, doc)

  const kb = (n) => Math.round(n / 1024)
  console.log(
    `${doc.title.padEnd(28)} sections:${String(sections.length).padStart(3)}  images:${String(images.length).padStart(3)}  ${kb(stats.totalIn)}KB→${kb(stats.totalOut)}KB`,
  )
  console.log('   ' + sections.map((s) => s.title).join(' | '))

  return { id: doc.slug, title: doc.title, version: doc.version, icon: doc.icon, intro, sections }
}

const docs = []
for (const doc of DOCS) docs.push(await processDoc(doc))

const header = `// AUTO-GENERATED by scripts/build-rules.mjs — НЕ редактировать вручную.
// Источник: rules/*.docx. Пересборка: npm run rules:build
import type { IconName } from '@/components/ui/icons'

export interface RuleSection {
  id: string
  title: string
  level: number
  html: string
  text: string
}

export interface RuleDoc {
  id: string
  title: string
  version: string
  icon: IconName
  intro: string
  sections: RuleSection[]
}

export const ruleDocs: RuleDoc[] = `

fs.writeFileSync(OUT_TS, header + JSON.stringify(docs, null, 2) + '\n', 'utf8')
console.log(`\n✓ ${OUT_TS}  (${Math.round(fs.statSync(OUT_TS).size / 1024)}KB)`)
