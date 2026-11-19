"""Sample (namuna) content inserted into an empty database.
Replace or extend it from the admin panel."""
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from .db import Contest, Lesson, Test

TESTS = [
    {
        "kind": "reading", "title": "Reading Mock #1 — City Gardens", "level": "B2", "minutes": 30,
        "data": {"parts": [
            {
                "title": "Part 1 — Gap filling",
                "instructions": "Read the text and fill each gap with ONE word.",
                "passage": "Urban gardens are becoming increasingly popular in large cities. Many people who live in "
                           "apartments have no space of their (1) ____, so they rent small plots in community gardens. "
                           "These gardens not only provide fresh vegetables but also bring (2) ____ together. "
                           "Researchers say that spending time outdoors can (3) ____ stress and improve mood.",
                "questions": [
                    {"id": "r1-1", "type": "gap", "prompt": "(1)", "answer": ["own"]},
                    {"id": "r1-2", "type": "gap", "prompt": "(2)", "answer": ["people", "neighbours", "neighbors", "communities"]},
                    {"id": "r1-3", "type": "gap", "prompt": "(3)", "answer": ["reduce", "lower", "decrease"]},
                ],
            },
            {
                "title": "Part 2 — True / False / Not Given",
                "instructions": "Decide whether each statement agrees with the text.",
                "passage": "The first community garden in the city opened in 1998 on an empty car park. At first, local "
                           "authorities were sceptical, but within five years more than forty gardens had appeared. "
                           "Today, the city council provides free water to every registered garden, although gardeners "
                           "must pay a small annual fee for tools and seeds.",
                "questions": [
                    {"id": "r2-1", "type": "tf", "prompt": "The first garden was built on a former car park.",
                     "options": ["True", "False", "Not Given"], "answer": "True"},
                    {"id": "r2-2", "type": "tf", "prompt": "The authorities supported the idea from the beginning.",
                     "options": ["True", "False", "Not Given"], "answer": "False",
                     "explanation": "Matnda 'sceptical' — ya'ni dastlab shubha bilan qarashgan."},
                    {"id": "r2-3", "type": "tf", "prompt": "Gardeners receive free seeds every year.",
                     "options": ["True", "False", "Not Given"], "answer": "False",
                     "explanation": "Urug' va asboblar uchun yillik to'lov bor."},
                    {"id": "r2-4", "type": "tf", "prompt": "Most gardeners are retired people.",
                     "options": ["True", "False", "Not Given"], "answer": "Not Given"},
                ],
            },
            {
                "title": "Part 3 — Multiple choice",
                "instructions": "Choose the correct answer.",
                "passage": "Critics argue that community gardens occupy land that could be used for much-needed housing. "
                           "Supporters reply that green spaces raise property values and that a city without them "
                           "becomes less attractive to young professionals.",
                "questions": [
                    {"id": "r3-1", "type": "mcq", "prompt": "What is the critics' main concern?",
                     "options": ["Gardens are too expensive", "Land could be used for homes",
                                 "Gardens attract young people", "Property values fall"],
                     "answer": "Land could be used for homes"},
                    {"id": "r3-2", "type": "mcq", "prompt": "According to supporters, green spaces…",
                     "options": ["reduce rents", "make cities less attractive", "increase property values",
                                 "replace housing"],
                     "answer": "increase property values"},
                ],
            },
        ]},
    },
    {
        "kind": "listening", "title": "Listening Mock #1 — At the library", "level": "B2", "minutes": 20,
        "data": {"parts": [
            {
                "title": "Part 1 — Short conversations",
                "instructions": "Listen and choose the correct answer. (Audio yo'q bo'lsa, 'Tinglash' tugmasi matnni ovozli o'qiydi.)",
                "transcript": "Woman: Hi, I'd like to renew these two books, please. Man: Sure. Your library card? "
                              "Woman: Here it is. Man: Thanks. They're now due back on the fourteenth of March. "
                              "Woman: Great. And is the reading room open on Sunday? Man: Only in the afternoon, "
                              "from two until six.",
                "questions": [
                    {"id": "l1-1", "type": "mcq", "prompt": "How many books does the woman renew?",
                     "options": ["One", "Two", "Three"], "answer": "Two"},
                    {"id": "l1-2", "type": "mcq", "prompt": "When are the books due back?",
                     "options": ["4 March", "14 March", "40 March"], "answer": "14 March"},
                    {"id": "l1-3", "type": "gap", "prompt": "On Sunday the reading room closes at ____ o'clock.",
                     "answer": ["six", "6"]},
                ],
            },
            {
                "title": "Part 2 — Note completion",
                "instructions": "Complete the notes with ONE word or a number.",
                "transcript": "Welcome to the city museum tour. The tour lasts about ninety minutes. Please leave large "
                              "bags in the cloakroom on the ground floor. Photography is allowed, but you must not use a "
                              "flash. Our café on the top floor offers a ten percent discount to visitors with a ticket.",
                "questions": [
                    {"id": "l2-1", "type": "gap", "prompt": "Tour length: ____ minutes", "answer": ["ninety", "90"]},
                    {"id": "l2-2", "type": "gap", "prompt": "Large bags go to the ____", "answer": ["cloakroom"]},
                    {"id": "l2-3", "type": "gap", "prompt": "Do not use a ____", "answer": ["flash"]},
                    {"id": "l2-4", "type": "gap", "prompt": "Café discount: ____ %", "answer": ["ten", "10"]},
                ],
            },
        ]},
    },
    {
        "kind": "general-reading", "title": "A2 — My morning", "level": "A2", "minutes": 10,
        "data": {"parts": [{
            "title": "Short text", "instructions": "Read and answer.",
            "passage": "Every morning I wake up at seven o'clock. I drink a cup of tea and eat bread with cheese. "
                       "Then I walk to school with my sister. It takes fifteen minutes.",
            "questions": [
                {"id": "g1", "type": "mcq", "prompt": "What does the writer drink?",
                 "options": ["Coffee", "Tea", "Milk"], "answer": "Tea"},
                {"id": "g2", "type": "gap", "prompt": "The walk takes ____ minutes.", "answer": ["fifteen", "15"]},
            ],
        }]},
    },
    {
        "kind": "general-listening", "title": "B1 — Weekend plans", "level": "B1", "minutes": 10,
        "data": {"parts": [{
            "title": "Dialogue", "instructions": "Listen and answer.",
            "transcript": "A: Are you free on Saturday? B: In the morning I have a football match, but I'm free after "
                          "lunch. A: Let's go to the cinema at four, then. B: Perfect, see you there.",
            "questions": [
                {"id": "gl1", "type": "mcq", "prompt": "What does B do on Saturday morning?",
                 "options": ["Goes to the cinema", "Plays football", "Has lunch"], "answer": "Plays football"},
                {"id": "gl2", "type": "gap", "prompt": "They meet at ____ o'clock.", "answer": ["four", "4"]},
            ],
        }]},
    },
]

LESSONS = [
    {"kind": "vocab", "title": "Environment", "level": "B2", "data": {
        "summary": "Atrof-muhit mavzusidagi 8 ta muhim so'z",
        "words": [
            {"word": "pollution", "meaning": "ifloslanish", "example": "Air pollution is a serious problem in big cities."},
            {"word": "renewable", "meaning": "qayta tiklanadigan", "example": "Solar power is a renewable source of energy."},
            {"word": "deforestation", "meaning": "o'rmonlarning kesilishi", "example": "Deforestation destroys animal habitats."},
            {"word": "emission", "meaning": "chiqindi (gaz) chiqishi", "example": "Cars produce harmful emissions."},
            {"word": "sustainable", "meaning": "barqaror", "example": "We need a more sustainable way of living."},
            {"word": "drought", "meaning": "qurg'oqchilik", "example": "The drought lasted for two years."},
            {"word": "endangered", "meaning": "yo'qolib ketish xavfidagi", "example": "Snow leopards are an endangered species."},
            {"word": "recycle", "meaning": "qayta ishlash", "example": "Please recycle plastic bottles."},
        ]}},
    {"kind": "vocab", "title": "Education", "level": "B1", "data": {
        "summary": "Ta'lim mavzusidagi so'zlar",
        "words": [
            {"word": "curriculum", "meaning": "o'quv dasturi", "example": "Coding is now part of the school curriculum."},
            {"word": "tuition", "meaning": "o'qish to'lovi", "example": "University tuition is expensive."},
            {"word": "graduate", "meaning": "bitiruvchi; bitirmoq", "example": "She graduated in 2024."},
            {"word": "scholarship", "meaning": "grant, stipendiya", "example": "He won a full scholarship."},
            {"word": "assignment", "meaning": "topshiriq", "example": "The assignment is due on Friday."},
        ]}},
    {"kind": "grammar", "title": "Present Perfect vs Past Simple", "level": "B1", "data": {
        "summary": "Qachon have done, qachon did ishlatiladi",
        "rule": "Present Perfect (have/has + V3) — natija hozirga ta'sir qilganda yoki vaqt aniq aytilmaganda ishlatiladi.\n"
                "Past Simple (V2) — o'tmishdagi aniq vaqtda tugagan ish uchun ishlatiladi (yesterday, in 2020, last week).",
        "examples": ["I have lost my keys. (hozir ham yo'q)", "I lost my keys yesterday. (aniq vaqt)",
                     "She has visited London three times.", "She visited London in 2019."],
        "exercises": [
            {"prompt": "I ____ (see) this film last night.", "options": ["have seen", "saw"], "answer": "saw"},
            {"prompt": "We ____ (never / be) to Japan.", "options": ["have never been", "never were"], "answer": "have never been"},
            {"prompt": "He ____ (finish) his homework. Now he can play.", "options": ["has finished", "finished"], "answer": "has finished"},
            {"prompt": "They ____ (move) to Tashkent in 2018.", "options": ["have moved", "moved"], "answer": "moved"},
        ]}},
    {"kind": "grammar", "title": "Conditionals (0, 1, 2, 3)", "level": "B2", "data": {
        "summary": "Shart gaplarning 4 turi",
        "rule": "Zero: If + Present, Present — umumiy haqiqat.\nFirst: If + Present, will + V — real kelajak.\n"
                "Second: If + Past, would + V — hozirgi xayoliy holat.\nThird: If + Past Perfect, would have + V3 — o'tmishdagi xayoliy holat.",
        "examples": ["If you heat ice, it melts.", "If it rains, I will stay home.",
                     "If I had more time, I would learn Spanish.", "If she had studied, she would have passed."],
        "exercises": [
            {"prompt": "If I ____ rich, I would travel the world.", "options": ["am", "were", "will be"], "answer": "were"},
            {"prompt": "If you mix red and blue, you ____ purple.", "options": ["get", "would get", "got"], "answer": "get"},
            {"prompt": "If he had left earlier, he ____ the train.", "options": ["would catch", "will catch", "would have caught"], "answer": "would have caught"},
        ]}},
    {"kind": "stories", "title": "The Lost Umbrella", "level": "A2", "data": {
        "summary": "Qisqa A2 hikoya va savollar",
        "text": "Anna left her red umbrella on the bus. The next day it was raining, and she was sad. "
                "At the bus stop, an old man smiled and gave her a red umbrella. 'I think this is yours,' he said. "
                "He was the bus driver. Anna was very happy and thanked him.",
        "glossary": [{"word": "left", "meaning": "qoldirib ketdi"}, {"word": "thanked", "meaning": "minnatdorchilik bildirdi"}],
        "questions": [
            {"prompt": "Where did Anna leave her umbrella?", "options": ["At school", "On the bus", "At home"], "answer": "On the bus"},
            {"prompt": "Who was the old man?", "options": ["Her grandfather", "A teacher", "The bus driver"], "answer": "The bus driver"},
        ]}},
    {"kind": "stories", "title": "A Second Chance", "level": "B2", "data": {
        "summary": "B2 darajadagi hikoya",
        "text": "When Malik failed his driving test for the third time, he seriously considered giving up. "
                "His instructor, however, pointed out that every attempt had been better than the last. "
                "'You're not failing,' she said, 'you're getting closer.' Two months later, Malik passed with "
                "only one minor mistake — and he never forgot the difference a single sentence had made.",
        "glossary": [{"word": "consider", "meaning": "o'ylab ko'rmoq"}, {"word": "minor", "meaning": "kichik, ahamiyatsiz"}],
        "questions": [
            {"prompt": "How many times had Malik failed?", "options": ["Twice", "Three times", "Four times"], "answer": "Three times"},
            {"prompt": "What changed Malik's mind?", "options": ["A new car", "His instructor's words", "A cheaper test"], "answer": "His instructor's words"},
        ]}},
    {"kind": "speaking", "title": "Part 1.1 — About you", "level": "B1", "data": {
        "summary": "Shaxsiy savollar, har biriga 30 soniya",
        "part": "1.1", "prep_seconds": 5, "answer_seconds": 30,
        "questions": ["Where do you live?", "What do you usually do at the weekend?", "Do you prefer mornings or evenings? Why?"],
        "tips": ["Javobni 2-3 gapda kengaytiring", "Because / for example so'zlaridan foydalaning"]}},
    {"kind": "speaking", "title": "Part 2 — Describe a place", "level": "B2", "data": {
        "summary": "1 daqiqa tayyorgarlik, 2 daqiqa gapirish",
        "part": "2", "prep_seconds": 60, "answer_seconds": 120,
        "questions": ["Describe a place in your city that you like to visit. Say where it is, what you do there, and why you like it."],
        "tips": ["Kirish – asosiy qism – xulosa tartibida gapiring", "Sifatlar va o'tgan zamondan foydalaning"]}},
    {"kind": "speaking", "title": "Part 3 — Technology debate", "level": "C1", "data": {
        "summary": "Fikr-mulohaza: ijobiy va salbiy tomonlar",
        "part": "3", "prep_seconds": 60, "answer_seconds": 120,
        "questions": ["Some people think technology makes people less social. Discuss both advantages and disadvantages."],
        "tips": ["On the one hand… On the other hand…", "Shaxsiy fikringizni oxirida aniq ayting"]}},
    {"kind": "writing", "title": "Task 1.1 — Letter to a friend", "level": "B1", "data": {
        "summary": "Do'stga norasmiy xat, ~50 so'z",
        "task_type": "1.1", "min_words": 50,
        "prompt": "You recently joined a sports club. Write a letter to your friend. Tell them what club you joined, "
                  "why you chose it and invite them to join you.",
        "tips": ["Hi / Dear … bilan boshlang", "Norasmiy uslub: contractions (I'm, it's)"]}},
    {"kind": "writing", "title": "Task 1.2 — Complaint to the manager", "level": "B2", "data": {
        "summary": "Rasmiy xat, 120–150 so'z",
        "task_type": "1.2", "min_words": 120,
        "prompt": "You joined the same sports club, but the equipment is often broken and classes start late. "
                  "Write a letter to the club manager. Describe the problems and say what you want them to do.",
        "tips": ["Dear Sir or Madam, … Yours faithfully", "Rasmiy uslub, contractions ishlatmang"]}},
    {"kind": "writing", "title": "Part 2 — Online learning essay", "level": "C1", "data": {
        "summary": "Esse, 180–200 so'z",
        "task_type": "2", "min_words": 180,
        "prompt": "Some people believe that online learning will soon replace traditional schools. "
                  "To what extent do you agree or disagree? Give reasons and examples.",
        "tips": ["Kirish – 2 ta asosiy paragraf – xulosa", "Linking words: Moreover, Nevertheless, Consequently"]}},
]

CONTEST_QUESTIONS = [
    {"word": "reluctant", "options": ["istamaydigan", "shoshqaloq", "xursand", "qo'rqoq"], "answer": 0, "level": "B2"},
    {"word": "ubiquitous", "options": ["kamyob", "hamma joyda uchraydigan", "qadimiy", "zararli"], "answer": 1, "level": "C2"},
    {"word": "borrow", "options": ["qarz bermoq", "sotmoq", "qarzga olmoq", "yashirmoq"], "answer": 2, "level": "A2"},
    {"word": "take after", "options": ["kuzatmoq", "o'xshamoq (ota-onaga)", "olib ketmoq", "yetib olmoq"], "answer": 1, "level": "B2"},
    {"word": "meticulous", "options": ["sinchkov, puxta", "beparvo", "tez", "jahldor"], "answer": 0, "level": "C1"},
    {"word": "a piece of cake", "options": ["shirinlik", "juda oson", "kichik qism", "omad"], "answer": 1, "level": "B1"},
    {"word": "commute", "options": ["muloqot qilmoq", "ishga qatnamoq", "hisoblamoq", "o'zgartirmoq"], "answer": 1, "level": "B1"},
    {"word": "make ends meet", "options": ["ishni tugatmoq", "uchrashmoq", "kun kechirmoq (pul yetkazmoq)", "yarashmoq"], "answer": 2, "level": "C1"},
    {"word": "cheap", "options": ["arzon", "qimmat", "chiroyli", "katta"], "answer": 0, "level": "A2"},
    {"word": "heavy rain", "options": ["kuchli yomg'ir", "og'ir yuk", "qor", "shamol"], "answer": 0, "level": "B1"},
    {"word": "ephemeral", "options": ["abadiy", "qisqa muddatli", "ulkan", "sirli"], "answer": 1, "level": "C2"},
    {"word": "thrive", "options": ["gullab-yashnamoq", "tashlab ketmoq", "o'g'irlamoq", "kechikmoq"], "answer": 0, "level": "C1"},
]


def _next_tashkent_16(now: datetime) -> datetime:
    """Next 16:00 Asia/Tashkent (UTC+5) as naive UTC."""
    target = now.replace(hour=11, minute=0, second=0, microsecond=0)
    return target if target > now else target + timedelta(days=1)


def seed(db: Session):
    if not db.query(Test).first():
        db.add_all(Test(**t) for t in TESTS)
    if not db.query(Lesson).first():
        db.add_all(Lesson(**l) for l in LESSONS)
    if not db.query(Contest).first():
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        db.add(Contest(
            title="Lug'at Chempionati", prize="1-o'rin uchun pul mukofoti 300 000 so'm",
            starts_at=_next_tashkent_16(now), join_minutes=30, duration_minutes=60,
            seconds_per_question=12, questions=CONTEST_QUESTIONS,
        ))
    db.commit()
