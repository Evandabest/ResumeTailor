import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/navbar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}));

describe('Navbar', () => {
  // Test that navbar doesn't render on specific routes
  it('should not render on excluded paths', () => {
    const excludedPaths = ['/', '/demo', '/login'];
    
    excludedPaths.forEach(path => {
      (usePathname as jest.Mock).mockReturnValue(path);
      
      (useAuth as jest.Mock).mockReturnValue({
        isLoggedIn: false,
        userData: null,
        logout: jest.fn(),
      });

      const { container } = render(<Navbar />);
      expect(container.firstChild).toBeNull();
    });
  });

  // Test navigation links for authenticated user
  it('should render correct navigation for authenticated user', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: true,
      userData: {
        name: 'Test User',
        email: 'test@example.com'
      },
      logout: jest.fn(),
    });

    render(<Navbar />);

    // Check for authenticated user navigation links in desktop view
    const desktopNav = screen.getAllByText('Dashboard')[0];
    expect(desktopNav).toHaveClass('px-3 py-2 text-sm font-medium');
    expect(screen.getAllByText('My Resumes')[0]).toHaveClass('px-3 py-2 text-sm font-medium');
    expect(screen.getAllByText('Templates')[0]).toHaveClass('px-3 py-2 text-sm font-medium');
    
    // Check for user info
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  // Test logout functionality
  it('should handle logout correctly', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    const mockLogout = jest.fn();
    
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: true,
      userData: {
        name: 'Test User',
        email: 'test@example.com'
      },
      logout: mockLogout,
    });

    render(<Navbar />);
    
    // Open dropdown menu
    const userMenuButton = screen.getByLabelText('User menu');
    fireEvent.click(userMenuButton);
    
    // Click sign out
    const signOutButton = screen.getByText('Sign out');
    fireEvent.click(signOutButton);

    // Verify logout was called and navigation occurred
    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
