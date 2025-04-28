"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FaFileAlt, FaGithub, FaSearch, FaBriefcase, 
  FaPlus, FaEllipsisH, FaStar, FaCode, FaChartLine,
  FaCheckCircle
} from "react-icons/fa";
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

const mockGithubProjects = [
  {
    id: 1,
    name: "personal-website",
    description: "My personal portfolio website built with React and Next.js",
    lastUpdated: "2025-03-01",
    language: "TypeScript",
    stars: 12,
    url: "https://github.com/username/personal-website"
  },
  {
    id: 2,
    name: "algorithm-visualizer",
    description: "Interactive tool to visualize various algorithms",
    lastUpdated: "2025-02-15",
    language: "JavaScript",
    stars: 45,
    url: "https://github.com/username/algorithm-visualizer"
  },
  {
    id: 3,
    name: "chat-app",
    description: "Real-time chat application using Socket.io",
    lastUpdated: "2025-01-20",
    language: "TypeScript",
    stars: 23,
    url: "https://github.com/username/chat-app"
  }
];

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
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your resume tailoring progress.</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-blue-700 hover:bg-blue-800">
          <FaPlus className="mr-2" /> New Resume
        </Button>
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
                <div className="text-2xl font-bold">{mockGithubProjects.length}</div>
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
            <h2 className="text-xl font-bold">Connected GitHub Projects</h2>
            <Button variant="outline" className="flex items-center gap-2">
              <FaGithub className="h-4 w-4" /> Connect More Repos
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockGithubProjects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaStar className="h-4 w-4 mr-1" /> {project.stars}
                    </div>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-sm">{project.language}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Updated {new Date(project.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      <FaGithub className="h-4 w-4 mr-2" /> View on GitHub
                    </a>
                  </Button>
                  <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                    Use in Resume
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}