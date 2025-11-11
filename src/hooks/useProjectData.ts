// src/hooks/useProjectData.ts
import { useState, useEffect } from 'react';
import {
  getProject,
  updateProjectInvestment as updateGlobalInvestment,
  resetProjectFunding as resetGlobalProjectFunding,
  Project,
} from '@/data/projectState';

export function useProjectData(projectId: number) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = () => {
      setTimeout(() => {
        const foundProject = getProject(projectId);
        setProject(foundProject || null);
        setLoading(false);
      }, 500);
    };

    fetchProject();
  }, [projectId]);

  // Update investment and refresh data
  const updateProjectInvestment = (investmentAmount: string) => {
    const updatedProject = updateGlobalInvestment(projectId, investmentAmount);
    if (updatedProject) {
      setProject(updatedProject);
    }
  };

  const refreshProject = () => {
    const foundProject = getProject(projectId);
    setProject(foundProject || null);
  };

  const resetFunding = () => {
    const updatedProject = resetGlobalProjectFunding(projectId);
    if (updatedProject) {
      setProject(updatedProject);
    }
  };

  return { project, loading, updateProjectInvestment, refreshProject, resetFunding };
}