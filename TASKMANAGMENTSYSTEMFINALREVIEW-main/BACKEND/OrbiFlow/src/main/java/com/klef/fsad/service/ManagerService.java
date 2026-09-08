package com.klef.fsad.service;

import java.util.List;

import com.klef.fsad.dto.TaskProgressDTO;
import com.klef.fsad.dto.BulkTaskAssignmentDTO;
import com.klef.fsad.model.Manager;
import com.klef.fsad.model.SelfTask;
import com.klef.fsad.model.Task;

public interface ManagerService {

	public Manager verifyManagerLogin(String email, String password);

	public Manager getManagerById(int id);
	public String updateManager(Manager manager);
	public String updateManagerImage(int id, byte[] imageBytes);
	
	public String addTask(Task task);
    public String addSelfTask(SelfTask selfTask);
    public String addTasksBulk(BulkTaskAssignmentDTO bulkTaskAssignmentDTO);
    public List<Task> getTasksAssignedBy(int id);
    public List<Task> getTasksAssignedTo(int id);
    public List<SelfTask> getSelfTasksByManager(int id);
    public List<SelfTask> getAllSelfTasksForDebugging();
    public String deleteSelfTask(Long id);
    public String deleteTask(Long id);
    public String updateSelfTask(Long id, String status);
    // Update full details of a self-task (title, description, dates, status)
    public String updateSelfTaskDetails(SelfTask selfTask);
    // Update full task details (non-progress) for tasks assigned by manager
    public String updateTaskDetails(Task task);
    
    public String updateTaskProgress(TaskProgressDTO taskProgressDTO);
    public void updateTask(Long id, double progress, String status);
    public List<TaskProgressDTO> getTaskProgressByTaskId(Long taskId);

}
