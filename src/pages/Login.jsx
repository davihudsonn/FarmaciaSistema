import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isLoadingAuth, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Preencha e-mail e senha.');
      return;
    }

    const { error } = await signIn({ email, password });
    if (error) {
      setFormError('E-mail ou senha inválidos.');
      return;
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Entrar</h1>
        <p className="text-sm text-slate-600 mb-6">
          Acesso restrito. Digite seu e-mail e senha para continuar.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {(formError || authError) && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {formError || authError.message || 'Erro ao autenticar.'}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoadingAuth}>
            {isLoadingAuth ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
