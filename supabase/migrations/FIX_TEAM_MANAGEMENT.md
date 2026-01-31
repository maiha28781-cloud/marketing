# Hướng Dẫn Fix Lỗi Team Management

## ⚠️ Vấn đề
Khi admin update position/role của member, gặp lỗi:
```
Cannot execute the result to a single JSON object
```

## 🔧 Nguyên nhân
RLS policy trên table `profiles` chưa cho phép admin update profiles của members khác.

## ✅ Giải pháp - Run Migration 003

### Bước 1: Truy cập Supabase Dashboard

1. Đi tới **https://supabase.com/dashboard**
2. Chọn project **Marketing OS**
3. Click vào **SQL Editor**

### Bước 2: Chạy Migration

1. Click **"New Query"**
2. Copy toàn bộ nội dung file: `supabase/migrations/003_admin_profile_policies.sql`
3. Paste vào SQL Editor
4. Click **"Run"** (hoặc Ctrl+Enter)

### Bước 3: Verify

Sau khi chạy xong, check:
1. Vào **Table Editor** → `profiles` table
2. Tab **Policies**
3. Phải thấy 2 policies mới:
   - ✅ "Admins can update all profiles"
   - ✅ "Admins can insert profiles"

### Bước 4: Test lại

1. Refresh browser tại http://localhost:3000/team
2. Click "..." trên một member
3. Chọn "Chỉnh sửa"
4. Thay đổi Position hoặc Role
5. Click "Lưu thay đổi"
6. **Không còn lỗi!** ✅

## 📝 Note

Migration này thêm 2 policies:
- Admin có thể **update** bất kỳ profile nào
- Admin có thể **insert** profiles mới (cho tương lai)

Members vẫn chỉ update được profile của chính họ.
