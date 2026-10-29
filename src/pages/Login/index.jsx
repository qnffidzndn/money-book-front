import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!username.trim()) next.username = '아이디를 입력해주세요.';
    if (!password) next.password = '비밀번호를 입력해주세요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const res = await login(username, password);
      const { token } = res.data?.data ?? res.data ?? {};
      if (!token) throw new Error('토큰이 없습니다.');
      localStorage.setItem('token', token);
      navigate('/', { replace: true });
    } catch {
      setApiError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">가계부</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">아이디</label>
            <input
              className={`form-input${errors.username ? ' input-error' : ''}`}
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: '' })); }}
              placeholder="아이디 입력"
              autoFocus
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              className={`form-input${errors.password ? ' input-error' : ''}`}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
              placeholder="비밀번호 입력"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          {apiError && <p className="login-error">{apiError}</p>}
          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
