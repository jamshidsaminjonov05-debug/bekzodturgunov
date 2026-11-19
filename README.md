# Multilevel C1 platforma

Bekzod Turg'unov platformasining yangilangan versiyasi. Dizayn caleb.is-a.dev uslubida: krem rangli daftar varag'i, bo'limlar navbatma-navbat **katak** va **yo'l-yo'l** fonda.

| Qism | Texnologiya |
|------|-------------|
| Backend | Python 3.12 · FastAPI · SQLAlchemy · SQLite |
| Frontend | Vite · React 19 · Tailwind CSS 4 · React Router |
| AI (Writing) | Ollama (`gemma3:12b`) |

## Ishga tushirish

Eng oddiy yo'l — loyiha papkasida `start.bat` faylini ishga tushirish. U ikkita oyna ochadi (backend va frontend).

Qo'lda ishga tushirish:

```bash
# 1) Backend (http://127.0.0.1:8000, API hujjatlari: /docs)
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
copy .env.example .env          # ADMIN_PASSWORD ni o'zgartiring!
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000

# 2) Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev

# 3) Writing AI uchun Ollama ishlab turishi kerak
ollama serve
```

Baza birinchi ishga tushganda namuna kontent bilan to'ldiriladi (`backend/app/seed.py`). Bazani tozalash uchun `backend/data/app.db` faylini o'chiring.

## Bo'limlar

- **Listening / Reading / General** — bo'limlarga bo'lingan testlar, taymer, avtomatik tekshirish, to'g'ri javoblar va izohlar. Listening'da `audio_url` berilmagan bo'lsa, brauzer transkriptni ovozli o'qib beradi.
- **Writing** — Task 1.1, 1.2 va Part 2. Ollama baholaydi: daraja, 4 ta mezon, xatolar ro'yxati va C1 darajadagi namuna varianti.
- **Speaking** — tayyorgarlik va gapirish taymeri, mikrofondan ovoz yozib qayta tinglash.
- **Lug'at / Grammatika / Stories** — flash-kartalar, qoidalar va mini testlar.
- **Musobaqa** — jonli lug'at chempionati: har bir savolga vaqt, darajaga qarab ball (xato javob uchun ball ayiriladi), Top 10 reyting, jonli voqealar. Sahifadan chiqishlar sanaladi va 3-marta chiqqanda ishtirokchi chetlatiladi.
- **Profil** — test va writing tarixi.
- **Admin** (`/admin`, parol `.env` faylida) — kontentni JSON orqali qo'shish va tahrirlash, musobaqa vaqti va savollarini sozlash, foydalanuvchilar ro'yxati.

## Kirish

Foydalanuvchi faqat ismini yozib kiradi. Token brauzerda saqlanadi. Bu soddalashtirilgan kirish: bir odam boshqa brauzerdan kirib, musobaqada qayta qatnashishi mumkin. Keyinchalik Telegram login qo'shsa bo'ladi.

## Kontent formati (admin panel)

Test (`listening`, `reading`, `general-*`):

```json
{"parts": [{"title": "Part 1", "instructions": "...", "passage": "matn", "transcript": "listening matni", "audio_url": "/audio/1.mp3",
  "questions": [
    {"id": "q1", "type": "mcq", "prompt": "?", "options": ["A","B"], "answer": "A", "explanation": "ixtiyoriy"},
    {"id": "q2", "type": "tf",  "prompt": "...", "options": ["True","False","Not Given"], "answer": "True"},
    {"id": "q3", "type": "gap", "prompt": "____", "answer": ["word", "muqobil"]}
  ]}]}
```

Admin panelda "Yangi qo'shish" tugmasi har bir bo'lim uchun tayyor shablon beradi.

## Shaxsiy rasm

`frontend/public/avatar.jpg` faylini qo'ying. Rasm bo'lmasa, "BT" belgisi ko'rsatiladi.

## Production

```bash
cd frontend && npm run build      # dist/ papkasi tayyor bo'ladi
```

`dist/` papkasini nginx orqali tarqating va `/api` so'rovlarini uvicorn'ga proxy qiling.
