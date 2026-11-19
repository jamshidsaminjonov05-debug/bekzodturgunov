// Bo'limlar bo'yicha o'quv kitoblari katalogi.
// Muqovalar frontend/public/books/ da. Narx/jadval faqat admin tomonidan berilsa ko'rsatiladi.
const B = (name) => `/books/${name}`

export const BOOK_CATALOG = {
  listening: [
    { id: 'tactics-basic', title: 'Tactics for Listening — Basic', author: 'Jack Richards', level: 'A1–A2', cover: B('tactics1.jpg'), desc: 'Oddiy suhbatlar va kundalik vaziyatlar.' },
    { id: 'tactics-developing', title: 'Tactics for Listening — Developing', author: 'Jack Richards', level: 'B1–B2', cover: B('tacticsa2.jpg'), desc: 'Uzunroq suhbatlar, asosiy fikrni tushunish.' },
    { id: 'tactics-expanding', title: 'Tactics for Listening — Expanding', author: 'Jack Richards', level: 'B2–C1', cover: B('tactiks.jpg'), desc: 'Murakkab suhbatlar va tafsilotlar.' },
    { id: 'b2-first-trainer', title: 'B2 First Trainer', author: 'Cambridge', level: 'B2', cover: B('b2treanier.jpg'), desc: 'Imtihon uslubidagi listening testlar.' },
  ],
  reading: [
    { id: 'els-intermediate', title: 'ELS Intermediate', author: 'Nesibe Sevgi Öndeş', level: 'B1', cover: B('els.jpg'), desc: 'Pasaj, vocabulary va comprehension.', elsSeries: 'intermediate' },
    { id: 'short-stories', title: 'Short Stories in English', author: 'Olly Richards', level: 'B1–B2', cover: B('shortstory.jpg'), desc: 'Qiziqarli hikoyalar orqali o‘qish va lug‘at.' },
    { id: 'complete-first', title: 'Complete First', author: 'Cambridge', level: 'B2', cover: B('complitefirst.jpg'), desc: 'Imtihon uslubidagi reading mashqlari.' },
    { id: 'objective-advanced', title: 'Objective Advanced', author: 'O’Dell & Broadhead', level: 'C1', cover: B('objectadvanced.jpg'), desc: 'Advanced reading va vocabulary.' },
    { id: 'cambridge-readers', title: 'Cambridge English Readers', author: 'Cambridge', level: 'A2–C1', cover: B('cambridereading.jpg'), desc: 'Turli darajadagi moslashtirilgan matnlar.' },
    { id: 'in-focus', title: 'In Focus: Reading', author: 'Cambridge', level: 'B2–C1', cover: B('infocus.jpg'), desc: 'Akademik va ilmiy matnlar bilan ishlash.' },
  ],
  writing: [
    { id: 'great-writing-3', title: 'Great Writing 3', author: 'National Geographic', level: 'B1', cover: B('greatwiting.jpg'), desc: 'Paragraph yozish va fikrni tartibga solish.' },
    { id: 'great-writing-4', title: 'Great Writing 4', author: 'National Geographic', level: 'B2', cover: B('greatewriting4.jpg'), desc: 'Essay yozish, dalillar va misollar.' },
    { id: 'great-writing-5', title: 'Great Writing 5', author: 'Tison Pugh', level: 'C1', cover: B('greatwriting5.jpg'), desc: 'Murakkab va akademik yozuv.' },
  ],
  speaking: [
    { id: 'speak-now-2', title: 'Speak Now 2', author: 'Oxford', level: 'A2–B1', cover: B('speaknow.jpg'), desc: 'Kundalik mavzularda gapirish.' },
    { id: 'speak-now-3', title: 'Speak Now 3', author: 'Oxford', level: 'B1–B2', cover: B('speaknow3.jpg'), desc: 'Fikr bildirish va suhbat.' },
    { id: 'speak-now-4', title: 'Speak Now 4', author: 'Oxford', level: 'B2–C1', cover: B('speaknow4.jpg'), desc: 'Murakkab mavzularni muhokama qilish.' },
  ],
  lugat: [
    { id: 'oxford-word-skills', title: 'Oxford Word Skills — Basic', author: 'Oxford', level: 'A1–A2', cover: B('oxfordwordskils.jpg'), desc: 'Kundalik so‘zlar va mavzular.' },
    { id: 'vocab-in-use', title: 'English Vocabulary in Use', author: 'McCarthy & O’Dell', level: 'A2–B2', cover: B('vocabularyinuse.jpg'), desc: 'Mavzu bo‘yicha so‘zlar va iboralar.' },
    { id: 'vocab-advanced', title: 'English Vocabulary in Use — Advanced', author: 'McCarthy & O’Dell', level: 'C1–C2', cover: B('vocabularyadvanced.jpg'), desc: 'Advanced lug‘at va iboralar.' },
    { id: 'collocations', title: 'English Collocations in Use', author: 'Cambridge', level: 'B1–C1', cover: B('collectionsinuse.jpg'), desc: 'Tabiiy so‘z birikmalari.' },
  ],
  grammatika: [
    { id: 'essential-grammar', title: 'Essential Grammar in Use', author: 'Raymond Murphy', level: 'A1–A2', cover: B('essential.jpg'), desc: 'Boshlang‘ich grammatika.' },
    { id: 'grammar-in-use', title: 'English Grammar in Use', author: 'Raymond Murphy', level: 'B1–B2', cover: B('grammarb2.jpg'), desc: 'Asosiy va o‘rta daraja grammatika.' },
    { id: 'advanced-grammar', title: 'Advanced Grammar in Use', author: 'Cambridge', level: 'B2–C1', cover: B('grammarc.jpg'), desc: 'Murakkab grammatika.' },
    { id: 'destination-b2', title: 'Destination B2', author: 'Mann & Taylore-Knowles', level: 'B2', cover: B('desyinitionb2.jpg'), desc: 'Grammar va Vocabulary birgalikda.' },
    { id: 'destination-c1', title: 'Destination C1 & C2', author: 'Mann & Taylore-Knowles', level: 'C1–C2', cover: B('destinationc.jpg'), desc: 'Advanced grammar va vocabulary.' },
  ],
  stories: [
    { id: 'bookworms-starter', title: 'Oxford Bookworms — Starter / Stage 1', author: 'Oxford', level: 'A1–A2', cover: B('oxfordbookb.jpg'), desc: 'Qisqa va sodda hikoyalar.' },
    { id: 'bookworms-stage3', title: 'Oxford Bookworms — Stage 2–3', author: 'Oxford', level: 'A2–B1', cover: B('oxfordbookc.jpg'), desc: 'O‘rta darajadagi hikoyalar.' },
    { id: 'penguin-readers', title: 'Penguin Readers', author: 'Pearson', level: 'A2–C1', cover: B('reading.jpg'), desc: 'Turli darajadagi moslashtirilgan hikoyalar.' },
  ],
  'general-listening': [
    { id: 'bbc-6min', title: 'BBC 6 Minute English', author: 'BBC', level: 'B1–B2', cover: B('bbc6.jpg'), desc: 'Qisqa audio va transkriptlar.' },
    { id: 'voa', title: 'VOA Learning English', author: 'VOA', level: 'A2–B2', cover: B('voa.jpg'), desc: 'Sekin va tushunarli audio.' },
    { id: 'ted', title: 'TED Talks', author: 'TED', level: 'B2–C1', cover: B('ted.jpg'), desc: 'Akademik mavzular va turli aksentlar.' },
  ],
  'general-reading': [
    { id: 'reading-explorer', title: 'Reading Explorer', author: 'National Geographic', level: 'A2–C1', cover: B('reading.jpg'), desc: 'Fan, tabiat, texnologiya va jamiyat.' },
    { id: 'cambridge-readers-gr', title: 'Cambridge English Readers', author: 'Cambridge', level: 'A2–C1', cover: B('cambridereading.jpg'), desc: 'Inglizcha matnlar va hikoyalar.' },
    { id: 'in-focus-gr', title: 'In Focus: Reading', author: 'Cambridge', level: 'B2–C1', cover: B('infocus.jpg'), desc: 'Akademik va ilmiy matnlar.' },
  ],
}

// Kitoblar bo'limi — barcha katalog kitoblari (dublikatlar olib tashlangan)
BOOK_CATALOG.kitoblar = [...new Map(
  Object.values(BOOK_CATALOG).flat().map((b) => [b.id, b]),
).values()]

export const findBook = (id) => {
  for (const [section, books] of Object.entries(BOOK_CATALOG)) {
    const book = books.find((b) => b.id === id)
    if (book) return { ...book, section }
  }
  return null
}

// Kitob ichidagi bo'limlar (har bir kitob uchun alohida)
export const BOOK_TABS = [
  { key: 'units', icon: '📑', label: 'Unitlar' },
  { key: 'passages', icon: '📖', label: 'Passage' },
  { key: 'vocabulary', icon: '🔤', label: 'Vocabulary' },
  { key: 'audio', icon: '🎧', label: 'Audio' },
  { key: 'tests', icon: '✅', label: 'Test' },
  { key: 'answers', icon: '🔑', label: 'Answer Key' },
]

// Bo'lim bo'yicha ko'nikmalar (reja asosida, haqiqiy kontent kelganda to'ldiriladi)
export const SECTION_SKILLS = {
  listening: ['Multiple choice', 'Gap filling', 'Matching', 'True / False', 'Note completion'],
  reading: ['Multiple choice', 'Matching headings', 'True / False / Not Given', 'Sentence completion', 'Gapped text'],
  writing: ['Part 1.1 — Informal', 'Part 1.2 — Formal', 'Part 2 — Essay', 'AI tekshiruvi', 'Sample answers'],
  speaking: ['Part 1 — Personal', 'Part 1.2 — Picture', 'Part 2 — Long turn', 'Part 3 — Discussion', 'Audio yozish'],
  lugat: ['Education', 'Technology', 'Environment', 'Health', 'Business', 'Travel', 'Society', 'Psychology'],
  grammatika: ['All Tenses', 'Passive Voice', 'Conditionals', 'Reported Speech', 'Relative Clauses', 'Modal Verbs', 'Inversion', 'Subjunctive'],
  stories: ['Story matni', 'Audio', 'New vocabulary', 'Comprehension', 'True / False', 'Summary writing'],
  'general-listening': ['Audio', 'Transcript', 'New words', 'Short quiz'],
  'general-reading': ['Science', 'Nature', 'History', 'Technology', 'Education', 'Space', 'Environment'],
}
