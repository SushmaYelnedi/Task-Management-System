package com.klef.fsad.service;

import java.util.List;

import com.klef.fsad.model.Employee;
import com.klef.fsad.model.SelfTask;
import com.klef.fsad.model.Task;
import com.klef.fsad.dto.TaskProgressDTO;

public interface EmployeeService 
{
   
    public Employee verifyEmployeeLogin(String email, String password);
    
 
    public Employee getEmployeeById(int id);
    public String updateEmployee(Employee employee);
    public String updateEmployeeImage(int id, byte[] imageBytes);
    
   
    public String addSelfTask(SelfTask selfTask);
    public List<Task> getTasksAssignedTo(int id);
    public List<SelfTask> getSelfTasksByEmployee(int id);
    public List<SelfTask> getAllSelfTasksForDebugging();
    public String updateSelfTask(Long id, String status);
    
   
    public String updateTaskProgress(TaskProgressDTO taskProgressDTO);
    public void updateTask(Long id, double progress, String status);
    public List<TaskProgressDTO> getTaskProgressByTaskId(Long taskId);
}