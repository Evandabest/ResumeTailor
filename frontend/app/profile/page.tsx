"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FaUser, 
  FaEnvelope, 
  FaLinkedin, 
  FaGithub, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaBriefcase,
  FaSave, 
  FaCheck
} from "react-icons/fa";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock user data - replace with API call in real app
interface User {
  name: string;
  email: string;
  avatar: string;
  jobTitle: string;
  location: string;
  bio: string;
  skills: string[];
  socials: {
    linkedin: string;
    github: string;
    website: string;
  };
  activity: {
    resumes: number;
    applications: number;
    interviews: number;
  };
  personalInfo: {
    phone: string;
    address: string;
  };
  preferences: {
    emailNotifications: boolean;
    applicationUpdates: boolean;
    newFeatures: boolean;
    resumeTips: boolean;
  };
}

const mockUser: User = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "https://placehold.co/400x400/e2e8f0/1e40af?text=AJ&font=roboto",
    location: "San Francisco, CA",
    bio: "Frontend developer with 5+ years of experience building responsive web applications using React, TypeScript, and modern CSS frameworks.",
    skills: ["React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS", "GraphQL"],
    socials: {
        linkedin: "alexjohnson",
        github: "alexjdev",
        website: "alexjohnson.dev"
    },
    activity: {
        resumes: 7,
        applications: 15,
        interviews: 3
    },
    personalInfo: {
        phone: "+1 (555) 123-4567",
        address: "123 Tech Street, San Francisco, CA 94107"
    },
    preferences: {
        emailNotifications: true,
        applicationUpdates: true,
        newFeatures: false,
        resumeTips: true
    },
    jobTitle: ""
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...mockUser});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as Record<string, any>),
            [child]: value
          }
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: checked
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save profile - this would be an API call in a real app
    setUser(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and account preferences
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            variant={isEditing ? "outline" : "default"}
            className={!isEditing ? "bg-blue-700 hover:bg-blue-800" : ""}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1.5">
              <FaBriefcase className="text-gray-500" size={14} />
              <span>{user.jobTitle}</span>
            </CardDescription>
            <CardDescription className="flex items-center justify-center gap-1.5 mt-1">
              <FaMapMarkerAlt className="text-gray-500" size={14} />
              <span>{user.location}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-t pt-4">
              <h3 className="font-medium text-sm text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-center mt-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-blue-700 text-xs"
                  onClick={() => router.push('/skills')}
                >
                  Manage Skills
                </Button>
              </div>
            </div>
            
            <div className="border-t mt-4 pt-4">
              <h3 className="font-medium text-sm text-gray-700 mb-2">Social Profiles</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <FaLinkedin className="text-[#0077B5]" size={16} />
                  <span className="text-sm">{user.socials.linkedin ? `linkedin.com/in/${user.socials.linkedin}` : "Not connected"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FaGithub className="text-gray-800" size={16} />
                  <span className="text-sm">{user.socials.github ? `github.com/${user.socials.github}` : "Not connected"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FaGlobe className="text-blue-700" size={16} />
                  <span className="text-sm">{user.socials.website || "Not provided"}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t mt-4 pt-4">
              <h3 className="font-medium text-sm text-gray-700 mb-2">Activity Summary</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-700">{user.activity.resumes}</div>
                  <div className="text-xs text-gray-600">Resumes</div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-700">{user.activity.applications}</div>
                  <div className="text-xs text-gray-600">Applications</div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-700">{user.activity.interviews}</div>
                  <div className="text-xs text-gray-600">Interviews</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              {isEditing 
                ? "Edit your profile information below" 
                : "View and manage your profile information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>
                
                {/* Personal Info Tab */}
                <TabsContent value="personal">
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name"
                          name="name"
                          value={isEditing ? formData.name : user.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={isEditing ? formData.email : user.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone"
                          name="personalInfo.phone"
                          value={isEditing ? formData.personalInfo.phone : user.personalInfo.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location"
                          name="location"
                          value={isEditing ? formData.location : user.location}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="City, State"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address"
                        name="personalInfo.address"
                        value={isEditing ? formData.personalInfo.address : user.personalInfo.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Your address"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Professional Tab */}
                <TabsContent value="professional">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Current Job Title</Label>
                      <Input 
                        id="jobTitle"
                        name="jobTitle"
                        value={isEditing ? formData.jobTitle : user.jobTitle}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Your current job title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio"
                        name="bio"
                        value={isEditing ? formData.bio : user.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Write a brief professional bio"
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Username</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            linkedin.com/in/
                          </span>
                          <Input 
                            id="linkedin"
                            name="socials.linkedin"
                            value={isEditing ? formData.socials.linkedin : user.socials.linkedin}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="username"
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub Username</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            github.com/
                          </span>
                          <Input 
                            id="github"
                            name="socials.github"
                            value={isEditing ? formData.socials.github : user.socials.github}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="username"
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website">Personal Website</Label>
                        <Input 
                          id="website"
                          name="socials.website"
                          value={isEditing ? formData.socials.website : user.socials.website}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Preferences Tab */}
                <TabsContent value="preferences">
                  <div className="space-y-5">
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      
                      <div className="flex items-center gap-x-3">
                        <input
                          id="emailNotifications"
                          name="emailNotifications"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600"
                          checked={isEditing ? formData.preferences.emailNotifications : user.preferences.emailNotifications}
                          onChange={handleCheckboxChange}
                          disabled={!isEditing}
                        />
                        <div className="space-y-1">
                          <Label 
                            htmlFor="emailNotifications"
                            className="font-medium text-gray-700"
                          >
                            General email notifications
                          </Label>
                          <p className="text-sm text-gray-500">
                            Receive email notifications about your account activity
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-x-3">
                        <input
                          id="applicationUpdates"
                          name="applicationUpdates"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600"
                          checked={isEditing ? formData.preferences.applicationUpdates : user.preferences.applicationUpdates}
                          onChange={handleCheckboxChange}
                          disabled={!isEditing}
                        />
                        <div className="space-y-1">
                          <Label 
                            htmlFor="applicationUpdates"
                            className="font-medium text-gray-700"
                          >
                            Application updates
                          </Label>
                          <p className="text-sm text-gray-500">
                            Get notified about job application status changes
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-x-3">
                        <input
                          id="newFeatures"
                          name="newFeatures"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600"
                          checked={isEditing ? formData.preferences.newFeatures : user.preferences.newFeatures}
                          onChange={handleCheckboxChange}
                          disabled={!isEditing}
                        />
                        <div className="space-y-1">
                          <Label 
                            htmlFor="newFeatures"
                            className="font-medium text-gray-700"
                          >
                            Product updates
                          </Label>
                          <p className="text-sm text-gray-500">
                            Learn about new features and updates to ResumeTailor
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-x-3">
                        <input
                          id="resumeTips"
                          name="resumeTips"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600"
                          checked={isEditing ? formData.preferences.resumeTips : user.preferences.resumeTips}
                          onChange={handleCheckboxChange}
                          disabled={!isEditing}
                        />
                        <div className="space-y-1">
                          <Label 
                            htmlFor="resumeTips"
                            className="font-medium text-gray-700"
                          >
                            Resume tips & advice
                          </Label>
                          <p className="text-sm text-gray-500">
                            Receive helpful tips to improve your resume and job search
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {isEditing && (
                <div className="mt-8 flex justify-end">
                  <Button type="submit" className="bg-blue-700 hover:bg-blue-800">
                    <FaSave className="mr-2" /> Save Changes
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
          {saveSuccess && (
            <CardFooter>
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-md w-full">
                <FaCheck />
                <span>Profile updated successfully!</span>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}