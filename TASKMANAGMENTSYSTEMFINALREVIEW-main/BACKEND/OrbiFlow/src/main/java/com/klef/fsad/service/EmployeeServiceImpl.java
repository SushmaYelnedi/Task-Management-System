package com.klef.fsad.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.sql.rowset.serial.SerialBlob;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klef.fsad.model.Employee;
import com.klef.fsad.model.SelfTask;
import com.klef.fsad.model.Task;
import com.klef.fsad.model.TaskProgress;
import com.klef.fsad.repository.EmployeeRepository;
import com.klef.fsad.repository.SelfTaskRepository;
import com.klef.fsad.repository.TaskProgressRepository;
import com.klef.fsad.repository.TaskRepository;
import com.klef.fsad.dto.TaskProgressDTO;

@Service
public class EmployeeServiceImpl implements EmployeeService 
{
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private SelfTaskRepository selfTaskRepository;
    
    @Autowired
    private TaskProgressRepository taskProgressRepository;

    @Override
    public Employee verifyEmployeeLogin(String email, String password) 
    {
        return employeeRepository.findByEmailAndPassword(email, password);
    }

    @Override
    public Employee getEmployeeById(int id) 
    {
        return employeeRepository.findById(id).orElse(null);
    }

    @Override
    public String updateEmployee(Employee employee) 
    {
        Optional<Employee> existing = employeeRepository.findById(employee.getId());
        if (existing.isPresent()) {
            Employee e = existing.get();
            e.setName(employee.getName());
            e.setGender(employee.getGender());
            e.setDepartment(employee.getDepartment());
            e.setContact(employee.getContact());
            e.setPassword(employee.getPassword());
            employeeRepository.save(e);
            return "Employee Updated Successfully";
        }
        return "Employee Not Found";
    }

    @Override
    public String updateEmployeeImage(int id, byte[] imageBytes) 
    {
        try {
            Employee employee = employeeRepository.findById(id).orElse(null);
            if (employee == null) {
                return "Employee Not Found";
            }
            SerialBlob serialBlob = new SerialBlob(imageBytes);
            employee.setUserimage(serialBlob);
            employeeRepository.save(employee);
            return "Employee Image Updated Successfully";
        } catch (Exception e) {
            return "Error updating image: " + e.getMessage();
        }
    }

    @Override
    public String addSelfTask(SelfTask selfTask) 
    {
        // Validate that assignedBy is set and positive
        if (selfTask.getAssignedBy() <= 0) {
            throw new IllegalArgumentException("AssignedBy field must be a valid user ID");
        }
        
        // Ensure status is set
        if (selfTask.getStatus() == null || selfTask.getStatus().isEmpty()) {
            selfTask.setStatus("ASSIGNED");
        }
        
        System.out.println("Adding self-task for employee " + selfTask.getAssignedBy() + ": " + selfTask.getTitle());
        selfTaskRepository.save(selfTask);
        return "Self Task Added Successfully";
    }

    @Override
    public List<Task> getTasksAssignedTo(int id) 
    {
        return taskRepository.findByAssignedTo(id);
    }

    @Override
    public List<SelfTask> getSelfTasksByEmployee(int id) 
    {
        System.out.println("SIMPLE FIX: Getting self-tasks for employee ID: " + id);
        
        // SUPER SIMPLE: Just get tasks where assignedBy equals the user ID
        List<SelfTask> tasks = selfTaskRepository.findByAssignedBy(id);
        
        System.out.println("SIMPLE RESULT: Found " + tasks.size() + " tasks for user " + id);
        
        // Log each task to verify
        for (SelfTask task : tasks) {
            System.out.println("Task: " + task.getTitle() + " (AssignedBy: " + task.getAssignedBy() + ")");
        }
        
        return tasks;
    }

    @Override
    public List<SelfTask> getAllSelfTasksForDebugging() {
        return selfTaskRepository.findAll();
    }

    @Override
    public String updateSelfTask(Long id, String status) 
    {
        Optional<SelfTask> selfTask = selfTaskRepository.findById(id);
        if (selfTask.isPresent()) {
            SelfTask st = selfTask.get();
            st.setStatus(status);
            selfTaskRepository.save(st);
            return "Self Task Updated Successfully";
        }
        return "Self Task Not Found";
    }

    @Override
    public String updateTaskProgress(TaskProgressDTO taskProgressDTO) 
    {
        TaskProgress taskProgress = new TaskProgress();
        taskProgress.setTaskid(taskProgressDTO.getTaskid());
        taskProgress.setProgress(taskProgressDTO.getProgress());
        taskProgress.setRemarks1(taskProgressDTO.getRemarks());
        taskProgress.setUpdatedBy(taskProgressDTO.getUpdatedBy());
        taskProgress.setReviewstatus("SUBMITTED FOR REVIEW");
        taskProgressRepository.save(taskProgress);
        return "Task Progress Updated Successfully";
    }

    @Override
    public void updateTask(Long id, double progress, String status) 
    {
        Optional<Task> task = taskRepository.findById(id);
        if (task.isPresent()) {
            Task t = task.get();
            t.setProgress(progress);
            t.setStatus(status);
            taskRepository.save(t);
        }
    }

    @Override
    public List<TaskProgressDTO> getTaskProgressByTaskId(Long taskId) 
    {
        List<TaskProgress> progressList = taskProgressRepository.findByTaskid(taskId);
        return progressList.stream().map(tp -> {
            TaskProgressDTO dto = new TaskProgressDTO();
            dto.setId(tp.getId());
            dto.setTaskid(tp.getTaskid());
            dto.setProgress(tp.getProgress());
            dto.setRemarks(tp.getRemarks1());
            dto.setReviewstatus(tp.getReviewstatus());
            dto.setProgressUpdatedTime(tp.getProgressUpdatedTime().toString());
            dto.setHasFile(tp.getProgressfile() != null);
            return dto;
        }).collect(Collectors.toList());
    }
}