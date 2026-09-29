import background from '@/assets/login_background.webp'
import { AuthHeader } from './AuthHeader'
import { LoginCard } from './LoginCard'
import { DesktopNotice } from './DesktopNotice'

export function LoginScreen() {
  return (
    <>
      {/* Login: solo móvil y tablet (táctil). Oculto en pantallas grandes con puntero fino. */}
      <div className="lg:pointer-fine:hidden">
        <div className="relative app-h flex w-full flex-col bg-[#04121f]">
          <img
            src={background}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />

          <main className="relative z-10 mx-auto my-auto flex w-full max-w-[400px] flex-col px-5 safe-y sm:px-6 md:max-w-[440px]">
            <AuthHeader />
            <div className="mt-8 w-full md:mt-11">
              <LoginCard />
            </div>
          </main>
        </div>
      </div>

      {/* Aviso: solo visible en pantallas grandes con puntero fino (escritorio/portátil). */}
      <div className="hidden lg:pointer-fine:block">
        <DesktopNotice />
      </div>
    </>
  )
}
