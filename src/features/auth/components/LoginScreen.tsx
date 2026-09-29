import background from '@/assets/login_background.webp'
import { AuthHeader } from './AuthHeader'
import { LoginCard } from './LoginCard'

export function LoginScreen() {
  return (
    <div className="relative min-h-screen w-full bg-[#04121f]">
      <img
        src={background}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 h-full w-full object-cover"
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[400px] flex-col items-center justify-center px-6 py-12">
        <AuthHeader />
        <div className="mt-12 w-full">
          <LoginCard />
        </div>
      </main>
    </div>
  )
}
