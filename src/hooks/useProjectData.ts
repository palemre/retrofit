// src/hooks/useProjectData.ts
import { useState, useEffect } from 'react';
import {
  getProject,
  updateProjectInvestment as updateGlobalInvestment,
  resetProjectFundraising as resetGlobalProjectFundraising,
} from '@/data/projectState';
import { Project } from '@/data/projectTypes';

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
  const updateProjectInvestment = (investmentAmount: string, investorAddress?: string) => {
    const updatedProject = updateGlobalInvestment(projectId, investmentAmount, investorAddress);
    if (updatedProject) {
      setProject(updatedProject);
    }
  };

  const refreshProject = () => {
    const foundProject = getProject(projectId);
    setProject(foundProject || null);
  };

  const resetProjectFunding = () => {
    const updatedProject = resetGlobalProjectFundraising(projectId);
    if (updatedProject) {
      setProject({ ...updatedProject });
    }
  };

  return { project, loading, updateProjectInvestment, refreshProject, resetProjectFunding };
}