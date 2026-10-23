# Study Tracker — Angular Frontend

واجهة Angular (standalone + signals) للـ API بتاعنا. عربي/English مع RTL/LTR، دارك مود، وتصميم متجاوب للموبايل (تاب بار سفلي).

## الخصائص
- **Auth**: تسجيل دخول/حساب جديد، تغيير الباسورد، انتهاء الجلسة (401 → خروج تلقائي)، Guards بالأدوار (Student / Admin).
- **الرئيسية (Dashboard)**: نسبة الإنجاز الكلية، حالة الدروس، تقدم كل مادة، المتأخر، المراجعات المستحقة، ملخص الأسبوع، دروس قيد الدراسة.
- **المنهج**: سنة ← مادة ← فصل ← دروس. تتبع (حضرت / ذاكرت / حليت التمارين)، "تحديد الكل"، "أضف للخطة". الحالة بتيجي محسوبة من الـ API.
- **الخطة الأسبوعية**: الأسبوع من السبت للجمعة، تنقل بين الأسابيع، إضافة (درس جديد / مراجعة)، تعديل، إتمام/تراجع، حذف، شريط تقدم.
- **الإدارة (Admin)**: CRUD للسنوات والمواد والفصول والدروس، نشر/إخفاء (أرشفة)، بدون حذف نهائي.
- **الإعدادات**: اللغة، المظهر (فاتح/داكن/حسب النظام)، تغيير الباسورد، خروج.

## التشغيل
```bash
# 1) أنشئ المشروع (مرة واحدة)
ng new studytracker-web --style=scss --routing=true --ssr=false
cd studytracker-web

# 2) انسخ فوق الـ src اللي جوه الـ zip (استبدل الملفات)
#    وامسح الملفات الافتراضية اللي مش محتاجها:
rm src/app/app.html src/app/app.scss src/app/app.spec.ts

# 3) عدّل src/environments/environment.ts
#    apiUrl = نفس بورت الـ API (https profile)  مثال: https://localhost:7177

# 4) شغّل
ng serve          # http://localhost:4200
```
- لازم الـ API شغال، والـ CORS معمول له `http://localhost:4200` (موجود في appsettings).
- لو المتصفح رفض شهادة الـ HTTPS: `dotnet dev-certs https --trust`.
- للـ Production: خلّي `environment.prod.ts` فيه رابط الـ API، وضيف في `angular.json` تحت `configurations.production`:
  ```json
  "fileReplacements": [
    { "replace": "src/environments/environment.ts", "with": "src/environments/environment.prod.ts" }
  ]
  ```
  وضيف الدومين بتاع الفرونت في `Cors:AllowedOrigins` بالـ API.

## الهيكل
```
src/app/
  core/    models, api.service, auth (service + interceptor + guards), i18n, theme, toast, confirm, error mapping, year.store, utils
  i18n/    ar.ts / en.ts          (كل النصوص)
  shared/  shell (هيدر + تاب بار), icon, overlays (toasts + confirm), add-plan-dialog
  pages/   auth, dashboard, curriculum, plan, settings, admin
```
- **ترجمة رسائل الـ API**: `error.service.ts` بيحوّل رسائل الباك الإنجليزي لمفاتيح ترجمة. لو غيّرت نص رسالة في الباك، حدّث الـ regex هناك.
- **إضافة لغة/نص**: ضيف المفتاح في `ar.ts` و`en.ts`، وشغّل `node check-i18n.mjs` — بيتأكد إن كل مفتاح مستخدم موجود في اللغتين.
- **التواريخ**: الأسبوع بيتحسب بتوقيت جهاز المستخدم (السبت بداية الأسبوع)، والـ API بيحسبه بتوقيت القاهرة؛ نفس النتيجة داخل مصر.

## ملاحظات أمان
- التوكن متخزن في `localStorage` (مقبول للمشروع ده؛ البديل الأقوى Refresh Token في Cookie HttpOnly لو احتجت لاحقًا).
- الـ Guards للـ UX بس؛ الحماية الحقيقية في الـ API (Roles + StudentId من التوكن).
