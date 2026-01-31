# Marketing OS - Team Management Application

Ứng dụng web quản lý toàn diện cho team marketing inhouse 4-6 người, được xây dựng với **Next.js 15 + Supabase + Vercel**.

## 🎯 Features (MVP - Phase 1)

- ✅ **Authentication**: Email/password login với Supabase Auth
- ✅ **Role-Based Access**: Admin vs Member permissions
- ✅ **Task Management**: Create, assign, track tasks với deadlines
- ✅ **Dashboard**: Overview của team activities và metrics
- ✅ **Done** (Phase 2-4):
  - KPI tracking theo từng vị trí
  - Content calendar (Calendar + Kanban views)
  - Budget management theo channel
  - Browser notifications + audio alerts
  - Weekly/monthly reports

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) + TypeScript |
| **UI** | Shadcn/ui + Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Deployment** | Vercel |
| **Forms** | React Hook Form + Zod |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ và npm
- Supabase account (free tier)
- Git

### Installation

1. **Clone và cài đặt dependencies**:
```bash
cd marketing-os
npm install
```

2. **Setup Supabase**:
   - Làm theo hướng dẫn trong [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Tạo file `.env.local` từ `.env.local.example`
   - Thêm Supabase credentials

3. **Run development server**:
```bash
npm run dev
```

4. **Truy cập app**:
   - Open http://localhost:3000
   - Register user đầu tiên (sẽ tự động có admin role)

## 📁 Project Structure

```
marketing-os/
├── app/
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (dashboard)/         # Main app pages
│   │   ├── dashboard/       # Overview dashboard
│   │   ├── tasks/           # Task management
│   │   └── layout.tsx       # Dashboard layout with sidebar
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # Shadcn/ui components
│   └── layout/              # Layout components (sidebar, header)
├── lib/
│   ├── supabase/            # Supabase clients & middleware
│   ├── modules/             # Feature modules (tasks, kpis, etc)
│   └── utils/               # Utilities
├── supabase/
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

## 🗄️ Database Schema (Phase 1)

### Tables

1. **profiles** - Extended user profiles với role và position
2. **tasks** - Task management với assignment và tracking

### Roles & Permissions

- **Admin (Manager)**: Full access, quản lý team, view all data
- **Member**: Own tasks, own KPIs, team-level visibility

## 📝 Development Workflow

### Making Changes

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test locally
4. Commit: `git commit -m "feat: your feature"`
5. Push: `git push origin feature/your-feature`

### Database Migrations

1. Write SQL migration in `supabase/migrations/`
2. Run trong Supabase SQL Editor
3. Test trên local
4. Document changes

## 🚢 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables trong Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

### Environment Variables

Cần thiết cho production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📚 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Chi tiết setup database
- [Implementation Plan](../brain/.../implementation_plan.md) - Roadmap đầy đủ
- [Decision Log](../brain/.../decision_log.md) - Design decisions

## 🛣️ Roadmap

- [x] **Phase 1** (Week 1-2): Auth + Dashboard + Tasks
- [x] **Phase 2** (Week 3-4): KPI System + Reports
- [x] **Phase 3** (Week 5-6): Calendar + Budget
- [x] **Phase 4** (Week 7): Notifications + Polish

## 🐛 Troubleshooting

### Common Issues

**App không start**: 
- Check `.env.local` có đúng không
- Verify Supabase credentials
- Run `npm install` lại

**Database errors**:
- Kiểm tra đã run migrations chưa
- Check RLS policies
- Verify Supabase project active

**Authentication issues**:
- Clear browser cookies
- Check Supabase Auth settings
- Verify middleware config

## 📞 Support

Nếu gặp vấn đề, check:
1. Console logs (F12 → Console)
2. Network tab (F12 → Network)
3. Supabase logs (Dashboard → Logs)

## 📄 License

Private project - All rights reserved

---

Built with ❤️ using Next.js and Supabase
