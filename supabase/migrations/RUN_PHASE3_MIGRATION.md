# Hướng Dẫn Run Migration Phase 3 (Calendar + Budget)

## 🚀 Chạy Migration 004

### Bước 1: Mở SQL Editor
1. Truy cập **Supabase Dashboard**
2. Chọn project **Marketing OS**
3. Vào **SQL Editor**
4. Click **New Query**

### Bước 2: Copy & Run
Copy toàn bộ nội dung file sau và paste vào editor:
`supabase/migrations/004_calendar_budget_schema.sql`

Click **Run**.

### Bước 3: Xác nhận
Kiểm tra tab **Table Editor**, bạn sẽ thấy 2 tables mới:
- `campaigns`
- `content_items`

## 📋 Schema Details

### 1. Table `campaigns`
- Quản lý các chiến dịch marketing
- Fields: `name`, `status` (draft/active/paused/completed), `budget_total`, `start/end date`

### 2. Table `content_items`
- Quản lý từng nội dung trên lịch
- Fields: `title`, `type` (post/video/...), `platform`, `status`, `scheduled_date`
- Costs: `estimated_cost`, `actual_cost` (cho Budget tracking)
