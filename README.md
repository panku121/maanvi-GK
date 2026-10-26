# मानवी GK

कक्षा 1 से 4 के लिए सामान्य ज्ञान। हर सेट में 20 सवाल हैं: भारत, उत्तर प्रदेश, बिहार और रोज़मर्रा की जान-पहचान।

गलत विकल्प पर हल्का संकेत मिलता है और सही जवाब अपने आप चमक जाता है। प्रगति इसी फ़ोन या कंप्यूटर के ब्राउज़र में बचती है। बीच में छोड़ने पर सेट वहीं से खुलता है।

नेताओं के नाम अक्टूबर 2026 के अनुसार हैं।

## चलाना

```bash
npm install
npm run dev
```

## लाइव साइट

GitHub Pages: `https://panku121.github.io/maanvi-GK/`

`main` पर पुश होते ही `.github/workflows/pages.yml` साइट बनाकर पब्लिश करता है।

## Supabase

इस ऐप के लिए Supabase की ज़रूरत नहीं है। एक बच्ची, एक डिवाइस — प्रगति `localStorage` में रहती है।

अगर आगे वही प्रगति दूसरे फ़ोन पर भी चाहिए, तब यह टेबल काफ़ी है:

```sql
create table progress (
  id uuid primary key default gen_random_uuid(),
  learner text not null default 'maanvi',
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
```

`payload` वही ऑब्जेक्ट है जो ब्राउज़र में `maanvi-gk-v1` नाम से सेव होता है।
