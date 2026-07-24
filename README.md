# Rus Tili Ustozi

Rus tili ustozining portfolio sayti va shaxsiy kabineti.

## Ishga tushirish

```bash
npm start
```

Sayt: `http://127.0.0.1:3000`

Kirish sahifasi: `http://127.0.0.1:3000/login`

Standart lokal kirish:

- Login: `ustoz`
- Parol: `admin123`

## Imkoniyatlar

- Portfolio sahifasi
- Online, offline va guruh darslari haqida bo'limlar
- Sayt orqali so'rov qoldirish va admin panelda ko'rish
- Telegram yoki SMS notification uchun tayyor backend hook
- O'quvchilar, darslar, to'lovlar va so'rovlar uchun shaxsiy kabinet

## Notification sozlamalari

Yangi so'rov kelganda SMS yuborish uchun hostingda quyidagi env qiymatlaridan birini sozlash kerak:

- `SMS_WEBHOOK_URL` va `SMS_TO`
- yoki `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `SMS_TO`

Telegram xabari uchun:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Eslatma

`data/` ichidagi lokal baza fayllari GitHubga yuborilmaydi.
