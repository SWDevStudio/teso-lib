import { getDb, persist } from './client'

export interface Article {
  id: number
  title: string
  body: string
  author: string | null
  tags: string | null
  created_at: string
  is_builtin: number
}

export interface NewArticle {
  title: string
  body: string
  author?: string
  tags?: string[]
}

export async function listArticles(): Promise<Article[]> {
  const res = await getDb().query(
    'SELECT * FROM articles ORDER BY datetime(created_at) DESC, id DESC;',
  )
  return (res.values ?? []) as Article[]
}

export async function searchArticles(term: string): Promise<Article[]> {
  const q = term.trim()
  if (!q) return listArticles()
  const like = `%${q}%`
  const res = await getDb().query(
    `SELECT * FROM articles
     WHERE title LIKE ? OR body LIKE ?
     ORDER BY datetime(created_at) DESC, id DESC;`,
    [like, like],
  )
  return (res.values ?? []) as Article[]
}

export async function addArticle(a: NewArticle): Promise<number> {
  const res = await getDb().run(
    'INSERT INTO articles (title, body, author, tags) VALUES (?, ?, ?, ?);',
    [a.title, a.body, a.author ?? null, a.tags ? JSON.stringify(a.tags) : null],
  )
  await persist()
  return res.changes?.lastId ?? -1
}

export async function deleteArticle(id: number): Promise<void> {
  await getDb().run('DELETE FROM articles WHERE id = ?;', [id])
  await persist()
}
