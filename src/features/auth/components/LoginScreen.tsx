import background from '@/assets/login_background.webp'
import { PwaDebugResetButton } from '@/features/pwa/components/PwaDebugResetButton'
import { AuthHeader } from './AuthHeader'
import { LoginCard } from './LoginCard'

interface LoginScreenProps {
  role?: 'arbitro' | 'comisionado'
}

export function LoginScreen({ role = 'arbitro' }: LoginScreenProps) {
  return (
    <div className="relative app-h flex w-full flex-col bg-[#04121f]">
      <img
        src={background}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />

      <main className="relative z-10 mx-auto my-auto flex w-full max-w-[400px] flex-col px-5 safe-y sm:px-6 md:max-w-[440px]">
        <AuthHeader role={role} />
        <div className="mt-8 w-full md:mt-11">
          <LoginCard role={role} />
        </div>
        <PwaDebugResetButton />
      </main>
    </div>
  )
}
