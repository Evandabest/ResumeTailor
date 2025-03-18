"use client";

import { useState } from "react";
import Link from "next/link";
import { FaSearch, FaFilter, FaEllipsisH, FaFilePdf, FaEdit, FaTrash, FaCopy, FaPlus } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - replace with actual API call
const mockResumes = [
  {
    id: 1,
    title: "Software Engineer - Google",
    createdAt: "2025-03-10",
    updatedAt: "2025-03-12",
    status: "Complete",
    matchScore: 87,
    template: "Modern",
    jobTitle: "Senior Software Engineer",
    company: "Google",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    thumbnailUrl: "https://placehold.co/300x400/e2e8f0/1e40af?text=Resume+1&font=roboto"
  },
  {
    id: 2,
    title: "Frontend Developer - Meta",
    createdAt: "2025-03-05",
    updatedAt: "2025-03-05",
    status: "Draft",
    matchScore: 72,
    template: "Minimal",
    jobTitle: "Frontend Developer",
    company: "Meta",
    skills: ["React", "CSS", "JavaScript", "UI/UX"],
    thumbnailUrl: "https://placehold.co/300x400/e2e8f0/1e40af?text=Resume+2&font=roboto"
  },
  {
    id: 3,
    title: "Full Stack Engineer - Stripe",
    createdAt: "2025-02-28",
    updatedAt: "2025-03-09",
    status: "Complete",
    matchScore: 91,
    template: "Professional",
    jobTitle: "Full Stack Engineer",
    company: "Stripe",
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    thumbnailUrl: "https://placehold.co/300x400/e2e8f0/1e40af?text=Resume+3&font=roboto"
  },
  {
    id: 4,
    title: "Data Scientist - Netflix",
    createdAt: "2025-02-15",
    updatedAt: "2025-02-20",
    status: "Complete",
    matchScore: 84,
    template: "Academic",
    jobTitle: "Senior Data Scientist",
    company: "Netflix",
    skills: ["Python", "Machine Learning", "SQL", "Data Visualization"],
    thumbnailUrl: "https://placehold.co/300x400/e2e8f0/1e40af?text=Resume+4&font=roboto"
  },
  {
    id: 5,
    title: "DevOps Engineer - AWS",
    createdAt: "2025-01-20",
    updatedAt: "2025-01-25",
    status: "Draft",
    matchScore: 65,
    template: "Technical",
    jobTitle: "DevOps Engineer",
    company: "Amazon Web Services",
    skills: ["Docker", "Kubernetes", "CI/CD", "Terraform"],
    thumbnailUrl: "https://placehold.co/300x400/e2e8f0/1e40af?text=Resume+5&font=roboto"
  },
];

export default function ResumesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("recent");
  
  // Filter and sort resumes
  const filteredResumes = mockResumes
    .filter(resume => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" || 
        resume.title.toLowerCase().includes(searchLower) ||
        resume.company.toLowerCase().includes(searchLower) ||
        resume.jobTitle.toLowerCase().includes(searchLower) ||
        resume.skills.some(skill => skill.toLowerCase().includes(searchLower));
      
      // Status filter
      const matchesStatus = statusFilter === "all" || 
        resume.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "recent":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "oldest":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "highest-match":
          return b.matchScore - a.matchScore;
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Resumes</h1>
          <p className="text-gray-600 mt-1">
            Manage and customize your resumes tailored to specific job opportunities.
          </p>
        </div>
        <Link href="/resumes/new">
          <Button className="mt-4 md:mt-0 bg-blue-700 hover:bg-blue-800">
            <FaPlus className="mr-2" /> Create New Resume
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search resumes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={sortOption} 
            onValueChange={setSortOption}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest-match">Highest Match</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumes Grid */}
      {filteredResumes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No resumes found matching your criteria.</p>
          {searchQuery || statusFilter !== "all" ? (
            <p className="text-gray-500 mt-2">Try changing your search or filter settings.</p>
          ) : (
            <div className="mt-4">
              <Link href="/resumes/new">
                <Button className="bg-blue-700 hover:bg-blue-800">
                  <FaPlus className="mr-2" /> Create Your First Resume
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResumes.map(resume => (
            <Card key={resume.id} className="overflow-hidden flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{resume.title}</CardTitle>
                    <CardDescription>
                      {resume.jobTitle} at {resume.company}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <FaEllipsisH className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <FaEdit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FaFilePdf className="mr-2 h-4 w-4" /> Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FaCopy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <FaTrash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="aspect-[3/4] bg-gray-100 rounded-md overflow-hidden mb-4">
                  <img 
                    src={resume.thumbnailUrl} 
                    alt={`Preview of ${resume.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant={resume.status === "Complete" ? "default" : "outline"}>
                    {resume.status}
                  </Badge>
                  <div className="text-sm">
                    <span className={`font-medium ${
                      resume.matchScore > 85 ? "text-green-600" : 
                      resume.matchScore > 70 ? "text-blue-700" : "text-amber-600"
                    }`}>
                      {resume.matchScore}% Match
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Template: {resume.template}</div>
                  <div className="text-sm text-gray-500">Updated: {formatDate(resume.updatedAt)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Key Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-6 border-t mt-auto">
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
      )}
    </div>
  );
}