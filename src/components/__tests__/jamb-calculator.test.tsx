import { render, fireEvent } from '@testing-library/react';
import { JambCalculator } from '@/components/jamb-calculator';

test('calculator basic addition works', () => {
  const { getByText, getByTestId } = render(
    <JambCalculator isOpen={true} onClose={() => {}} />
  );

  // simulate 2 + 3 =
  fireEvent.click(getByText('2'));
  fireEvent.click(getByText('+'));
  fireEvent.click(getByText('3'));
  fireEvent.click(getByText('='));

  // check that the display shows 5 using the dedicated testid
  const display = getByTestId('calculator-display');
  expect(display).toHaveTextContent('5');
});
