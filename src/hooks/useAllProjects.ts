// src/hooks/useAllProjects.ts
import { useState, useEffect } from 'react';
import { getAllProjects, loadProjects } from '@/data/projectState';

export function useAllProjects() {
  const [projects, setProjects] = useState<any[]>([]);
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