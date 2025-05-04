import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../../app/dashboard/page';

// Mock the hooks since Next.js components use hooks that won't work in tests
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}));

// Mock useState since we're using it in the component
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn().mockImplementation((initialState) => [initialState, jest.fn()])
}));

describe('DashboardPage', () => {
  it('renders the dashboard title', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
  
  it('renders the welcome message', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Welcome back!/)).toBeInTheDocument();
  });
  
  it('renders the new resume button', () => {
    render(<DashboardPage />);
    expect(screen.getByText('New Resume')).toBeInTheDocument();
  });

  it('renders the dashboard overview cards', () => {
    render(<DashboardPage />);
    const cardHeaders = screen.getAllByRole('generic').filter(el => 
      el.getAttribute('data-slot') === 'card-title'
    );
    expect(cardHeaders[0]).toHaveTextContent(/resumes created/i);
    expect(cardHeaders[1]).toHaveTextContent(/github projects/i);
    expect(cardHeaders[2]).toHaveTextContent(/profile strength/i);
  });

  it('renders tab navigation', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Resumes' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'GitHub Projects' })).toBeInTheDocument();
  });

  it('renders activity and skills sections', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Skills Analysis')).toBeInTheDocument();
  });
  
});
