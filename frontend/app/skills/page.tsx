"use client";

import { useState } from "react";
import { FaTimes, FaPlus, FaSave, FaSearch } from "react-icons/fa";
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

// Predefined skill categories with common skills
const skillCategories = [
  {
    name: "Programming Languages",
    skills: [
      "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", 
      "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin"
    ]
  },
  {
    name: "Frontend",
    skills: [
      "React", "Angular", "Vue.js", "Next.js", "Svelte", "HTML", 
      "CSS", "SASS/SCSS", "Tailwind CSS", "Bootstrap", "Material UI"
    ]
  },
  {
    name: "Backend",
    skills: [
      "Node.js", "Express", "Django", "Flask", "Spring Boot", "Ruby on Rails", 
      "Laravel", "ASP.NET", "GraphQL", "REST API"
    ]
  },
  {
    name: "Database",
    skills: [
      "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis", "Elasticsearch", 
      "Firebase", "DynamoDB", "Oracle", "SQL Server", "Supabase"
    ]
  },
  {
    name: "DevOps",
    skills: [
      "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", 
      "Jenkins", "GitHub Actions", "Terraform", "Ansible"
    ]
  },
  {
    name: "Mobile",
    skills: [
      "React Native", "Flutter", "iOS", "Android", "Swift", "Kotlin", 
      "Xamarin", "Ionic", "Capacitor", "Expo"
    ]
  },
  {
    name: "Other",
    skills: [
      "Git", "Data Science", "Machine Learning", "Agile", "Scrum", "UI/UX", 
      "Testing", "Jest", "Cypress", "WebSockets"
    ]
  }
];

// Flatten skills for search functionality
const allPredefinedSkills = skillCategories.flatMap(category => 
  category.skills.map(skill => ({ name: skill, category: category.name }))
);

// Get all unique skill names
const allSkillNames = allPredefinedSkills.map(skill => skill.name);

export default function SkillsPage() {
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [skillLevel, setSkillLevel] = useState<Record<string, number>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Filter suggestions based on search input
  const suggestions = searchInput ? 
    allSkillNames.filter(skill => 
      skill.toLowerCase().includes(searchInput.toLowerCase()) && 
      !userSkills.includes(skill)
    ) : [];

  // Mock function to save skills
  const saveSkills = () => {
    // In a real app, this would be an API call
    console.log("Saving skills:", userSkills);
    console.log("Skill levels:", skillLevel);
    
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const addSkill = (skill: string) => {
    if (skill && !userSkills.includes(skill)) {
      setUserSkills([...userSkills, skill]);
      if (!skillLevel[skill]) {
        setSkillLevel({...skillLevel, [skill]: 3}); // Default to intermediate
      }
      setSearchInput("");
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setUserSkills(userSkills.filter(skill => skill !== skillToRemove));
    // Remove from skill level tracking as well
    const newSkillLevels = {...skillLevel};
    delete newSkillLevels[skillToRemove];
    setSkillLevel(newSkillLevels);
  };

  const updateSkillLevel = (skill: string, level: number) => {
    setSkillLevel({...skillLevel, [skill]: level});
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput) {
      addSkill(searchInput);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Your Skills</h1>
        <p className="text-gray-600 mt-2">
          Add skills to your profile to help tailor your resumes to job opportunities.
        </p>
      </div>

      {/* Simple Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search for a skill or enter your own..."
                className="pl-10"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              {showSuggestions && searchInput && (
                <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {suggestions.length > 0 ? (
                    <ul>
                      {suggestions.slice(0, 6).map((suggestion) => (
                        <li 
                          key={suggestion}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            addSkill(suggestion);
                          }}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-2 text-gray-500">
                      No matches found. Press enter to add "{searchInput}" as a custom skill.
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button 
              type="submit"
              className="bg-blue-700 hover:bg-blue-800"
            >
              <FaPlus className="mr-2 h-4 w-4" /> Add Skill
            </Button>
          </div>
        </form>
      </div>

      {/* Your Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Your Skills</CardTitle>
          <CardDescription>
            These are the skills you've added to your profile. Adjust proficiency levels as needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto max-h-72">
          {userSkills.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You haven't added any skills yet.</p>
              <p className="text-gray-500 mt-2">Use the search bar above to add skills to your profile.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userSkills.map((skill) => (
                <div key={skill} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <Badge className="mr-3">{skill}</Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeSkill(skill)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                    >
                      <FaTimes className="h-4 w-4" />
                      <span className="sr-only">Remove {skill}</span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                    <span className="text-sm text-gray-500 mr-2">Proficiency:</span>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Button
                        key={level}
                        variant="ghost"
                        size="sm"
                        className={`px-2 ${skillLevel[skill] >= level ? 'text-blue-700' : 'text-gray-300'}`}
                        onClick={() => updateSkillLevel(skill, level)}
                      >
                        ●
                      </Button>
                    ))}
                    <span className="text-sm ml-2">
                      {skillLevel[skill] === 1 ? 'Beginner' : 
                       skillLevel[skill] === 2 ? 'Basic' :
                       skillLevel[skill] === 3 ? 'Intermediate' :
                       skillLevel[skill] === 4 ? 'Advanced' : 'Expert'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {userSkills.length > 0 && (
          <CardFooter className="flex justify-between">
            <div>
              {savedSuccess && (
                <span className="text-green-600 flex items-center">
                  <FaSave className="mr-1" /> Skills saved successfully!
                </span>
              )}
            </div>
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={saveSkills}>
              Save Skills
            </Button>
          </CardFooter>
        )}
      </Card>

    </div>
  );
}