TARIX OLAMI — NETLIFY UCHUN TAYYOR FAYLLAR

NETLIFY'GA JOYLASH:
1. ZIP faylni kompyuteringizga yuklab oling.
2. ZIP ustiga o‘ng tugma -> Extract All / Извлечь все qilib, papkaga chiqaring.
3. https://app.netlify.com/drop sahifasini oching.
4. ZIPning o‘zini emas, ichidan chiqqan TARIX OLAMI papkasini sahifaga sudrab tashlang. Papkaning ichida index.html, style.css, data.js, script.js, netlify.toml va functions papkasi ko‘rinishi kerak.
5. Netlify sayt manzilini beradi. Shu manzilni oching.

AI BAHOLASHNI YOQISH:
1. Netlify boshqaruv panelida saytingizni oching.
2. Site configuration (yoki Site settings) -> Environment variables bo‘limiga kiring.
3. Add a variable tugmasini bosing.
4. Key: OPENAI_API_KEY
5. Value: OpenAI API kalitingizni kiriting va saqlang.
6. Deploys bo‘limidan Trigger deploy -> Deploy site qiling.
AI baholash uchun OpenAI API hisobida alohida API krediti bo‘lishi mumkin. API kalitni hech qachon saytdagi JavaScript fayliga yozmang.

TIZIM (MA'LUMOTLAR BAZASI BILAN):
- Hisoblar, savollar, natijalar va jurnal serverda (Netlify Blobs) saqlanadi. Hamma qurilmadan bir xil ko'rinadi.
- Test faqat 1 marta topshiriladi. Boshlagandan keyin chiqib ketsa ham qayta boshlab bo'lmaydi. Ustoz "Natijalar" bo'limida "Qayta ruxsat berish" tugmasi bilan ruxsat berishi mumkin.
- To'g'ri javoblar o'quvchi brauzeriga yuborilmaydi, tekshirish serverda.
- Ustoz paroli serverda tekshiriladi. Almashtirish: Netlify -> Environment variables -> TEACHER_PASSWORD (12+ belgi) va SESSION_SECRET (uzun tasodifiy matn), keyin qayta deploy.
- O'quvchilar birinchi kirishda parolni almashtiradi.
- Yangi o'quvchilar: functions/students.json fayliga qo'shiladi (login, name, cls, salt, hash).

JOYLASH: package.json ichida @netlify/blobs bor. Netlify Drop ishlamasa, loyihani GitHub'ga yuklab Netlify'ga ulang (Add new site -> Import from Git) — u paketlarni o'zi o'rnatadi.

QO'SHIMCHA:
- Telegram xabarnomasi (ixtiyoriy): Netlify -> Environment variables -> TG_TOKEN (BotFather'dan bot tokeni) va TG_CHAT (sizning chat ID). Har bir topshirilgan testda xabar keladi.
- Telefonga o'rnatish: saytni Chrome'da ochib "Bosh ekranga qo'shish" (iPhone: Safari -> Ulashish -> Bosh ekranga).
- Mavzu sozlamalari (⚙): vaqt, tasodifiy savollar soni, ochilish/yopilish vaqti, mashq rejimi.
- Ota-ona havolasi: O'quvchilar -> "Ota-ona" tugmasi. Havola faqat natijalarni ko'rsatadi (1 yil amal qiladi).
- Ko'p marta xato parol kiritilsa, TG_TOKEN/TG_CHAT sozlangan bo'lsa, Telegram'ga ogohlantirish keladi.
- Qorong'i rejim (🌙) va katta shrift (A+) sarlavhada.
