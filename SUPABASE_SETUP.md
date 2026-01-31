# Supabase Setup Guide

## 1. Tạo Supabase Project

1. Truy cập https://supabase.com
2. Đăng ký/Đăng nhập tài khoản
3. Click "New Project"
4. Chọn organization hoặc tạo mới
5. Điền thông tin project:
   - **Name**: marketing-os (hoặc tên bạn thích)
   - **Database Password**: Tạo mật khẩu mạnh (lưu lại)
   - **Region**: Southeast Asia (Singapore) - gần VN nhất
   - **Pricing Plan**: Free tier

6. Click "Create new project" - đợi ~2 phút để khởi tạo

## 2. Lấy API Keys

1. Trong project dashboard, vào **Settings** (icon bánh răng bên trái)
2. Click **API** trong menu Settings
3. Bạn sẽ thấy:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (key dài)
   - **service_role key**: `eyJhbGc...` (key dài khác - click "Reveal" để xem)

4. Copy 3 giá trị này

## 3. Cấu Hình Environment Variables

1. Trong project folder `marketing-os`, tạo file `.env.local` (copy từ `.env.local.example`)
2. Paste các giá trị vừa copy:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_service_role_key
```

## 4. Chạy Database Migrations

1. Trong Supabase dashboard, click **SQL Editor** (bên trái)
2. Click **New query**
3. Copy toàn bộ nội dung file `supabase/migrations/001_initial_schema.sql`
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)
6. Kiểm tra kết quả - phải thấy "Success. No rows returned"

## 5. Enable Realtime (Optional - cho Phase 4)

1. Vào **Database** → **Replication**
2. Tìm table `tasks`, `kpis`, `notifications`
3. Toggle "Realtime" ON cho từng table

## 6. Verify Setup

Chạy command để test connection:

```bash
npm run dev
```

Nếu app start thành công là OK!

## Troubleshooting

### Lỗi "Invalid API key"
- Kiểm tra lại `.env.local` đã đúng format chưa
- Đảm bảo không có khoảng trắng thừa
- Restart dev server sau khi thay đổi `.env.local`

### Lỗi "Failed to fetch"
- Kiểm tra Project URL có đúng không
- Kiểm tra internet connection
- Kiểm tra Supabase project có đang active không

### Lỗi RLS Policy
- Đảm bảo đã chạy migration SQL đầy đủ
- Kiểm tra RLS policies ở Database → Policies

## Next Steps

Sau khi setup xong, bạn có thể:
1. Chạy `npm run dev`
2. Truy cập http://localhost:3000
3. Test register/login

Nếu gặp lỗi, liên hệ để tôi hỗ trợ!
