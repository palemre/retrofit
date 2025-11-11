// src/hooks/useAllProjects.ts
import { useState, useEffect } from 'react';
import { getAllProjects } from '@/data/projectState';
import { Project } from '@/data/projectTypes';

export function useAllProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = () => {
      setTimeout(() => {
        const projectsData = getAllProjects();
        setProjects(projectsData);
        setLoading(false);
      }, 500);
    };

    fetchProjects();
  }, []);

  // Function to refresh projects (called after investments)
  const refreshProjects = () => {
    const projectsData = getAllProjects();
    setProjects(projectsData);
  };

  return { projects, loading, refreshProjects };
}