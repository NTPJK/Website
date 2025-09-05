# The Living City — เว็บไซต์ฟรี (Cloudflare Pages + Workers)

ธีมโทน **เหลือง/ดำ/ขาว** พร้อมหน้า **สถานะ, ข่าวสาร, แกลเลอรี** และ Worker สำหรับ proxy ไปยัง `info.json` ของ FiveM

## โครงสร้าง
```
the-living-city-site/
├─ index.html            # หน้าเว็บหลัก
├─ styles.css            # โทนสี/สไตล์ (เหลือง/ดำ/ขาว)
├─ scripts/
│  └─ main.js            # โหลดสถานะ/ข่าว/แกลเลอรี
├─ data/
│  ├─ news.json          # ข่าว (แก้ไขง่าย)
│  └─ gallery.json       # ลิสต์รูปภาพ
└─ worker.js             # Cloudflare Worker: /api/status
```

## วิธี Deploy ฟรี 100%
### A) Cloudflare Pages (โฮสต์เว็บไซต์)
1. สร้าง Git repo แล้วอัปโฟลเดอร์นี้ขึ้น GitHub
2. เข้า Cloudflare → Pages → **Create project** → เชื่อมกับ repo นี้
3. Build command: ไม่ต้อง (static) • Output dir: `/`
4. กด Deploy → ได้โดเมน `*.pages.dev` (ฟรี SSL)

### B) Cloudflare Worker (API สถานะ)
1. เข้า Cloudflare → Workers → **Create Worker** → ก๊อปโค้ดใน `worker.js` ไปวาง
2. ตั้ง **Environment Variable**: `FIVEM_INFO_URL = http://<IP>:<PORT>/info.json`
3. Deploy → จะได้ URL ประมาณ `https://xxx.workers.dev/api/status`
4. กลับไปแก้ใน `index.html` ตรง
   ```html
   window.TLC = {
     STATUS_API: "https://xxx.workers.dev/api/status"
   };
   ```
5. กด Deploy ใหม่ใน Pages (หรือแก้ไฟล์แล้ว push)

> หมายเหตุ: ถ้า info.json เปิดไม่สาธารณะ ให้เปิดเฉพาะ IP ของ Worker/Proxy หรือทำ Auth ตามต้องการ

## แก้ไขเนื้อหา
- ข่าว: แก้ไฟล์ `data/news.json` (รองรับ title/date/text)
- แกลเลอรี: แก้ไฟล์ `data/gallery.json` (วางลิงก์รูปได้ เช่น Discord CDN/Imgur)
- สีหลัก: ปรับใน `styles.css` (ตัวแปร `--c-yellow`, `--c-black`, `--c-white`)

## ปูทางเติมพอยท์ (ฟรีฝั่งโฮสต์)
- ทำฟอร์มแจ้งโอนบน Pages → ส่งไป Worker → เก็บใน D1/KV (ฟรี tier)
- ทำหน้าแอดมินเรียกดู/อนุมัติ → FiveM ดึงคิวผ่าน HTTP
- ถ้าต้องการรับชำระอัตโนมัติ (บัตร/โอน): ใช้เกตเวย์ (มีค่าธรรมเนียมต่อรายการ) แต่โฮสต์ยังฟรี

## เคล็ดลับ
- รูปเยอะ/ไฟล์ใหญ่: ย้ายไปเก็บที่ Discord/Imgur/Cloudflare R2 (ฟรี tier) แล้วใส่ลิงก์ใน `gallery.json`
- ปรับโลโก้กลม: เปลี่ยน `.brand-mark` ใน CSS/HTML (ตอนนี้ใช้ตัวอักษร **LC** บนพื้นกลมสีเหลือง)

ขอให้สนุกกับเมือง **The Living City**! 🚀
