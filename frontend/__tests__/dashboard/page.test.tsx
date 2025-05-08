import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '@/lib/auth-context';
import DashboardPage from '@/app/dashboard/page';

// Mock necessary hooks and functions
jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}));

// Mock icons to avoid issues with react-icons in tests
jest.mock('react-icons/fa', () => ({
  FaFileAlt: () => 'FileIcon',
  FaGithub: () => 'GithubIcon',
  FaSearch: () => 'SearchIcon',
  FaBriefcase: () => 'BriefcaseIcon',
  FaPlus: () => 'PlusIcon',
  FaEllipsisH: () => 'EllipsisIcon',
  FaStar: () => 'StarIcon',
  FaCode: () => 'CodeIcon',
  FaChartLine: () => 'ChartIcon',
  FaCheckCircle: () => 'CheckCircleIcon',
}));

describe('DashboardPage', () => {
  const mockFetchWithAuth = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      fetchWithAuth: mockFetchWithAuth,
    });
  });

  describe('Tab Navigation', () => {
    it('should render overview tab by default', () => {
      render(<DashboardPage />);
      expect(screen.getByRole('tabpanel', { name: /overview/i })).toBeVisible();
    });

    it('should switch between tabs when clicked', () => {
      render(<DashboardPage />);
      
      // Click Resumes tab
      fireEvent.click(screen.getByRole('tab', { name: /resumes/i }));
      expect(screen.getByRole('tabpanel', { name: /resumes/i })).toBeVisible();
      
      // Click Projects tab
      fireEvent.click(screen.getByRole('tab', { name: /projects/i }));
      expect(screen.getByRole('tabpanel', { name: /projects/i })).toBeVisible();
      
      // Click back to Overview tab
      fireEvent.click(screen.getByRole('tab', { name: /overview/i }));
      expect(screen.getByRole('tabpanel', { name: /overview/i })).toBeVisible();
    });
  });

  describe('Overview Tab Content', () => {
    beforeEach(() => {
      render(<DashboardPage />);
    });

    it('should display statistics cards', () => {
      expect(screen.getByText('Resumes Created')).toBeInTheDocument();
      expect(screen.getByText('GitHub Projects')).toBeInTheDocument();
      expect(screen.getByText('Profile Strength')).toBeInTheDocument();
    });

    it('should show recent activity section', () => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText(/Created "Software Engineer - Google" resume/)).toBeInTheDocument();
      expect(screen.getByText(/Connected GitHub repository/)).toBeInTheDocument();
    });

    it('should display skills analysis section', () => {
      expect(screen.getByText('Skills Analysis')).toBeInTheDocument();
      expect(screen.getByText('Your Top Skills')).toBeInTheDocument();
      expect(screen.getByText('Skill Gaps to Fill')).toBeInTheDocument();
    });
  });

  describe('Resumes Tab Content', () => {
    beforeEach(() => {
      render(<DashboardPage />);
      fireEvent.click(screen.getByRole('tab', { name: /resumes/i }));
    });

    it('should display create new resume card', () => {
      expect(screen.getByText('Create New Resume')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should render resume cards with correct information', () => {
      expect(screen.getByText('Software Engineer - Google')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer - Meta')).toBeInTheDocument();
      expect(screen.getByText('Full Stack Engineer - Stripe')).toBeInTheDocument();
    });

    it('should display resume status badges', () => {
      const completeStatuses = screen.getAllByText('Complete');
      const draftStatuses = screen.getAllByText('Draft');
      expect(completeStatuses.length).toBeGreaterThan(0);
      expect(draftStatuses.length).toBeGreaterThan(0);
    });
  });

  describe('GitHub Projects Tab Content', () => {
    beforeEach(() => {
      render(<DashboardPage />);
      fireEvent.click(screen.getByRole('tab', { name: /projects/i }));
    });

    it('should display GitHub connection button when not connected', () => {
      expect(screen.getByText('Connect to GitHub')).toBeInTheDocument();
    });

    it('should open GitHub connection dialog when button is clicked', () => {
      fireEvent.click(screen.getByText('Connect to GitHub'));
      expect(screen.getByText('Connect GitHub Account')).toBeInTheDocument();
      expect(screen.getByLabelText('Personal Access Token')).toBeInTheDocument();
    });

    it('should display appropriate message when no projects are found', () => {
      expect(screen.getByText('Connect your GitHub account to see your projects.')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('should toggle GitHub connection dialog', () => {
      render(<DashboardPage />);
      fireEvent.click(screen.getByRole('tab', { name: /projects/i }));
      
      // Open dialog
      fireEvent.click(screen.getByText('Connect to GitHub'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Close dialog using close button
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should handle import mode toggle', async () => {
      render(<DashboardPage />);
      fireEvent.click(screen.getByRole('tab', { name: /projects/i }));
      
      const importButton = screen.getByText('Import Projects');
      fireEvent.click(importButton);
      
      await waitFor(() => {
        expect(screen.getByText('Import GitHub Projects')).toBeInTheDocument();
        expect(screen.getByText('Filter Available Projects')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message in GitHub connection dialog when token is invalid', async () => {
      render(<DashboardPage />);
      fireEvent.click(screen.getByRole('tab', { name: /projects/i }));
      fireEvent.click(screen.getByText('Connect to GitHub'));
      
      const tokenInput = screen.getByLabelText('Personal Access Token');
      fireEvent.change(tokenInput, { target: { value: 'invalid-token' } });
      
      const connectButton = screen.getByText('Connect Account');
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/The GitHub token is invalid/)).toBeInTheDocument();
      });
    });
  });
});
