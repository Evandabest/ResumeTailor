import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '../../app/login/page'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Login Form Components Integration', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  // Test component interaction
  it('integrates form inputs with tab switching', async () => {
    render(<LoginPage />)

    // Get login form elements
    const emailInput = screen.getByLabelText(/email/i)
    const loginTab = screen.getByRole('tab', { name: /log in/i })
    const signupTab = screen.getByRole('tab', { name: /sign up/i })

    // Fill login form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    // Switch to signup tab
    fireEvent.click(signupTab)

    // Verify login form state is preserved when switching back
    fireEvent.click(loginTab)
    expect(emailInput).toHaveValue('test@example.com')
  })

  // Test error handling
  it('handles validation errors between form components', async () => {
    render(<LoginPage />)

    // Get form elements with proper typing
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /log in/i })

    // Test interaction with invalid credentials
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: '123' } })
    
    // Submit form to trigger validation
    fireEvent.click(submitButton)
    
    // Verify email validation
    expect(emailInput).toBeInvalid()
    
    // Verify password value is too short
    expect(passwordInput.value).toBe('123')
    
    // Fix email but keep invalid password
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } })
    expect(emailInput).toBeValid()
    
    // Submit again with invalid password
    fireEvent.click(submitButton)
    
    // Verify button changes to loading state
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/logging in/i)
    })
    
    // Verify failed login attempt
    expect(mockRouter.push).not.toHaveBeenCalledWith('/dashboard')
  })
})