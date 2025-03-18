"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaSave, FaDownload, FaCog, FaUndo, FaRedo, FaRegEye, FaCode, FaInfoCircle } from "react-icons/fa";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";
import Editor from '@monaco-editor/react';

// Mock resume data - replace with API call
const mockResumeData = {
  id: "resume-123",
  title: "Software Engineer - Google",
  template: "jake-resume",
  latexContent: `\\documentclass[a4paper,10pt]{article}
\\usepackage[left=0.75in,top=0.6in,right=0.75in,bottom=0.6in]{geometry}
\\usepackage{hyperref}
\\usepackage{fontawesome}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}

\\definecolor{primary}{RGB}{25, 64, 175}

\\titleformat{\\section}{\\Large\\bfseries\\color{primary}}{}{0em}{\\uppercase}[\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{6pt}

\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\Huge\\textbf{Alex Johnson}}\\\\[0.3cm]
  {\\large San Francisco, CA}\\\\
  {\\small \\href{mailto:alex.johnson@example.com}{alex.johnson@example.com} • 
  \\href{tel:+15551234567}{(555) 123-4567} • 
  \\href{https://linkedin.com/in/alexjohnson}{linkedin.com/in/alexjohnson} • 
  \\href{https://github.com/alexjdev}{github.com/alexjdev}}
\\end{center}

\\section{SUMMARY}
Senior Frontend Developer with 5+ years of experience building responsive web applications using React, TypeScript, and modern CSS frameworks. Passionate about creating intuitive user interfaces and optimizing application performance.

\\section{WORK EXPERIENCE}
\\textbf{Frontend Engineer} \\hfill \\textit{TechCorp Inc.} \\hfill \\textit{Jan 2021 - Present}
\\begin{itemize}[leftmargin=*]
  \\item Led development of a customer-facing dashboard that improved user engagement by 32\\%
  \\item Implemented CI/CD pipeline that reduced deployment time by 40\\%
  \\item Mentored 3 junior developers and conducted code reviews to ensure high quality standards
  \\item Optimized application bundle size, reducing load time by 25\\% through code splitting and lazy loading
\\end{itemize}

\\textbf{Web Developer} \\hfill \\textit{Digital Solutions LLC} \\hfill \\textit{Mar 2018 - Dec 2020}
\\begin{itemize}[leftmargin=*]
  \\item Developed responsive web applications using React, Redux, and CSS-in-JS
  \\item Collaborated with UX designers to implement pixel-perfect interfaces
  \\item Integrated REST APIs and handled complex state management
  \\item Improved website accessibility to meet WCAG 2.1 AA standards
\\end{itemize}

\\section{EDUCATION}
\\textbf{Bachelor of Science in Computer Science} \\hfill \\textit{2018}\\\\
University of California, Berkeley

\\section{SKILLS}
\\textbf{Programming:} JavaScript (ES6+), TypeScript, HTML5, CSS3/SASS, SQL, Python\\\\
\\textbf{Frameworks/Libraries:} React, Redux, Next.js, Node.js, Express, Jest, React Testing Library\\\\
\\textbf{Tools:} Git, Webpack, Docker, AWS, Firebase, Figma, JIRA, GitHub Actions

\\section{PROJECTS}
\\textbf{Personal Portfolio} • \\textit{\\href{https://alexjohnson.dev}{alexjohnson.dev}}\\\\
Custom portfolio website built with Next.js, TypeScript, and Tailwind CSS, featuring animated transitions and dark mode.

\\textbf{Weather Dashboard} • \\textit{\\href{https://github.com/alexjdev/weather-app}{GitHub}}\\\\
React application that displays weather forecasts using the OpenWeatherMap API with geolocation support.

\\end{document}
`,
  createdAt: "2025-03-15T12:00:00Z",
  updatedAt: "2025-03-15T14:30:00Z"
};

export default function EditResumePage() {
  const router = useRouter();
  const params = useParams();
  const resumeId = params.id;
  
  const [latexCode, setLatexCode] = useState(mockResumeData.latexContent);
  const [compiledPDF, setCompiledPDF] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [autoCompile, setAutoCompile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editorView, setEditorView] = useState<"split" | "editor" | "preview">("split");
  
  // Compile LaTeX to PDF
  const compileLaTeX = async (latex: string) => {
    setIsCompiling(true);
    
    try {
      console.log("Sending LaTeX to compile...");
      
      // Use our API proxy to avoid CORS issues
      const response = await fetch('/api/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latex }),
      });

      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error data:", errorData);
        throw new Error(errorData.error || 'LaTeX compilation failed');
      }

      const data = await response.json();
      console.log("API response received:", {
        success: data.success,
        hasPdf: Boolean(data.pdf),
        pdfLength: data.pdf ? data.pdf.length : 0
      });
      
      if (data.success && data.pdf) {
        console.log("Setting compiled PDF...");
        setCompiledPDF(data.pdf);
      } else {
        throw new Error('Invalid response from compilation API');
      }
    } catch (error) {
      console.error("Error compiling LaTeX:", error);
      
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(`LaTeX compilation failed: ${errorMessage}`);
      
      // For development, still show a fallback PDF
      console.log("Setting fallback PDF...");
      setCompiledPDF(`data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDEgMCBSIC9MYXN0TW9kaWZpZWQgKEQ6MjAyMzA2MTUxMjMwMDBaKSAvUmVzb3VyY2VzIDIgMCBSIC9NZWRpYUJveCBbMC4wMDAwMDAgMC4wMDAwMDAgNTk1LjI3NjAwMCA4NDEuODkwMDAwXSAvQ3JvcEJveCBbMC4wMDAwMDAgMC4wMDAwMDAgNTk1LjI3NjAwMCA4NDEuODkwMDAwXSAvQmxlZWRCb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDU5NS4yNzYwMDAgODQxLjg5MDAwMF0gL1RyaW1Cb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDU5NS4yNzYwMDAgODQxLjg5MDAwMF0gL0FydEJveCBbMC4wMDAwMDAgMC4wMDAwMDAgNTk1LjI3NjAwMCA4NDEuODkwMDAwXSAvQ29udGVudHMgNiAwIFIgL1JvdGF0ZSAwIC9Hcm91cCA8PCAvVHlwZSAvR3JvdXAgL1MgL1RyYW5zcGFyZW5jeSAvQ1MgL0RldmljZVJHQiA+PiAvQW5ub3RzIFsgXSAvUFogMSA+PgplbmRvYmoKNiAwIG9iago8PC9GaWx0ZXIgL0ZsYXRlRGVjb2RlIC9MZW5ndGggMTc0Pj4gc3RyZWFtCnicVY6xCsIwFEX3fEUGpyZN0zR9lIogOHQQcRUHaQsigoNL/l9wEAc9w4F7OVzuG2P9AJZDFtEZM9gHngj+5NrQKBBhKFNXgZNn306gF+RLqXgvNr38NyLU40dni0Jm81L6iDuB6q0OCZxQKcLGBt+X+2TYb8+2KHfCsUx0zhwbuzI/VKfR5AplbmRzdHJlYW0KZW5kb2JqCjEgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFsgNSAwIFIgXSAvQ291bnQgMSA+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAxIDAgUiAvTWV0YWRhdGEgNCAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwvTGVuZ3RoIDE1Pj4gc3RyZWFtCjw8L0NyZWF0b3Io/v8pPj4KZW5kc3RyZWFtCmVuZG9iagoyIDAgb2JqCjw8IC9Qcm9jU2V0IFsvUERGIC9UZXh0IC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJXSA+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwNTgzIDAwMDAwIG4gCjAwMDAwMDA3MDggMDAwMDAgbiAKMDAwMDAwMDY0MiAwMDAwMCBuIAowMDAwMDAwNjQ3IDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDMzMyAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNy9Sb290IDMgMCBSL0luZm8gNCAwIFIvSUQgWzw1RUQ5OEIzMDkxQ0EzMDAzODczRDJGRUM0RjM1QjEzMT48NUVEOThCMzA5MUNBMzAwMzg3M0QyRkVDNEYzNUIxMzE+XT4+CnN0YXJ0eHJlZgo3NzUKJSVFT0YK`);
    } finally {
      setIsCompiling(false);
    }
  };
  
  // Save resume
  const saveResume = async () => {
    setIsSaving(true);
    
    try {
      // In a real application, this would be an API call to save the resume
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log("Resume saved:", {
        id: resumeId,
        latexContent: latexCode
      });
      
      // Update mockResumeData
      mockResumeData.latexContent = latexCode;
      mockResumeData.updatedAt = new Date().toISOString();
      
    } catch (error) {
      console.error("Error saving resume:", error);
      // Handle error appropriately
    } finally {
      setIsSaving(false);
    }
  };
  
  // Download PDF
  const downloadPDF = () => {
    if (!compiledPDF) return;
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = compiledPDF;
    a.download = `${mockResumeData.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Handle editor changes
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setLatexCode(value);
      
      if (autoCompile) {
        // Debounce compilation to avoid too many requests
        const timeoutId = setTimeout(() => {
          compileLaTeX(value);
        }, 1000);
        
        return () => clearTimeout(timeoutId);
      }
    }
  };
  
  // Initial compilation
  useEffect(() => {
    compileLaTeX(latexCode);
  }, []);
  
  // Manual compilation
  const handleManualCompile = () => {
    compileLaTeX(latexCode);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="mr-4"
            onClick={() => router.push('/resumes')}
          >
            ← Back to Resumes
          </Button>
          <h1 className="text-xl font-bold text-gray-900">{mockResumeData.title}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-sm text-gray-500">
                  <span>Last saved: {new Date(mockResumeData.updatedAt).toLocaleTimeString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last saved on {new Date(mockResumeData.updatedAt).toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCompile}
            disabled={isCompiling}
          >
            {isCompiling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Compiling...
              </>
            ) : (
              "Compile"
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPDF}
            disabled={!compiledPDF || isCompiling}
          >
            <FaDownload className="mr-2 h-4 w-4" /> PDF
          </Button>
          
          <Button
            onClick={saveResume}
            size="sm"
            className="bg-blue-700 hover:bg-blue-800"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2 h-4 w-4" /> Save
              </>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <FaCog className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setEditorView("editor")}>
                  <FaCode className="mr-2 h-4 w-4" />
                  <span>Editor Only</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditorView("preview")}>
                  <FaRegEye className="mr-2 h-4 w-4" />
                  <span>Preview Only</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditorView("split")}>
                  <span className="mr-2">⫽</span>
                  <span>Split View</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center" onSelect={e => e.preventDefault()}>
                <div className="flex items-center flex-1">
                  <label htmlFor="auto-compile" className="flex-1 cursor-pointer">Auto-compile</label>
                  <Checkbox
                    id="auto-compile"
                    checked={autoCompile}
                    onCheckedChange={checked => setAutoCompile(!!checked)}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {editorView === "editor" && (
          <div className="h-full">
            <Editor
              height="100%"
              defaultLanguage="latex"
              value={latexCode}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'on',
                rulers: [80]
              }}
            />
          </div>
        )}
        
        {editorView === "preview" && (
          <div className="h-full bg-gray-800 flex items-center justify-center p-4">
            {isCompiling ? (
              <div className="flex flex-col items-center justify-center text-white">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p>Compiling your LaTeX document...</p>
              </div>
            ) : compiledPDF ? (
              <iframe 
                src={compiledPDF} 
                className="w-full h-full rounded-lg border border-gray-700 bg-white" 
                title="Compiled PDF"
              />
            ) : (
              <div className="text-white">
                <p>No preview available</p>
              </div>
            )}
          </div>
        )}
        
        {editorView === "split" && (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={30}>
              <Editor
                height="100%"
                defaultLanguage="latex"
                value={latexCode}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  rulers: [80]
                }}
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full bg-gray-800 flex items-center justify-center p-4">
                {isCompiling ? (
                  <div className="flex flex-col items-center justify-center text-white">
                    <Loader2 className="h-10 w-10 animate-spin mb-4" />
                    <p>Compiling your LaTeX document...</p>
                  </div>
                ) : compiledPDF ? (
                  <iframe 
                    src={compiledPDF} 
                    className="w-full h-full rounded-lg border border-gray-700 bg-white" 
                    title="Compiled PDF"
                  />
                ) : (
                  <div className="text-white">
                    <p>No preview available</p>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
      
      {/* Info bar */}
      <div className="bg-gray-100 border-t border-gray-200 py-1 px-4 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <FaInfoCircle className="h-3 w-3" />
          <span>
            {isCompiling ? 
              "Compiling LaTeX..." : 
              "Ready"}
          </span>
        </div>
        <div>
          Template: {mockResumeData.template}
        </div>
      </div>
    </div>
  );
}