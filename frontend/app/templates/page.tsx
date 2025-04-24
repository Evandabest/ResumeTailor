"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar, FaTag, FaSearch, FaCheck } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Mock template data
const templates = [
  {
    id: "jake-resume",
    name: "Jake's Resume Template",
    description: "A clean, modern template with a unique sidebar design perfect for tech roles.",
    image: "",
    category: "Modern",
    featured: true,
    premium: false,
    tags: ["Tech", "Creative", "Standout"],
    rating: 4.9,
    downloads: 1245
  },
  {
    id: "professional-plus",
    name: "Professional Plus",
    description: "A polished, traditional template with a professional look for corporate roles.",
    image: "",
    category: "Traditional",
    featured: false,
    premium: false,
    tags: ["Corporate", "Conservative", "Clean"],
    rating: 4.7,
    downloads: 987
  },
  {
    id: "minimal-modern",
    name: "Minimal Modern",
    description: "A sleek, minimalist design with ample white space and clean typography.",
    image: "",
    category: "Minimal",
    featured: true,
    premium: false,
    tags: ["Minimal", "Clean", "Designer"],
    rating: 4.8,
    downloads: 1102
  },
  {
    id: "technical-edge",
    name: "Technical Edge",
    description: "Designed specifically for technical roles with sections for skills and projects.",
    image: "",
    category: "Technical",
    featured: false,
    premium: false,
    tags: ["Technical", "Developer", "Engineer"],
    rating: 4.6,
    downloads: 845
  },
  {
    id: "creative-portfolio",
    name: "Creative Portfolio",
    description: "A distinctive template ideal for creative professionals with visual elements.",
    image: "",
    category: "Creative",
    featured: true,
    premium: false,
    tags: ["Creative", "Design", "Visual"],
    rating: 4.5,
    downloads: 720
  },
  {
    id: "academic-professional",
    name: "Academic Professional",
    description: "Perfect for academic or research positions with sections for publications.",
    image: "",
    category: "Academic",
    featured: false,
    premium: false,
    tags: ["Academic", "Research", "Education"],
    rating: 4.4,
    downloads: 580
  },
];

// Categories for filtering
const categories = [
  "All",
  "Modern",
  "Traditional",
  "Minimal",
  "Technical",
  "Creative",
  "Academic"
];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  
  // Filter templates based on search, category, and premium filter
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = searchQuery === "" || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
      
      const matchesPremium = !showPremiumOnly || template.premium;
      
      return matchesSearch && matchesCategory && matchesPremium;
    });
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resume Templates</h1>
        <p className="text-gray-600 mt-2">
          Choose from our collection of professionally designed resume templates to showcase your skills and experience.
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center">
          <Button 
            variant={showPremiumOnly ? "default" : "outline"} 
            onClick={() => setShowPremiumOnly(!showPremiumOnly)}
            className={showPremiumOnly ? "bg-blue-700 hover:bg-blue-800" : ""}
          >
            {showPremiumOnly && <FaCheck className="mr-2 h-3 w-3" />}
            Premium Only
          </Button>
        </div>
      </div>
      
      {/* Category Tabs */}
      <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="mb-8 flex flex-wrap">
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={selectedCategory}>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No templates found matching your criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="overflow-hidden flex flex-col h-full">
                  <div className="relative">
                    {template.featured && (
                      <div className="absolute top-4 left-4 bg-blue-700 text-white px-3 py-1 text-xs font-semibold rounded-full">
                        Featured
                      </div>
                    )}
                    {template.premium && (
                      <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 text-xs font-semibold rounded-full">
                        Premium
                      </div>
                    )}
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                      <Image 
                        src={template.image} 
                        alt={template.name}
                        width={600}
                        height={800}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{template.name}</span>
                      <div className="flex items-center text-sm text-amber-500">
                        <FaStar className="mr-1" />
                        <span>{template.rating}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-gray-600 mb-4">{template.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <FaTag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{template.downloads.toLocaleString()} downloads</p>
                  </CardContent>
                  
                  <CardFooter className="pt-6 border-t">
                    <div className="w-full flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        asChild
                      >
                        <Link href={`/templates/${template.id}/preview`}>Preview</Link>
                      </Button>
                      <Button 
                        className="flex-1 bg-blue-700 hover:bg-blue-800"
                        asChild
                      >
                        <Link href={`/resumes/new?template=${template.id}`}>Use Template</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}