// Bo'limlar ro'yxati: slug (URL) → backend kind
export const SECTIONS = [
  { slug: 'listening', kind: 'listening', type: 'test', title: 'Listening', sub: '6 qism, 35 savol', icon: '🎧' },
  { slug: 'reading', kind: 'reading', type: 'test', title: 'Reading', sub: '5 qism, 35 savol', icon: '📖' },
  { slug: 'writing', kind: 'writing', type: 'lesson', title: 'Writing', sub: 'Part 1.1, 1.2, 2 · AI tekshiradi', icon: '✍️' },
  { slug: 'speaking', kind: 'speaking', type: 'lesson', title: 'Speaking', sub: 'Part 1.1 dan 3 gacha', icon: '🎤' },
  { slug: 'lugat', kind: 'vocab', type: 'lesson', title: "Lug'at", sub: "Mavzular bo'yicha so'zlar", icon: '🗂️' },
  { slug: 'grammatika', kind: 'grammar', type: 'lesson', title: 'Grammatika', sub: 'Qoidalar va mashqlar', icon: '📐' },
  { slug: 'stories', kind: 'stories', type: 'lesson', title: 'Stories', sub: 'A1 dan C1 gacha hikoyalar', icon: '📚' },
  { slug: 'kitoblar', kind: 'book', type: 'lesson', title: 'Kitoblar', sub: '', icon: '📘' },
  { slug: 'games', kind: 'games', type: 'games', title: 'O\'yinlar', sub: 'Vocabulary · Grammar · XP', icon: '🎮', path: '/games' },
  { slug: 'learning', kind: 'learning', type: 'learning', title: 'O\'quv markazi', sub: 'Hikoya · Podcast · AI · Test', icon: '🎓', path: '/learning' },
  { slug: 'general-listening', kind: 'general-listening', type: 'test', title: 'General Listening', sub: 'A1 dan C1 gacha', icon: '🔊' },
  { slug: 'general-reading', kind: 'general-reading', type: 'test', title: 'General Reading', sub: 'A1 dan C1 gacha', icon: '📰' },
]

export const bySlug = (slug) => SECTIONS.find((s) => s.slug === slug)
export const byKind = (kind) => SECTIONS.find((s) => s.kind === kind)

export const TELEGRAM = 'https://t.me/bekzodturgunovkx'
export const COURSE_LINK = 'https://t.me/m/1gl_iGWxZTMy'
