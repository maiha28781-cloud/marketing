# Hướng Dẫn Chạy Migration KPI (002_kpi_schema.sql)

## Bước 1: Truy cập Supabase Dashboard

1. Đi tới **https://supabase.com/dashboard**
2. Chọn project **Marketing OS** của bạn
3. Click vào **SQL Editor** ở sidebar bên trái

## Bước 2: Tạo Migration Mới

1. Click nút **"New Query"**
2. Copy toàn bộ nội dung file `supabase/migrations/002_kpi_schema.sql`
3. Paste vào SQL Editor

## Bước 3: Chạy Migration

1. Click nút **"Run"** (hoặc nhấn Ctrl+Enter)
2. Chờ ~5 giây để migration chạy xong
3. Kiểm tra kết quả:
   - **Success**: Nhìn thấy thông báo "Success. No rows returned"
   - **Error**: Nếu có lỗi, copy error message và forward cho tôi

## Bước 4: Kiểm Tra Tables Đã Tạo

1. Click vào **Table Editor** ở sidebar
2. Bạn phải thấy 2 tables mới:
   - `kpis` - Chứa KPI data
   - `kpi_history` - Lịch sử cập nhật KPI

## Bước 5: Kiểm Tra RLS Policies

1. Click vào table `kpis`
2. Tab **Policies** phải hiển thị 6 policies:
   - Users can view own KPIs
   - Admins can view all KPIs
   - Only admins can create KPIs
   - Admins can update all KPIs
   - Users can update own KPI progress
   - Only admins can delete KPIs

## ✅ Hoàn Tất!

Sau khi migration thành công:
1. Refresh lại browser tại http://localhost:3000/kpis
2. Admin có thể tạo KPI mới
3. Members có thể xem và update progress của KPI riêng

## 🐛 Troubleshooting

**Lỗi: "relation public.kpis already exists"**
→ Table đã tồn tại, không cần chạy lại migration

**Lỗi: "column does not exist"**
→ Có thể migration chưa chạy hết, thử xóa tables và chạy lại

**Cần xóa tables để chạy lại:**
```sql
DROP TABLE IF EXISTS public.kpi_history CASCADE;
DROP TABLE IF EXISTS public.kpis CASCADE;
```

Sau đó chạy lại migration 002_kpi_schema.sql
