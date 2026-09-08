package com.klef.fsad.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.sql.rowset.serial.SerialBlob;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klef.fsad.model.Manager;
import com.klef.fsad.model.SelfTask;
import com.klef.fsad.model.Task;
import com.klef.fsad.model.TaskProgress;
import com.klef.fsad.repository.EmployeeRepository;
import com.klef.fsad.repository.ManagerRepository;
import com.klef.fsad.repository.SelfTaskRepository;
import com.klef.fsad.repository.TaskProgressRepository;
import com.klef.fsad.repository.TaskRepository;
import com.klef.fsad.dto.TaskProgressDTO;
import com.klef.fsad.dto.BulkTaskAssignmentDTO;

@Service
public class ManagerServiceImpl implements ManagerService 
{
    @Autowired
    private ManagerRepository managerRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private SelfTaskRepository selfTaskRepository;
    
    @Autowired
    private TaskProgressRepository taskProgressRepository;

    @Override
    public Manager verifyManagerLogin(String email, String password) 
    {
        return managerRepository.findByEmailAndPassword(email, password);
    }

    @Override
    public Manager getManagerById(int id) 
    {
        return managerRepository.findById(id).orElse(null);
    }

    @Override
    public String updateManager(Manager manager) 
    {
        Optional<Manager> existing = managerRepository.findById(manager.getId());
        if (existing.isPresent()) {
            Manager m = existing.get();
            m.setName(manager.getName());
            m.setGender(manager.getGender());
            m.setDepartment(manager.getDepartment());
            m.setContact(manager.getContact());
            m.setPassword(manager.getPassword());
            managerRepository.save(m);
            return "Manager Updated Successfully";
        }
        return "Manager Not Found";
    }

    @Override
    public String updateManagerImage(int id, byte[] imageBytes) 
    {
        try {
            Manager manager = managerRepository.findById(id).orElse(null);
            if (manager == null) {
                return "Manager Not Found";
            }
            SerialBlob serialBlob = new SerialBlob(imageBytes);
            manager.setUserimage(serialBlob);
            managerRepository.save(manager);
            return "Manager Image Updated Successfully";
        } catch (Exception e) {
            return "Error updating image: " + e.getMessage();
        }
    }

    @Override
    public String addTask(Task task) 
    {
        // Validate assignedTo is an Employee
        if (employeeRepository.findById(task.getAssignedTo()).isEmpty()) {
            return "Invalid Employee ID";
        }
        taskRepository.save(task);
        return "Task Assigned Successfully";
    }

    @Override
    public String addTasksBulk(BulkTaskAssignmentDTO bulkTaskAssignmentDTO) {
        if (bulkTaskAssignmentDTO == null || bulkTaskAssignmentDTO.getEmployeeIds() == null || bulkTaskAssignmentDTO.getEmployeeIds().isEmpty()) {
            return "No employees provided";
        }

        int successCount = 0;
        List<Integer> invalidEmployees = new ArrayList<>();

        for (Integer employeeId : bulkTaskAssignmentDTO.getEmployeeIds()) {
            if (employeeId == null || employeeRepository.findById(employeeId).isEmpty()) {
                invalidEmployees.add(employeeId);
                continue;
            }

            Task task = new Task();
            task.setCategory(bulkTaskAssignmentDTO.getCategory());
            task.setSubcategory(bulkTaskAssignmentDTO.getSubcategory());
            task.setName(bulkTaskAssignmentDTO.getName());
            task.setDescription(bulkTaskAssignmentDTO.getDescription());
            task.setStartDate(bulkTaskAssignmentDTO.getStartDate());
            task.setEndDate(bulkTaskAssignmentDTO.getEndDate());
            task.setRemarks(bulkTaskAssignmentDTO.getRemarks());
            task.setAssignedBy(bulkTaskAssignmentDTO.getAssignedBy());
            task.setAssignedTo(employeeId);
            task.setStatus("ASSIGNED");
            task.setProgress(0);

            taskRepository.save(task);
            successCount++;
        }

        if (invalidEmployees.isEmpty()) {
            return "Tasks assigned successfully to " + successCount + " employees";
        }
        return "Tasks assigned to " + successCount + " employees; invalid IDs: " + invalidEmployees.toString();
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
        
        System.out.println("Adding self-task for manager " + selfTask.getAssignedBy() + ": " + selfTask.getTitle());
        selfTaskRepository.save(selfTask);
        return "Self Task Added Successfully";
    }

    @Override
    public List<Task> getTasksAssignedBy(int id) 
    {
        return taskRepository.findByAssignedBy(id);
    }

    @Override
    public List<Task> getTasksAssignedTo(int id) 
    {
        return taskRepository.findByAssignedTo(id);
    }

    @Override
    public List<SelfTask> getSelfTasksByManager(int id) 
    {
        System.out.println("SIMPLE FIX: Getting self-tasks for manager ID: " + id);
        
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
    public String deleteSelfTask(Long id) {
        try {
            selfTaskRepository.deleteById(id);
            return "Self-task deleted successfully";
        } catch (Exception e) {
            return "Error deleting self-task: " + e.getMessage();
        }
    }

    @Override
    public String deleteTask(Long id) 
    {
        taskRepository.deleteById(id);
        return "Task Deleted Successfully";
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
    public String updateSelfTaskDetails(SelfTask selfTask) {
        if (selfTask == null || selfTask.getId() == null) {
            return "Invalid task data";
        }

        Optional<SelfTask> existingOpt = selfTaskRepository.findById(selfTask.getId());
        if (existingOpt.isEmpty()) {
            return "Self Task Not Found";
        }

        SelfTask existing = existingOpt.get();

        // Do not allow changes if existing task is already COMPLETED
        if (existing.getStatus() != null && "COMPLETED".equalsIgnoreCase(existing.getStatus())) {
            return "Cannot modify a completed task";
        }

        // Update fields (title, description, dates, status)
        if (selfTask.getTitle() != null) existing.setTitle(selfTask.getTitle());
        if (selfTask.getDescription() != null) existing.setDescription(selfTask.getDescription());
        if (selfTask.getStartDate() != null) existing.setStartDate(selfTask.getStartDate());
        if (selfTask.getEndDate() != null) existing.setEndDate(selfTask.getEndDate());
        if (selfTask.getStatus() != null) existing.setStatus(selfTask.getStatus());

        selfTaskRepository.save(existing);
        return "Self Task Details Updated Successfully";
    }

    @Override
    public String updateTaskDetails(Task task) {
        if (task == null || task.getId() == null) {
            return "Invalid task data";
        }

        Optional<Task> existingOpt = taskRepository.findById(task.getId());
        if (existingOpt.isEmpty()) {
            return "Task Not Found";
        }

        Task existing = existingOpt.get();

        // Prevent modifying a task that is already completed
        if (existing.getStatus() != null && "COMPLETED".equalsIgnoreCase(existing.getStatus())) {
            return "Cannot modify a completed task";
        }

        // Update allowed fields if provided
        if (task.getName() != null) existing.setName(task.getName());
        if (task.getDescription() != null) existing.setDescription(task.getDescription());
        if (task.getCategory() != null) existing.setCategory(task.getCategory());
        if (task.getSubcategory() != null) existing.setSubcategory(task.getSubcategory());
        if (task.getStartDate() != null) existing.setStartDate(task.getStartDate());
        if (task.getEndDate() != null) existing.setEndDate(task.getEndDate());
        if (task.getRemarks() != null) existing.setRemarks(task.getRemarks());
        if (task.getAssignedTo() != 0) existing.setAssignedTo(task.getAssignedTo());
        if (task.getAssignedBy() != 0) existing.setAssignedBy(task.getAssignedBy());
        if (task.getStatus() != null) existing.setStatus(task.getStatus());
        // Update progress if non-zero (caller can send 0 to leave unchanged)
        if (task.getProgress() != 0.0) existing.setProgress(task.getProgress());

        taskRepository.save(existing);
        return "Task Updated Successfully";
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