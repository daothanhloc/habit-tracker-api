import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

type AuthView = 'login' | 'signup'

export const AuthContainer: React.FC = () => {
  const [view, setView] = useState<AuthView>('login')

  return (
    <>
      {view === 'login' && (
        <LoginForm onSwitchToSignup={() => setView('signup')} />
      )}
      {view === 'signup' && (
        <SignupForm onSwitchToLogin={() => setView('login')} />
      )}
    </>
  )
}
