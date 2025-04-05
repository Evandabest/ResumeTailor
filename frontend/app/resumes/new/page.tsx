"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaUpload, FaLink, FaPencilAlt } from "react-icons/fa";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Mock templates data - in a real app, fetch from API
const templates = [
  {
    id: "jake-resume",
    name: "Jake's Resume Template",
    image: "https://placehold.co/300x400/e2e8f0/1e40af?text=Jake's+Resume&font=roboto",
    category: "Modern"
  },
  {
    id: "professional-plus",
    name: "Professional Plus",
    image: "https://placehold.co/300x400/e2e8f0/1e40af?text=Professional+Plus&font=roboto",
    category: "Traditional"
  },
  {
    id: "minimal-modern",
    name: "Minimal Modern",
    image: "https://placehold.co/300x400/e2e8f0/1e40af?text=Minimal+Modern&font=roboto",
    category: "Minimal"
  },
  {
    id: "technical-edge",
    name: "Technical Edge",
    image: "https://placehold.co/300x400/e2e8f0/1e40af?text=Technical+Edge&font=roboto",
    category: "Technical"
  }
];

export default function NewResumePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [jobDetails, setJobDetails] = useState({
    title: "",
    company: "",
    description: "",
    url: "",
    location: "",
    type: "full-time",
    inputMethod: "manual"
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0].id);
  const [isLoading, setIsLoading] = useState(false);

  const handleJobInputChange = (e: any) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputMethodChange = (value: any) => {
    setJobDetails(prev => ({
      ...prev,
      inputMethod: value
    }));
  };

  const handleJobTypeChange = (value: any) => {
    setJobDetails(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleTemplateSelection = (id: any) => {
    setSelectedTemplateId(id);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCreateResume = async () => {
    setIsLoading(true);
    
    // Mock API call to create resume
    try {
      // In a real app, this would be an API request
      console.log("Creating resume with:", { jobDetails, templateId: selectedTemplateId });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response with resume ID
      const newResumeId = "resume-" + Date.now();
      
      // Redirect to edit page
      router.push(`/resumes/${newResumeId}/edit`);
    } catch (error) {
      console.error("Error creating resume:", error);
      setIsLoading(false);
    }
  };

  // Parse job description from URL or file
  const parseJobDescription = async () => {
    // This would be implemented with real parsing logic in a production app
    if (jobDetails.url) {
      setJobDetails(prev => ({
        ...prev,
        title: "Software Engineer",
        company: "Example Tech Co.",
        description: "We're looking for a Software Engineer with React and TypeScript experience...",
        location: "San Francisco, CA"
      }));
    }
  };

  // Mark if job details are filled enough to proceed
  const jobDetailsFilled = 
    jobDetails.title.trim() !== "" && 
    jobDetails.company.trim() !== "";

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Resume</h1>
        <p className="text-gray-600 mt-2">
          Tailor your resume to a specific job opportunity in just a few steps.
        </p>
      </div>

      {/* Step indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <StepIndicator 
            stepNumber={1} 
            label="Job Details" 
            isActive={currentStep === 1}
            isCompleted={currentStep > 1}
          />
          <div className="w-16 h-1 bg-gray-200">
            <div 
              className="h-1 bg-blue-700 transition-all"
              style={{ width: currentStep > 1 ? "100%" : "0%" }}
            />
          </div>
          <StepIndicator 
            stepNumber={2} 
            label="Choose Template" 
            isActive={currentStep === 2}
            isCompleted={currentStep > 2}
          />
          <div className="w-16 h-1 bg-gray-200">
            <div 
              className="h-1 bg-blue-700 transition-all"
              style={{ width: currentStep > 2 ? "100%" : "0%" }}
            />
          </div>
          <StepIndicator 
            stepNumber={3} 
            label="Review" 
            isActive={currentStep === 3}
            isCompleted={false}
          />
        </div>
      </div>

      {/* Step 1: Job Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Enter information about the job you're applying for. This helps tailor your resume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="manual" 
              value={jobDetails.inputMethod} 
              onValueChange={handleInputMethodChange}
            >
              <TabsList className="mb-6 grid grid-cols-3">
                <TabsTrigger value="manual">
                  <FaPencilAlt className="mr-2" /> Enter Manually
                </TabsTrigger>
                <TabsTrigger value="url">
                  <FaLink className="mr-2" /> From URL
                </TabsTrigger>
                <TabsTrigger value="file">
                  <FaUpload className="mr-2" /> Upload File
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title*</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g. Frontend Developer"
                        value={jobDetails.title}
                        onChange={handleJobInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company*</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="e.g. Acme Inc."
                        value={jobDetails.company}
                        onChange={handleJobInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="e.g. New York, NY or Remote"
                        value={jobDetails.location}
                        onChange={handleJobInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Job Type</Label>
                      <Select
                        value={jobDetails.type}
                        onValueChange={handleJobTypeChange}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="part-time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Copy and paste the job description here..."
                      value={jobDetails.description}
                      onChange={handleJobInputChange}
                      rows={6}
                    />
                    <p className="text-sm text-gray-500">
                      Adding the job description helps us suggest relevant skills and optimize your resume.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="url">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="url">Job Listing URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="url"
                        name="url"
                        placeholder="https://example.com/jobs/123"
                        value={jobDetails.url}
                        onChange={handleJobInputChange}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={parseJobDescription}
                        variant="outline"
                      >
                        Parse
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      We'll extract job details automatically from the listing URL.
                    </p>
                  </div>
                  
                  {jobDetails.title && (
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mt-4">
                      <h3 className="font-medium text-blue-900 mb-2">Extracted Information</h3>
                      <p><strong>Title:</strong> {jobDetails.title}</p>
                      <p><strong>Company:</strong> {jobDetails.company}</p>
                      <p><strong>Location:</strong> {jobDetails.location}</p>
                      <div className="mt-2">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-700"
                          onClick={() => handleInputMethodChange("manual")}
                        >
                          Edit manually
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="file">
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="flex justify-center">
                    <FaUpload className="text-gray-400 text-3xl mb-3" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Upload job description</h3>
                  <p className="text-gray-500 mb-4">
                    Drag and drop a PDF or screenshot of the job listing, or click to browse
                  </p>
                  <Button variant="outline">
                    Choose File
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.png"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">
                * Required fields
              </p>
            </div>
            <Button
              onClick={nextStep}
              className="bg-blue-700 hover:bg-blue-800"
              disabled={!jobDetailsFilled}
            >
              Continue <FaArrowRight className="ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Template Selection */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a Template</CardTitle>
            <CardDescription>
              Select a resume template that best matches the job and your style.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={selectedTemplateId} 
              onValueChange={handleTemplateSelection}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {templates.map(template => (
                <div key={template.id} className="relative">
                  <RadioGroupItem
                    value={template.id}
                    id={template.id}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={template.id}
                    className={`
                      block cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                      ${selectedTemplateId === template.id ? 'border-blue-700 ring-2 ring-blue-700 ring-opacity-30' : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <div className="aspect-[3/4] bg-gray-100">
                      <img
                        src={template.image}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {template.category}
                      </p>
                    </div>
                    {selectedTemplateId === template.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
            >
              Back
            </Button>
            <Button
              onClick={nextStep}
              className="bg-blue-700 hover:bg-blue-800"
            >
              Continue <FaArrowRight className="ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review and Create</CardTitle>
            <CardDescription>
              Review your selections before creating your resume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Job Details</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p><strong>Job Title:</strong> {jobDetails.title}</p>
                    <p><strong>Company:</strong> {jobDetails.company}</p>
                    {jobDetails.location && (
                      <p><strong>Location:</strong> {jobDetails.location}</p>
                    )}
                    <p><strong>Job Type:</strong> {jobDetails.type.charAt(0).toUpperCase() + jobDetails.type.slice(1)}</p>
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-700"
                    onClick={() => setCurrentStep(1)}
                  >
                    Edit job details
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Selected Template</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-24">
                      <img
                        src={templates.find(t => t.id === selectedTemplateId)?.image}
                        alt="Template Preview"
                        className="w-full rounded border border-gray-200"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{templates.find(t => t.id === selectedTemplateId)?.name}</p>
                      <p className="text-sm text-gray-500">{templates.find(t => t.id === selectedTemplateId)?.category}</p>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-700"
                    onClick={() => setCurrentStep(2)}
                  >
                    Change template
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                <h3 className="flex items-center font-medium text-blue-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Next Steps
                </h3>
                <p className="mt-2 text-blue-800">
                  After creating your resume, you'll be taken to the editor where you can:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-blue-800">
                  <li>Customize your resume content</li>
                  <li>Add or remove sections</li>
                  <li>Adjust the styling</li>
                  <li>Import your existing information</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
            >
              Back
            </Button>
            <Button
              onClick={handleCreateResume}
              className="bg-blue-700 hover:bg-blue-800"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Resume"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

// Helper component for step indicators
function StepIndicator({ stepNumber, label, isActive, isCompleted }: { stepNumber: number; label: string; isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
          ${isActive ? 'bg-blue-700 text-white' : 
            isCompleted ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'}
        `}
      >
        {stepNumber}
      </div>
      <div className="text-xs mt-1.5 text-gray-600">{label}</div>
    </div>
  );
}