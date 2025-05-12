"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { 
  FaFileAlt, FaGithub, FaSearch, FaBriefcase, 
  FaPlus, FaEllipsisH, FaStar, FaCode, FaChartLine,
  FaCheckCircle
} from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Mock data - replace with actual API calls
const mockResumes = [
  { 
    id: 1, 
    title: "Software Engineer - Google", 
    lastUpdated: "2025-03-10", 
    status: "Complete", 
    matchScore: 87,
    skills: ["React", "TypeScript", "Node.js"]
  },
  { 
    id: 2, 
    title: "Frontend Developer - Meta", 
    lastUpdated: "2025-03-05", 
    status: "Draft", 
    matchScore: 72,
    skills: ["React", "CSS", "JavaScript"] 
  },
  { 
    id: 3, 
    title: "Full Stack Engineer - Stripe", 
    lastUpdated: "2025-02-28", 
    status: "Complete", 
    matchScore: 91,
    skills: ["React", "Node.js", "PostgreSQL"] 
  }
];

interface GithubProject {
  name: string;
  url: string;
  selected: boolean;
}

interface ProjectFilters {
  minStars: number;
  isArchived: boolean | null;
  include: string[];
  exclude: string[];
}

const mockJobListings = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "Airbnb",
    location: "Remote",
    matchScore: 95,
    postedDate: "2025-03-12",
    skills: ["React", "TypeScript", "CSS-in-JS"],
    appliedWith: null
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Shopify",
    location: "San Francisco, CA",
    matchScore: 88,
    postedDate: "2025-03-10",
    skills: ["React", "Node.js", "GraphQL"],
    appliedWith: 1
  },
  {
    id: 3,
    title: "Software Engineer",
    company: "Stripe",
    location: "New York, NY",
    matchScore: 82,
    postedDate: "2025-03-08",
    skills: ["JavaScript", "Python", "AWS"],
    appliedWith: null
  }
];

const mockSkillsAnalysis = {
  topSkills: ["React", "TypeScript", "Node.js", "JavaScript", "CSS"],
  skillGaps: ["GraphQL", "AWS", "Docker", "Kubernetes"],
  resumeCompleteness: 85
};

export default function DashboardPage() {
  const { fetchWithAuth } = useAuth();
  const mounted = useRef(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [githubToken, setGithubToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [githubProjects, setGithubProjects] = useState<GithubProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({
    minStars: 0,
    isArchived: false,
    include: [],
    exclude: []
  });
  const [geminiToken, setGeminiToken] = useState("");
  const [showGeminiDialog, setShowGeminiDialog] = useState(false);
  const [isImportMode, setIsImportMode] = useState(false);

  const fetchImportedProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const data = await fetchWithAuth({
        url: '/api/github/projects/view',
        method: 'GET'
      });
      setGithubProjects((data.repos || []).map((repo: { name: string; url: string }) => ({ 
        ...repo, 
        selected: false 
      })));
    } catch (error) {
      console.error('Error fetching imported projects:', error);
      setGithubProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [fetchWithAuth]);

  const fetchAvailableProjects = useCallback(async () => {
    if (!isGithubConnected) return [];
    
    try {
      const data = await fetchWithAuth({
        url: '/api/github/projects',
        method: 'POST',
        body: filters
      });
      return data.repos?.map((repo: { name: string; url: string }) => ({ 
        ...repo, 
        selected: false 
      })) || [];
    } catch (error) {
      console.error('Error fetching available projects:', error);
      return [];
    }
  }, [fetchWithAuth, filters, isGithubConnected]);

  // Function to check Gemini token before import
  const checkGeminiToken = async () => {
    const data = await fetchWithAuth({
      url: '/api/gemini/check-connection',
      method: 'GET'
    });
    return !!data.value;
  };

  // Check GitHub connection status
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const checkGithubConnection = async () => {
        try {
          const data = await fetchWithAuth({
            url: '/api/github/check-connection',
            method: 'GET'
          });
          setIsGithubConnected(!!data.value);
        } catch (error) {
          console.error('Error checking GitHub connection:', error);
          setIsGithubConnected(false);
        } finally {
          setIsLoadingProjects(false);
        }
      };
      checkGithubConnection();
    }
  }, [fetchWithAuth, mounted]);

  // Fetch projects when connected
  useEffect(() => {
    if (isGithubConnected) {
      fetchImportedProjects();
    }
  }, [isGithubConnected, fetchImportedProjects]);

  const handleImportMoreClick = async () => {
    try {
      // First get current selection state
      const selectionResponse = await fetchWithAuth({
        url: '/api/github/selection/get',
        method: 'GET'
      });
      const selectionData = selectionResponse.data || {};

      // Then fetch available projects and mark them as selected based on saved state
      const availableProjects = await fetchAvailableProjects();
      setGithubProjects(availableProjects.map((project: { name: string; url: string }) => ({
        ...project,
        selected: !!selectionData[project.name]
      })));
    } catch (error) {
      console.error('Error fetching available projects:', error);
      setError('Failed to fetch available projects');
    }
  };



  const importSelectedProjects = async () => {
    try {
      const selectedRepos = githubProjects
        .filter(project => project.selected)
        .map(project => project.name);

      if (selectedRepos.length === 0) {
        setError("Please select at least one project to import");
        return;
      }

      // First check if Gemini token is set
      const hasGemini = await checkGeminiToken();
      if (!hasGemini) {
        setShowGeminiDialog(true);
        return;
      }

      // Save selection state before import
      const selectionData = githubProjects.reduce((acc, project) => {
        acc[project.name] = project.selected;
        return acc;
      }, {} as Record<string, boolean>);

      await fetchWithAuth({
        url: '/api/github/selection/set',
        method: 'POST',
        body: { data: selectionData }
      });

      await startImport(selectedRepos);
    } catch (error) {
      console.error('Error importing projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to import projects');
    }
  };

  const setGeminiTokenAndImport = async () => {
    try {
      setIsLoading(true);
      const selectedRepos = githubProjects
        .filter(project => project.selected)
        .map(project => project.name);

      // Set Gemini token
      await fetchWithAuth({
        url: '/api/gemini/connect',
        method: 'POST',
        body: { geminiToken }
      });

      setShowGeminiDialog(false);
      await startImport(selectedRepos);
    } catch (error) {
      console.error('Error setting Gemini token:', error);
      setError(error instanceof Error ? error.message : 'Failed to set Gemini token');
    } finally {
      setIsLoading(false);
    }
  };

  const startImport = async (selectedRepos: string[]) => {
    try {
      setIsLoading(true);
      await fetchWithAuth({
        url: '/api/github/projects/import',
        method: 'POST',
        body: { repos: selectedRepos }
      });

      setError(null);
      setIsImportMode(false);
      // Fetch updated projects list
      await fetchImportedProjects();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateGitHubToken = async (token: string) => {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Invalid GitHub token');
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your resume tailoring progress.</p>
        </div>
        <Link href="/resumes/new">
          <Button className="mt-4 md:mt-0 bg-blue-700 hover:bg-blue-800">
            <FaPlus className="mr-2" /> Create New Resume
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-4 bg-gray-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resumes">Resumes</TabsTrigger>
          <TabsTrigger value="projects">GitHub Projects</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resumes Created</CardTitle>
                <FaFileAlt className="h-4 w-4 text-blue-700" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockResumes.length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {mockResumes.filter(r => r.status === "Complete").length} complete, 
                  {mockResumes.filter(r => r.status === "Draft").length} drafts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GitHub Projects</CardTitle>
                <FaGithub className="h-4 w-4 text-blue-700" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{githubProjects.length}</div>
                <p className="text-xs text-gray-500 mt-1">Connected and analyzed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Strength</CardTitle>
                <FaChartLine className="h-4 w-4 text-blue-700" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockSkillsAnalysis.resumeCompleteness}%</div>
                <Progress value={mockSkillsAnalysis.resumeCompleteness} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest resume tailoring activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 border-b pb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FaFileAlt className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Created "Software Engineer - Google" resume</p>
                    <p className="text-xs text-gray-500">March 10, 2025</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 border-b pb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FaGithub className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Connected GitHub repository "algorithm-visualizer"</p>
                    <p className="text-xs text-gray-500">February 15, 2025</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FaBriefcase className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Applied to "Full Stack Developer" at Shopify</p>
                    <p className="text-xs text-gray-500">March 10, 2025</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/activity" className="text-sm text-blue-700 hover:underline">
                  View all activity
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Skills Analysis</CardTitle>
                <CardDescription>Your top skills and skill gaps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Your Top Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockSkillsAnalysis.topSkills.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Skill Gaps to Fill</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockSkillsAnalysis.skillGaps.map((skill, i) => (
                      <Badge key={i} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/skills" className="text-sm text-blue-700 hover:underline">
                  Full skills analysis
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Resumes Tab */}
        <TabsContent value="resumes">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Create New Resume Card - Now first in the grid */}
            <Card className="border-dashed border-2 border-gray-300 flex flex-col items-center justify-center">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="rounded-full bg-blue-100 p-3 mb-4">
                  <FaPlus className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-lg font-medium mb-2">Create New Resume</h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Tailor a new resume for a specific job posting
                </p>
                <Link href="/resumes/new">
                  <Button className="bg-blue-700 hover:bg-blue-800">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Existing resumes follow */}
            {mockResumes.map((resume) => (
              <Card key={resume.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{resume.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FaEllipsisH className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>Last updated: {new Date(resume.lastUpdated).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant={resume.status === "Complete" ? "default" : "outline"}>
                      {resume.status}
                    </Badge>
                    <div className="text-sm text-right">
                      <span className="font-medium text-blue-700">{resume.matchScore}%</span> match
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/resumes/${resume.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Link href={`/resumes/${resume.id}/edit`}>
                    <Button size="sm" className="bg-blue-700 hover:bg-blue-800">Edit</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* GitHub Projects Tab */}
        <TabsContent value="projects">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {isImportMode ? "Import GitHub Projects" : "Connected GitHub Projects"}
            </h2>
          <div className="flex items-center gap-4">
              <Button
                variant="outline"
                disabled={isLoadingProjects}
                onClick={async () => {
                  setIsImportMode(!isImportMode);
                  setIsLoadingProjects(true);
                  try {
                    if (!isImportMode) {
                      await handleImportMoreClick();
                    } else {
                      await fetchImportedProjects();
                    }
                  } catch (error) {
                    console.error('Error switching modes:', error);
                  } finally {
                    setIsLoadingProjects(false);
                  }
                }}
                className="flex items-center gap-2"
              >
                {isImportMode ? "View Connected Projects" : "Import Projects"}
              </Button>
              {/* Filter Projects Dialog */}
              {isImportMode && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      disabled={isLoadingProjects}
                      className="flex items-center gap-2"
                    >
                      <FaSearch className="h-4 w-4" /> Filter Available Projects
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Filter GitHub Projects</DialogTitle>
                      <DialogDescription>
                        Set criteria for which projects to display
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="minStars">Minimum Stars</Label>
                        <Input
                          id="minStars"
                          type="number"
                          min="0"
                          value={filters.minStars}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            minStars: parseInt(e.target.value) || 0
                          }))}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="isArchived">Include Archived</Label>
                        <input
                          id="isArchived"
                          type="checkbox"
                          checked={filters.isArchived === true}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            isArchived: e.target.checked
                          }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={handleImportMoreClick}
                        disabled={isLoadingProjects}
                      >
                        Apply Filters
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* GitHub Connection Dialog */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant={isGithubConnected ? "default" : "outline"}
                    className="flex items-center gap-2"
                  >
                    <FaGithub className="h-4 w-4" />
                    {isGithubConnected ? "GitHub Connected" : "Connect to GitHub"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect GitHub Account</DialogTitle>
                    <DialogDescription>
                      Enter your GitHub personal access token to connect your repositories.
                      The token must have read access to your public repositories.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="token">Personal Access Token</Label>
                    <Input
                      id="token"
                      type="password"
                      placeholder="ghp_..."
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      You can create a new token in your{" "}
                      <a 
                        href="https://github.com/settings/tokens?type=beta" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        GitHub Settings
                      </a>
                      . Required scopes: <code>public_repo</code>
                    </p>
                    {error && (
                      <p className="text-sm text-red-500 mt-2">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    onClick={async () => {
                      try {
                        setIsLoading(true);

                        // First validate the token with GitHub API
                        const isValid = await validateGitHubToken(githubToken);
                        if (!isValid) {
                          setError("The GitHub token is invalid or doesn't have the required permissions.");
                          return;
                        }

                        // Then connect to our backend
                        const data = await fetchWithAuth({
                          url: '/api/github/connect',
                          method: 'POST',
                          body: { token: githubToken }
                        });

                        // Success - close dialog, refresh state and data
                        setGithubToken('');
                        setError(null);
                        setDialogOpen(false);
                        setIsGithubConnected(true);
                        await fetchImportedProjects();
                      } catch (error) {
                        console.error('Error connecting to GitHub:', error);
                        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? "Connecting..." : "Connect Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingProjects ? (
              <div className="col-span-full text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-700"></div>
                  <p className="mt-4 text-lg text-gray-600">
                    {isImportMode ? "Loading available projects..." : "Loading connected projects..."}
                  </p>
                </div>
              </div>
            ) : githubProjects.length === 0 && isGithubConnected ? (
              <div className="col-span-full py-8 text-center">
                <p className="text-gray-600">No projects found.</p>
              </div>
            ) : !isGithubConnected ? (
              <div className="col-span-full py-8 text-center">
                <p className="text-gray-600">Connect your GitHub account to see your projects.</p>
              </div>
            ) : githubProjects.map((project) => (
<Card key={project.name} className={isImportMode ? "" : "bg-slate-50"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FaGithub className="h-5 w-5" />
                {project.name}
              </CardTitle>
              {!isImportMode && (
                <Badge variant="outline" className="bg-white">
                  <FaCheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  Imported
                </Badge>
              )}
            </div>
            {isImportMode && (
              <input
                type="checkbox"
                checked={project.selected}
                onChange={(e) => {
                  setGithubProjects(prev => prev.map(p => 
                    p.name === project.name ? { ...p, selected: e.target.checked } : p
                  ));
                }}
                className="h-4 w-4"
              />
            )}
                </CardHeader>
          <CardFooter className="flex justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                       View on GitHub
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
      {isImportMode && githubProjects.some(p => p.selected) && (
              <div className="col-span-full mt-6 flex justify-center">
                <Button
                  onClick={importSelectedProjects}
                  disabled={isLoading || !githubProjects.some(p => p.selected)}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  {isLoading ? "Importing..." : "Import Selected Projects"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Gemini Token Dialog */}
      <Dialog open={showGeminiDialog} onOpenChange={setShowGeminiDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Gemini API Token</DialogTitle>
            <DialogDescription>
              A Gemini API token is required to analyze your GitHub projects.
              You can get one from the Google AI Studio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="gemini-token">Gemini API Token</Label>
              <Input
                id="gemini-token"
                type="password"
                placeholder="Enter your Gemini API token"
                value={geminiToken}
                onChange={(e) => setGeminiToken(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Get your API token from{" "}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={setGeminiTokenAndImport}
              disabled={isLoading || !geminiToken}
            >
              {isLoading ? "Setting up..." : "Set Token and Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
