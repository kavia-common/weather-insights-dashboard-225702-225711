import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Weather Dashboard header elements without CRA placeholder', () => {
  render(<App />);
  // The app renders Home which has brand text "Weather Dashboard"
  const brand = screen.getByText(/Weather Dashboard/i);
  expect(brand).toBeInTheDocument();

  // Ensure CRA default placeholder doesn't exist anymore
  const cra = screen.queryByText(/learn react/i);
  expect(cra).not.toBeInTheDocument();
});
