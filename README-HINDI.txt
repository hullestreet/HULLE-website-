HULLE WEBSITE — STARTER DEMO
============================

Is folder mein HULLE ka mobile-friendly starter website hai.

FILES
-----
index.html       Website ka structure
style.css        Design aur mobile responsive styling
app.js           Demo product listing, filters, product add form, creator registration
supabase-schema.sql  Future backend ke liye starter database schema

MOBILE PAR TEST KAISE KAREIN
----------------------------
1. ZIP file extract karein.
2. index.html ko browser mein kholkar preview karein. Kuch phones local HTML files ko restrict kar sakte hain.
3. Behtar preview ke liye files ko GitHub repository mein upload karke Cloudflare Pages se deploy karein.

CLOUDFLARE PAGES PAR FREE DEPLOY (STATIC SITE)
----------------------------------------------
1. github.com par account banayein / login karein.
2. New repository banayein, naam: hulle-website
3. Is ZIP ke andar ki files repository ke root mein upload karein.
   Dhyan: index.html root mein honi chahiye, kisi extra nested folder ke andar nahi.
4. pages.cloudflare.com par login karein.
5. Create a project > Connect to Git select karein.
6. Apni hulle-website repository choose karein.
7. Framework preset: None
8. Build command blank chhodein.
9. Build output directory: /
10. Deploy karein.
11. Cloudflare aapko ek *.pages.dev public link dega.

IMPORTANT — ABHI KYA WORK KARTA HAI
-----------------------------------
- Mobile-friendly HULLE storefront.
- HULLE Originals aur Affiliate Picks ke alag filters/badges.
- Demo admin form se product add karna.
- Affiliate product ke liye tracking URL field.
- Creator registration form.
- Demo products/creator entries browser ke localStorage mein save hote hain.

IMPORTANT — ABHI KYA REAL NAHI HAI
----------------------------------
Yeh pehla FRONTEND DEMO hai, live commerce backend nahi.
- Admin button abhi secure admin login nahi hai.
- Creator registration sirf usi browser/device mein save hoti hai.
- Product data sab customers ke beech sync nahi hota.
- Real referral attribution, affiliate network postbacks/SubID reporting, order tracking, commission wallet, withdrawals, payment gateway, inventory, shipping aur returns abhi connected nahi hain.
- Affiliate programme ke rules aur approved tracking links follow karein. Kisi platform ki product images/details ko permission ke bina copy na karein.
- Real customer data ya private API keys is demo mein enter na karein.

NEXT DEVELOPMENT STAGE
----------------------
1. Supabase project create karke supabase-schema.sql run karein.
2. Secure authentication and role-based access (admin/creator/customer) add karein.
3. Product/creator records ko Supabase database se connect karein.
4. Admin approval workflow, creator-specific links and attribution add karein.
5. Affiliate network APIs/postbacks ko server-side integrate karein.
6. Original brand checkout, payment, fulfilment and returns add karein.

FREE PLAN NOTE
--------------
Cloudflare Pages aur Supabase ke free tiers ki limits/policies badal sakti hain.
Custom domain optional hai; free *.pages.dev address se start kar sakte hain.
