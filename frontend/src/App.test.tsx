import { render, screen } from '@testing-library/react';
import App from './App';

test('renders title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Spring API 메시지 뷰어/i);
  expect(titleElement).toBeInTheDocument();
});
