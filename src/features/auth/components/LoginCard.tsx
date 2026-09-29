import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { TextField } from '@/components/ui/TextField'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { Divider } from '@/components/ui/Divider'
import { VersionTag } from '@/components/ui/VersionTag'
import { RememberRow } from './RememberRow'
import { useLogin } from '../hooks/useLogin'
import { useAppVersion } from '../hooks/useAppVersion'
import { useSession } from '../SessionProvider'

interface FieldErrors {
  email?: string
  password?: string
}

export function LoginCard() {
  const [email, setEmail] = useState('arbitro@lpf.com')
  const [password, setPassword] = useState('123456')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  const login = useLogin()
  const version = useAppVersion()
  const { signIn } = useSession()

  function validate(): boolean {
    const next: FieldErrors = {}
    if (!email.trim()) next.email = 'Ingresa tu correo'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Correo no válido'
    if (!password) next.password = 'Ingresa tu contraseña'
    else if (password.length < 6) next.password = 'Mínimo 6 caracteres'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return
    login.mutate(
      { email, password, remember },
      {
        onError: (error) =>
          setErrors({
            email: error instanceof Error ? error.message : 'No se pudo iniciar sesión',
          }),
        onSuccess: (result) => {
          signIn(result, remember)
        },
      },
    )
  }

  return (
    <motion.form
      noValidate
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.6, ease: 'easeOut' }}
      className="w-full rounded-2xl border border-white/10 bg-gradient-to-b from-[#1e314a] to-[#081a2c] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)] md:p-8"
    >
      <div className="mb-6">
        <h2 className="text-[20px] font-bold leading-tight text-white md:text-[22px]">Iniciar sesión</h2>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
        <span className="text-[11px] text-white/50">Cuenta demo</span>
        <span className="ml-1 text-[12px] font-semibold text-white">arbitro@lpf.com</span>
        <span className="text-white/30">·</span>
        <span className="text-[12px] font-semibold text-white">123456</span>
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        <TextField
          label="Correo electrónico"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="tucorreo@lpf.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail className="h-[18px] w-[18px]" />}
        />
        <TextField
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          icon={<Lock className="h-[18px] w-[18px]" />}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="text-[#8ca0b5] transition-colors hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          }
        />
      </div>

      <div className="mt-5">
        <RememberRow checked={remember} onChange={setRemember} onForgot={() => console.info('forgot')} />
      </div>

      <div className="mt-6">
        <PrimaryButton type="submit" loading={login.isPending} disabled={login.isPending}>
          Iniciar sesión
        </PrimaryButton>
      </div>

      <div className="my-6">
        <Divider />
      </div>

      <SecondaryButton onClick={() => console.info('cuenta LPF')}>Ingresar con cuenta LPF</SecondaryButton>

      <div className="mt-7">
        <VersionTag version={version.data?.version ?? 'v1.0.0'} />
      </div>
    </motion.form>
  )
}
