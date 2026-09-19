# The Echoes of Wua-lai — Codex Build Prompt

สร้างเว็บ Prototype สำหรับโปรเจกต์ “The Echoes of Wua-lai” โดยใช้ UI ที่ให้มาและ Mock Data ที่มีอยู่แล้ว

## สิ่งสำคัญ
- ห้ามออกแบบ UI ใหม่
- ห้ามเปลี่ยน Visual Style
- ยึด UI/Figma เป็นต้นแบบหลัก
- รักษา layout, spacing, typography, สี, ขนาด และลำดับข้อมูลให้ใกล้เคียงต้นฉบับมากที่สุด
- เว็บเป็น Single Page
- ไม่ต้องทำ Backend
- ใช้ Mock Data ที่มีอยู่แล้ว
- ห้ามเพิ่ม Feature ที่ไม่ได้ระบุ

## Concept
นำข้อมูลกิจกรรมของชุมชนเครื่องเงินวัวลายมาแปลงเป็นเสียงดนตรี เพื่อให้เห็นและรับรู้ว่าจังหวะของวัวลายเปลี่ยนไปตามวัน เวลา สถานที่ และกิจกรรมอย่างไร

## Data
ใช้ Mock Data ที่มีอยู่แล้วใน Excel เท่านั้น
- ห้ามสร้างข้อมูลใหม่ หากมีข้อมูลอยู่แล้ว
- ตรวจสอบ Category Weight จาก Mock Data/Config
- ตรวจสอบข้อมูลใน Sheet “Sound” สำหรับ Sound Mapping

## Logic

### Active Activities
คำนวณกิจกรรมที่กำลังเกิดขึ้นจากวันที่, เวลาที่เลือก, เวลาเริ่ม/สิ้นสุดกิจกรรม และเวลาเปิด/ปิดสถานที่

### Activity Density
`Activity Density = จำนวนกิจกรรมทั้งหมดที่กำลังเกิดขึ้นในช่วงเวลาที่เลือก`

### Sound Intensity
`Sound Intensity = Σ(Activity Count × Category Weight)`

ใช้ Category Weight จาก Mock Data/Config เท่านั้น ห้ามกำหนดใหม่เองหากมีค่าอยู่แล้ว

### Sound Mapping
ใช้ข้อมูล Sound Mapping ใน Excel Sheet “Sound”
ให้แต่ละ Category มีบทบาททางดนตรีตามข้อมูลที่กำหนด

Sound Intensity ใช้ควบคุม:
- จำนวน Layer
- ความหนาแน่นของ Rhythm
- จำนวน Note/Event
- ความซับซ้อนของเสียง

## Interaction
- เปลี่ยนวัน → ข้อมูลกิจกรรมเปลี่ยน
- เปลี่ยนเวลา → Active Activities เปลี่ยน
- Map เปลี่ยนตามกิจกรรมที่กำลังเกิดขึ้น
- Active / Inactive ต้องแสดงสถานะแตกต่างกัน
- กด Activity/สถานที่ → แสดงชื่อสถานที่, หมวด, เวลาเปิด-ปิด, Activity และสถานะ
- มีการเล่น Soundscape แบบ Real-time
- Play → เริ่ม Soundscape
- Pause → หยุด Soundscape
- Activity เริ่ม → Sound Layer Fade In
- Activity จบ → Sound Layer Fade Out
- เปลี่ยนเวลา → เสียงเปลี่ยนอย่างต่อเนื่อง ไม่ตัดทันที
- มี Visual State แสดงว่า Soundscape กำลังเล่น

## Map
ใช้ไฟล์ SVG แผนที่วัวลายที่ให้มาเป็น Base Map
- ห้ามวาดแผนที่ใหม่
- ห้ามเปลี่ยน geometry
- ห้าม simplify หรือ redraw
- ใช้ SVG ที่ Export จาก Figma โดยตรง
- Activity Marker แสดงทับบน SVG
- ตำแหน่ง Activity ใช้จาก Mock Data หากมีอยู่แล้ว

## UI
ยึด UI/Figma ที่ให้มาเป็นหลัก

Visual Direction:
- Minimal
- Spacious
- เส้นแผนที่บางแต่เห็นชัด
- จุด Activity ขนาดเล็กแต่เห็นชัด
- ใช้สีอย่างจำกัด
- Typography สะอาด
- มี whitespace
- ไม่ทำเป็น Dashboard
- ไม่ใช้ Google Maps UI
- ไม่เพิ่ม Card หรือ Icon ที่ไม่จำเป็น

### Single Page Sections

#### 1. Hero / Main Experience
- The Echoes of Wua-lai
- คำอธิบายสั้น ๆ
- Interactive Map
- Day
- Time
- Active Activity Count
- Activity Legend
- Play / Pause

#### 2. Activity Interaction
กดจุดบน Map เพื่อดู:
- ชื่อสถานที่
- Category
- เวลาเปิด-ปิด
- Activity
- สถานะ Active / Inactive

ปุ่มด้านล่าง 4 ปุ่ม:
- Open / Close Sound
- Day / Night Mode
- Road
- Play / Pause Sound

#### 3. Timeline
- เปลี่ยนเวลา
- แสดงการเปลี่ยนแปลงของ Activity
- เชื่อมกับ Soundscape

#### 4. How It Works
`Activity Data → Active Activities → Activity Density → Sound Intensity → Sound`

## Sound Assets
หากยังไม่มี Sound Assets ให้หาเสียงฟรีจาก Mixkit, Pixabay หรือ Freesound ที่มี License ชัดเจน

- Craft → metal tapping / hammering
- Workshop → light / irregular tapping
- Market → crowd / footsteps
- Temple → bell / chime
- Culture → traditional percussion / instrument

ห้ามใช้ commercial music หรือเสียงที่ไม่ทราบ License
ใช้ sound elements มา Layer ตาม Activity Data ไม่ใช้เพลงสำเร็จรูป
บันทึก source + license ของทุกไฟล์ใน `SOUND_SOURCES.md`

## Technical
ก่อนเริ่ม:
1. ตรวจสอบโครงสร้างโปรเจกต์
2. ตรวจสอบ Framework
3. ตรวจสอบ Mock Data / Excel
4. ตรวจสอบไฟล์ SVG
5. ตรวจสอบ Sound Assets
6. ตรวจสอบ Category Weight
7. ใช้ Component/โครงสร้างเดิมถ้ามี
8. หลีกเลี่ยงการเขียนทับส่วนที่ไม่เกี่ยวข้อง

ไม่ต้องทำ Backend

แยกส่วนให้ชัดเจน:
- Mock Data
- Activity Calculation
- Sound Mapping
- Audio Logic
- UI Components

Audio ต้องเริ่มหลัง User Interaction เพื่อรองรับ Browser Autoplay restrictions

## ลำดับการทำงาน
1. ทำ UI ให้ตรงกับ Figma
2. เชื่อม Mock Data
3. ทำ Day / Time Interaction
4. คำนวณ Active Activities
5. คำนวณ Activity Density
6. คำนวณ Sound Intensity
7. เชื่อม Activity กับ Sound
8. ทำ Play / Pause และ Sound Transition
9. ทำ Activity Interaction
10. ทำ Responsive โดยไม่เปลี่ยน Design Direction

ทำ Desktop version ให้สมบูรณ์ก่อน ยังไม่ต้อง optimize สำหรับ Mobile แต่โครงสร้าง code ต้องรองรับ responsive ในภายหลัง

อย่าเพิ่ม Feature หรือเปลี่ยน Design เอง หากส่วนใดไม่ชัดเจน ให้ยึดจาก Figma และ Mock Data ที่ให้มาเป็นหลัก
