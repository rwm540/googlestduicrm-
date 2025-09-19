import React, { useState } from 'react';
import { User } from '../types';
import Alert from '../components/Alert';

interface LoginPageProps {
  onLogin: (user: User) => void;
  users: User[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setErrors(['نام کاربری یا رمز عبور اشتباه است.']);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" dir="rtl">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg border border-gray-200/80">
        <div className="text-center">
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex-shrink-0"></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">ورود به داشبورد CRM</h2>
            <p className="mt-2 text-sm text-gray-600">
                لطفا اطلاعات کاربری خود را وارد کنید.
            </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Alert messages={errors} onClose={() => setErrors([])} />
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                نام کاربری
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="مثلا: ali.rezaei"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                رمز عبور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
            >
              ورود
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;