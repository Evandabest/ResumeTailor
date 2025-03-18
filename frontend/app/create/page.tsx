"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LatexEditorPage() {
  const [latexCode, setLatexCode] = useState(`\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\title{My LaTeX Document}
\\author{ResumeTailor User}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Introduction}
This is a simple LaTeX document created with ResumeTailor.

\\section{Equations}
Here's a sample equation:
\\begin{equation}
  E = mc^2
\\end{equation}

\\end{document}`);
  
  const [compiledOutput, setCompiledOutput] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compileLatex = async () => {
    setIsCompiling(true);
    setError(null);
    
    try {
      const response = await fetch('/api/latex/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latexCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to compile LaTeX');
      }
      
      setCompiledOutput(data.pdfUrl);
    } catch (err) {
      console.error('Error compiling LaTeX:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setCompiledOutput(null);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">LaTeX Editor</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Editor</h2>
          <Textarea
            value={latexCode}
            onChange={(e) => setLatexCode(e.target.value)}
            className="font-mono h-[600px] text-sm"
            placeholder="Write your LaTeX code here..."
          />
          <div className="mt-4 flex items-center space-x-2">
            <Button onClick={compileLatex} disabled={isCompiling}>
              {isCompiling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Compile
            </Button>
            <Button variant="outline" onClick={() => setLatexCode('')}>
              Clear
            </Button>
          </div>
        </Card>
        
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Output</h2>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="download">Download</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="h-[600px] overflow-auto">
              {isCompiling ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Compiling LaTeX...</span>
                </div>
              ) : error ? (
                <div className="text-red-500 p-4 border border-red-300 rounded bg-red-50">
                  <h3 className="font-bold">Compilation Error</h3>
                  <pre className="whitespace-pre-wrap text-sm mt-2">{error}</pre>
                </div>
              ) : compiledOutput ? (
                <iframe 
                  src={compiledOutput}
                  className="w-full h-full border-0"
                  title="Compiled LaTeX Document"
                />
              ) : (
                <div className="flex justify-center items-center h-full text-gray-400">
                  Compiled output will appear here
                </div>
              )}
            </TabsContent>
            <TabsContent value="download">
              {compiledOutput ? (
                <div className="flex flex-col items-center justify-center h-[600px]">
                  <p className="mb-4">Your compiled LaTeX document is ready!</p>
                  <Button asChild>
                    <a href={compiledOutput} download="document.pdf">
                      Download PDF
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center items-center h-full text-gray-400">
                  Compile your LaTeX code first to download the PDF
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-2">LaTeX Tips</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use <code>\\documentclass&#123;article&#125;</code> to define a basic document</li>
            <li>Write equations between <code>\\begin&#123;equation&#125;</code> and <code>\\end&#123;equation&#125;</code> tags</li>
            <li>Create sections with <code>\\section&#123;Title&#125;</code></li>
            <li>Include packages with <code>\\usepackage&#123;package-name&#125;</code></li>
            <li>Add images with <code>\\includegraphics&#123;filename&#125;</code> (requires graphicx package)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}