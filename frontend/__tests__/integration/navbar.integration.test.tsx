import { render, screen, fireEvent, act } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import Navbar from '@/components/navbar';

// Create a test component to set auth state
function TestWrapper({ children }: { children: React.ReactNode }) {
  const { login } = useAuth();
  return (
    <div>
      <button 
        onClick={() => login({ name: 'Test User', email: 'test@example.com' })}
        data-testid="login-trigger"
      >
        Set Auth State
      </button>
      {children}
    </div>
  );
}

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn()
}));

describe('Navbar Integration', () => {
  beforeEach(() => {
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    global.fetch = jest.fn();
  });

  // Test successful auth flow
  it('should handle auth state changes and navigation correctly', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    render(
      <AuthProvider>
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      </AuthProvider>
    );

    // Trigger login
    const loginTrigger = screen.getByTestId('login-trigger');
    await act(async () => {
      fireEvent.click(loginTrigger);
    });

    // Verify user menu is now visible
    const userButton = screen.getByLabelText('User menu');
    expect(userButton).toBeInTheDocument();

    // Test logout flow
    fireEvent.click(userButton);
    
    // Wait for dropdown to open and find sign out button
    const signOutButton = await screen.findByText('Sign out');
    
    // Mock fetch response for logout
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );

    await act(async () => {
      fireEvent.click(signOutButton);
    });

    // Verify logout redirects to login page
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  // Test initial unauthenticated state
  it('should show login/signup buttons when not authenticated', async () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    // Should show login/signup buttons
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
  });

  // Cleanup
  afterEach(() => {
    jest.resetAllMocks();
  });
});
