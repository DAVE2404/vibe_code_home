import { FormEvent, useEffect, useMemo, useState } from 'react';
import './App.css';
import logo from './logo.svg';

type ApiMessage = string | { id?: string | number; text?: string; [key: string]: unknown };

type FetchState = 'idle' | 'loading' | 'error' | 'success';

const parseMessages = (payload: unknown): string[] => {
  if (Array.isArray(payload)) {
    return payload.map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      const castItem = item as ApiMessage;
      if (castItem && typeof castItem === 'object') {
        const possibleText =
          (castItem as { text?: string }).text ?? (castItem as { message?: string }).message;
        if (typeof possibleText === 'string') {
          return possibleText;
        }
      }

      return JSON.stringify(item);
    });
  }

  if (payload && typeof payload === 'object' && 'items' in (payload as Record<string, unknown>)) {
    return parseMessages((payload as { items: unknown }).items);
  }

  return [];
};

function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState<FetchState>('idle');
  const [error, setError] = useState<string>('');

  const hasResults = useMemo(() => messages.length > 0, [messages]);

  const fetchMessages = async (search?: string) => {
    setStatus('loading');
    setError('');

    try {
      const endpoint = search ? `/api/messages?query=${encodeURIComponent(search)}` : '/api/messages';
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = (await response.json()) as unknown;
      setMessages(parseMessages(data));
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setMessages([]);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchMessages(query.trim());
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="App-title">Spring API 메시지 뷰어</p>
        <p className="App-subtitle">React + Express 프록시를 통해 Spring Boot API 응답을 확인하세요.</p>
      </header>

      <main className="App-main">
        <section className="card">
          <h2>메시지 검색</h2>
          <form className="query-form" onSubmit={handleSubmit}>
            <label htmlFor="query">키워드</label>
            <input
              id="query"
              name="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: hello, status 등"
            />
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? '불러오는 중...' : '불러오기'}
            </button>
          </form>
          {status === 'error' && <p className="error">오류: {error}</p>}
        </section>

        <section className="card">
          <h2>API 응답</h2>
          {status === 'loading' && <p className="muted">메시지를 불러오는 중입니다...</p>}
          {status === 'success' && !hasResults && <p className="muted">표시할 메시지가 없습니다.</p>}
          {status === 'error' && <p className="muted">다시 시도하거나 서버 상태를 확인하세요.</p>}
          <ul className="message-list">
            {messages.map((message, index) => (
              <li key={index} className="message-item">
                {message}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
