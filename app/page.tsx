export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Marketing OS</h1>
        <p className="text-lg text-muted-foreground">
          Ứng dụng quản lý team marketing toàn diện
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Đăng nhập
          </a>
          <a
            href="/register"
            className="px-6 py-3 border border-input rounded-md hover:bg-accent transition-colors"
          >
            Đăng ký
          </a>
        </div>
      </div>
    </div>
  )
}
