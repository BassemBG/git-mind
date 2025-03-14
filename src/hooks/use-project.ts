import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery();
  const [ selectedProjectId, setSelectedProjectId ] = useLocalStorage("gitMind-project", ""); //didn't use useState because not persistent, when refresh happens
  const selectedProject = projects?.find((project) => project.id === selectedProjectId);
  return {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId
  };
};

export default useProject;
