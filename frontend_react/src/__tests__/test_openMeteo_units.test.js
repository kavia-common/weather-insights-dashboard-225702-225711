import { normalizeUnits, defaultUnits } from '../lib/openMeteo';

describe('normalizeUnits', () => {
  it('returns defaults when input is undefined', () => {
    const res = normalizeUnits(undefined);
    expect(res).toEqual(defaultUnits);
  });

  it('fills missing fields from defaults', () => {
    const res = normalizeUnits({ temperature: 'fahrenheit' });
    expect(res).toEqual({ temperature: 'fahrenheit', wind: defaultUnits.wind, precip: defaultUnits.precip });
  });

  it('passes through all provided fields', () => {
    const res = normalizeUnits({ temperature: 'celsius', wind: 'mph', precip: 'inch' });
    expect(res).toEqual({ temperature: 'celsius', wind: 'mph', precip: 'inch' });
  });
});
