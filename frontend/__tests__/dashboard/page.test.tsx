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

  });

  describe('Overview Tab Content', () => {
    beforeEach(() => {
      render(<DashboardPage />);
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



});

