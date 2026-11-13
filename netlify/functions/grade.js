exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Faqat POST so‘rovi' }) };
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { statusCode: 503, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Netlify Environment Variables ichida OPENAI_API_KEY kiritilmagan.' }) };
  try {
    const { question, answer, topic } = JSON.parse(event.body || '{}');
    const prompt = `Sen o‘zbek tilidagi tarix fani o‘qituvchisi yordamchisisan. O‘quvchi javobini tarixiy mazmuniga qarab tekshir.\nSavol: ${String(question || '').slice(0,3000)}\nMavzu: ${String(topic || '').slice(0,300)}\nO‘quvchi javobi: ${String(answer || '(javob berilmagan)').slice(0,5000)}\n0 dan 5 gacha butun ball ber: 0=javob yo‘q yoki butunlay xato, 1-2=qisman noto‘g‘ri, 3=qisman to‘g‘ri, 4=deyarli to‘g‘ri, 5=to‘g‘ri va mazmunli. Faqat JSON qaytar: {"score":0,"comment":"qisqa izoh o‘zbekcha"}. Javob yo‘q bo‘lsa 0 ber.`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: 'Faqat to‘g‘ri JSON qaytar.' }, { role: 'user', content: prompt }], temperature: 0.1 })
    });
    const data = await response.json();
    if (!response.ok) return { statusCode: 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: data.error?.message || 'AI xizmatida xatolik' }) };
    const raw = (data.choices?.[0]?.message?.content || '{}').replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score: Math.max(0, Math.min(5, Math.round(Number(result.score) || 0))), comment: String(result.comment || '') }) };
  } catch (error) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Javobni tekshirishda xatolik yuz berdi.' }) };
  }
};
