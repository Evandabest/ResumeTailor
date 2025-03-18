import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../../app/login/page'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('LoginPage', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(), // Add replace method
  }

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
    // Clear all mock calls between tests
    mockRouter.push.mockClear()
    mockRouter.replace.mockClear()
  })

  test('handleLogin sets loading state and calls router', async () => {
    render(<LoginPage />)
    
    // Fill in login form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    
    // Find and click the login button
    const submitButton = screen.getByRole('button', { name: /log in/i })
    fireEvent.click(submitButton)
    
    // Check if button is disabled during loading
    expect(submitButton).toBeDisabled()
  })

  test('successful login navigates to dashboard', async () => {
    render(<LoginPage />)
    
    // Fill in valid credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'validPassword123' },
    })
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /log in/i })
    fireEvent.click(submitButton)
    
    // Wait for and verify navigation
    await waitFor(() => {
      const wasNavigated = mockRouter.push.mock.calls.some(call => call[0] === '/dashboard') ||
                          mockRouter.replace.mock.calls.some(call => call[0] === '/dashboard')
      expect(wasNavigated).toBe(true)
    }, { timeout: 3000 })
  })

  test('shows error message for invalid email format', async () => {
    render(<LoginPage />)
    
    // Enter invalid email format
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    })
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /log in/i })
    fireEvent.click(submitButton)
    
    // Check for HTML5 validation message
    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toBeInvalid()
    
    // Verify form wasn't submitted
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
})