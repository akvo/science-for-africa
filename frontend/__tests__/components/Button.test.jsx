/**
 * Button Component Tests
 *
 * Example tests demonstrating React Testing Library patterns
 * for testing interactive UI components.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Example Button component for testing
// In real usage, import your actual components
const Button = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`btn btn-${variant}`}
    data-testid="button"
  >
    {children}
  </button>
);

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with children text', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders with correct test id', () => {
      render(<Button>Test</Button>);

      expect(screen.getByTestId('button')).toBeInTheDocument();
    });

    it('applies variant class correctly', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('btn-secondary');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByText('Click me'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      await user.click(screen.getByText('Disabled'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('has correct disabled attribute when disabled', () => {
      render(<Button disabled>Disabled</Button>);

      expect(screen.getByTestId('button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('is focusable when enabled', async () => {
      const user = userEvent.setup();
      render(<Button>Focusable</Button>);

      await user.tab();

      expect(screen.getByTestId('button')).toHaveFocus();
    });

    it('is not focusable when disabled', async () => {
      const user = userEvent.setup();
      render(<Button disabled>Not Focusable</Button>);

      await user.tab();

      expect(screen.getByTestId('button')).not.toHaveFocus();
    });
  });
});
