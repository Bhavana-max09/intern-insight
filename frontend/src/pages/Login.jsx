import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-indigo-600 mb-1">🎯 InternInsight</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium">Sign In</button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-4">Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline">Register</Link></p>
      </div>
    </div>
  );
}