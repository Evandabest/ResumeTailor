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

  it('renders the dashboard overview stats', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Resumes Created')).toBeInTheDocument();
    expect(screen.getByText('Matching Jobs')).toBeInTheDocument();
    expect(screen.getByText('Profile Strength')).toBeInTheDocument();
  });
  it('renders the recent activity section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText(/Created "Software Engineer - Google" resume/)).toBeInTheDocument();
  });

  it('renders the skills analysis section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Skills Analysis')).toBeInTheDocument();
    expect(screen.getByText('Your Top Skills')).toBeInTheDocument();
    expect(screen.getByText('Skill Gaps to Fill')).toBeInTheDocument();
  });
  
});