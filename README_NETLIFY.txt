TARIX OLAMI — NETLIFY UCHUN TAYYOR LOYIHA

MUHIM:
- Bu loyiha Netlify Functions va Netlify Blobs ishlatadi.
- ZIPni oddiy HTML sifatida ochish server funksiyalarini ishga tushirmaydi.
- Netlify Drop/drag-and-drop statik yuklashda Functions build qilinmasligi mumkin.
- To‘liq ishlashi uchun GitHub orqali Netlify'ga import qiling.

NETLIFY'GA JOYLASH:
1. ZIPni oching.
2. GitHub'da yangi repository yarating (masalan, tarix-olami).
3. ZIP ichidagi HAMMA fayl va papkalarni repository'ning eng yuqori (root) qismiga yuklang.
   Root ichida quyidagilar ko‘rinishi shart:
   - netlify.toml
   - package.json
   - public/
   - netlify/functions/
4. Netlify → Add new site → Import an existing project → GitHub.
5. Shu repository'ni tanlang.
6. Build settings:
   - Build command: bo‘sh qoldiring
   - Publish directory: public
   - Functions directory: netlify/functions
   (netlify.toml bu sozlamalarni avtomatik belgilaydi.)
7. Deploy site tugmasini bosing. Deploy tugagach saytingiz URL manzilini oching.

USTOZ KIRISHI:
Login: Jo‘rayev Murodillo
Parol: vDniXnqpvSQnJ&75

O‘QUVCHILAR:
- Asl functions/students.json ichidagi 22 ta mavjud o‘quvchi hisobi o‘zgartirilmagan.
- Natijalar, sinflar va savollar Netlify Blobs orqali serverda saqlanadi.
- Turli qurilmalardan foydalanish uchun aynan bitta Netlify saytiga kirish kerak.

AI BAHOLASH:
- grade funksiyasi uchun OPENAI_API_KEY ixtiyoriy.
- Bu kalit bo‘lmasa, AI baholash endpointi ishlamaydi; qolgan testlar ishlashi kerak.
- Kalitni front-end JavaScript ichiga yozmang.

TEKSHIRUV:
- JavaScript fayllarida sintaksis tekshiruvi o‘tkazilsin.
- Netlify deploy tugagach Functions bo‘limida api va grade funksiyalari ko‘rinishi kerak.
