"use client";

import { useState } from "react";
import { GitHubProject, listGitHubProjects, importGitHubProjects } from "@/lib/github";
import { checkAuth } from "./auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { FaGithub } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GitHubProjectsPage() {
  const [projects, setProjects] = useState<GitHubProject[]>([]);
  const [excludedProjects, setExcludedProjects] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [minStars, setMinStars] = useState<number>(0);

  checkAuth();

  const handleLoadProjects = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const repos = await listGitHubProjects({
        min_stars: minStars,
        is_archived: false
      });
      setProjects(repos);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProject = (projectName: string) => {
    const newExcluded = new Set(excludedProjects);
    if (newExcluded.has(projectName)) {
      newExcluded.delete(projectName);
    } else {
      newExcluded.add(projectName);
    }
    setExcludedProjects(newExcluded);
  };

  const handleImport = async () => {
    const projectsToImport = projects
      .filter(project => !excludedProjects.has(project.name))
      .map(project => project.name);
    
    if (projectsToImport.length === 0) return;
    
    setImporting(true);
    setSuccess(null);
    try {
      await importGitHubProjects(projectsToImport);
      setSuccess(`Successfully imported ${projectsToImport.length} projects`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import projects');
    } finally {
      setImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="text-xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">GitHub Projects</h1>
          <div className="flex gap-4">
            <Button
              onClick={handleImport}
              disabled={!projects.length || projects.length === excludedProjects.size || importing}
              className="bg-blue-700 hover:bg-blue-800"
            >
              {importing ? "Importing..." : "Import Selected"}
            </Button>
          </div>
        </div>

        <div className="flex gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="minStars">Minimum Stars</Label>
            <Input
              id="minStars"
              type="number"
              min="0"
              value={minStars}
              onChange={(e) => setMinStars(parseInt(e.target.value) || 0)}
              className="w-32"
            />
          </div>
          <Button 
            onClick={handleLoadProjects}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load Projects"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-800 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 text-sm text-green-800 bg-green-100 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.name} className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={!excludedProjects.has(project.name)}
                onCheckedChange={() => toggleProject(project.name)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FaGithub className="h-5 w-5" />
                  <a 
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium hover:text-blue-700"
                  >
                    {project.name}
                  </a>
                </div>
  <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {project.languages && project.languages.length > 0 && (
                    <div className="flex items-center gap-1">
                      • {project.languages.join(', ')}
                    </div>
                  )}
                </div>
                {project.description && (
      <div className="text-sm text-gray-600">
        {project.description}
      </div>
    )}
  </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          No GitHub projects found.
        </div>
      )}
    </div>
  );
}
