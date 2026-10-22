# Deraah Store

هذا المجلد هو مشروع متجر درعه فقط.

## حدود المشروع

- مجلد مشاريع Codex الموحد: `/Users/ahmadoz/Documents/CODEX-PROJECTS`
- مشروع المتجر المستقل: `/Users/ahmadoz/Documents/CODEX-PROJECTS/DERAAH APP WEB`
- مشروع نظام إدارة الموارد المستقل: `/Users/ahmadoz/Documents/CODEX-PROJECTS/ERMDERAAH-main`
- مجلد النسخ المكررة والقديمة الموحد: `/Users/ahmadoz/Documents/CODEX-PROJECT-ARCHIVE`
- النسخة القديمة المدمجة محفوظة داخل: `/Users/ahmadoz/Documents/CODEX-PROJECT-ARCHIVE/DERAAH-MIXED-ARCHIVE-KEEP`
- النسخ القديمة المكررة محفوظة داخل: `/Users/ahmadoz/Documents/CODEX-PROJECT-ARCHIVE/DERAAH-PROJECT-DUPLICATES-ARCHIVE`

لا تُنقل ملفات صفحات ERP إلى هذا المشروع، ولا تُضاف صفحات المتجر إلى مشروع ERP. نقطة التشغيل في `src/App.tsx` لا تستورد أي مكوّن من نظام إدارة الموارد. المسارات القديمة في `ChatGPT/DERAAH APP WEB` و`ERMDERAAH-main` هي روابط توافقية للمحافظة على مهام Codex المفتوحة وليست نسخًا مستقلة.

## التشغيل

```bash
npm install --legacy-peer-deps
npm run dev
```

## التحقق

```bash
npm run build
```
