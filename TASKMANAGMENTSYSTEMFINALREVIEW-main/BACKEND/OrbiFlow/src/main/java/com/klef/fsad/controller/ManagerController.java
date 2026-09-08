package com.klef.fsad.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.klef.fsad.dto.TaskProgressDTO;
import com.klef.fsad.dto.BulkTaskAssignmentDTO;
import com.klef.fsad.model.Manager;
import com.klef.fsad.model.SelfTask;
import com.klef.fsad.model.Task;
import com.klef.fsad.service.ManagerService;

@RestController
@RequestMapping("/manager")
@CrossOrigin(origins = "*")
public class ManagerController 
{
    @Autowired
    private ManagerService managerService;

    @GetMapping("/profile/{id}")
    public ResponseEntity<Manager> getManagerById(@PathVariable int id) {
        Manager manager = managerService.getManagerById(id);
        if (manager == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(manager);
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateManager(@RequestBody Manager manager) {
        return ResponseEntity.ok(managerService.updateManager(manager));
    }

    @PutMapping("/updateimage/{id}")
    public ResponseEntity<String> updateManagerImage(@PathVariable int id, @RequestParam MultipartFile image) {
        try {
            byte[] imageBytes = image.getBytes();
            return ResponseEntity.ok(managerService.updateManagerImage(id, imageBytes));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating image: " + e.getMessage());
        }
    }

    @PostMapping("/addtask")
    public ResponseEntity<String> addTask(@RequestBody Task task) {
        task.setStatus("ASSIGNED");
        task.setProgress(0);
        return ResponseEntity.ok(managerService.addTask(task));
    }

    @PostMapping("/addtasks-bulk")
    public ResponseEntity<String> addTasksBulk(@RequestBody BulkTaskAssignmentDTO bulkTaskAssignmentDTO) {
        String result = managerService.addTasksBulk(bulkTaskAssignmentDTO);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/addselftask")
    public ResponseEntity<String> addSelfTask(@RequestBody SelfTask selfTask) {
        // Ensure the assignedBy field is set to the current user creating the task
        if (selfTask.getAssignedBy() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid assignedBy field");
        }
        selfTask.setStatus("ASSIGNED");
        System.out.println("Creating self-task for manager: " + selfTask.getAssignedBy());
        return ResponseEntity.ok(managerService.addSelfTask(selfTask));
    }

    @GetMapping("/tasks/assignedby/{id}")
    public ResponseEntity<List<Task>> getTasksAssignedBy(@PathVariable int id) {
        return ResponseEntity.ok(managerService.getTasksAssignedBy(id));
    }

    @GetMapping("/tasks/assignedto/{id}")
    public ResponseEntity<List<Task>> getTasksAssignedTo(@PathVariable int id) {
        return ResponseEntity.ok(managerService.getTasksAssignedTo(id));
    }

    @GetMapping("/selftasks/{id}")
    public ResponseEntity<List<SelfTask>> getSelfTasksByManager(@PathVariable int id) {
        System.out.println("SIMPLE: Getting self-tasks for manager " + id);
        List<SelfTask> tasks = managerService.getSelfTasksByManager(id);
        return ResponseEntity.ok(tasks);
    }

    @DeleteMapping("/deletetask/{id}")
    public ResponseEntity<String> deleteTask(@PathVariable Long id) {
        return ResponseEntity.ok(managerService.deleteTask(id));
    }

    @PutMapping("/updateselftask")
    public ResponseEntity<String> updateSelfTask(@RequestBody SelfTask selfTask) {
        return ResponseEntity.ok(managerService.updateSelfTask(selfTask.getId(), selfTask.getStatus()));
    }

    @PutMapping("/updateselftaskdetails")
    public ResponseEntity<String> updateSelfTaskDetails(@RequestBody SelfTask selfTask) {
        // Prevent updates to tasks that are already COMPLETED
        if (selfTask.getStatus() != null && "COMPLETED".equalsIgnoreCase(selfTask.getStatus())) {
            // Allow updating non-status fields if needed? For now, block to match frontend policy
            System.out.println("Attempt to update a completed self-task: " + selfTask.getId());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot modify a completed task");
        }
        return ResponseEntity.ok(managerService.updateSelfTaskDetails(selfTask));
    }

    @PutMapping("/updatetask")
    public ResponseEntity<String> updateTaskDetails(@RequestBody Task task) {
        // Delegate to service which will validate and prevent updates to completed tasks
        String result = managerService.updateTaskDetails(task);
        if ("Cannot modify a completed task".equalsIgnoreCase(result)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/deleteselftask/{id}")
    public ResponseEntity<String> deleteSelfTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(managerService.deleteSelfTask(id));
    }

    @PostMapping("/updatetaskprogress")
    public ResponseEntity<String> updateTaskProgress(@RequestBody TaskProgressDTO taskProgressDTO) {
        String result = managerService.updateTaskProgress(taskProgressDTO);
        if (taskProgressDTO.getProgress() == 100) {
            managerService.updateTask(taskProgressDTO.getTaskid(), taskProgressDTO.getProgress(), "COMPLETED");
        } else {
            managerService.updateTask(taskProgressDTO.getTaskid(), taskProgressDTO.getProgress(), "IN_PROGRESS");
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/taskprogress/{taskId}")
    public ResponseEntity<List<TaskProgressDTO>> getTaskProgress(@PathVariable Long taskId) {
        return ResponseEntity.ok(managerService.getTaskProgressByTaskId(taskId));
    }

    // Debug endpoint to see ALL self-tasks in database
    @GetMapping("/debug/all-selftasks")
    public ResponseEntity<String> showAllSelfTasks() {
        try {
            List<SelfTask> allTasks = managerService.getAllSelfTasksForDebugging();
            
            StringBuilder result = new StringBuilder();
            result.append("=== ALL SELF-TASKS IN DATABASE ===\n");
            result.append("Total tasks: ").append(allTasks.size()).append("\n\n");
            
            for (SelfTask task : allTasks) {
                result.append("Task ID: ").append(task.getId())
                      .append(", Title: '").append(task.getTitle()).append("'")
                      .append(", AssignedBy: ").append(task.getAssignedBy())
                      .append(", Status: ").append(task.getStatus())
                      .append(", Created: ").append(task.getTaskAssignedTime())
                      .append("\n");
            }
            
            System.out.println(result.toString());
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error: " + e.getMessage());
        }
    }

    // Nuclear option: Delete ALL self-tasks and start fresh
    @DeleteMapping("/debug/clear-all-selftasks")
    public ResponseEntity<String> clearAllSelfTasks() {
        try {
            List<SelfTask> allTasks = managerService.getAllSelfTasksForDebugging();
            int taskCount = allTasks.size();
            
            // Delete all self-tasks
            for (SelfTask task : allTasks) {
                managerService.deleteSelfTask(task.getId());
            }
            
            String message = "NUCLEAR RESET COMPLETE: Deleted " + taskCount + " self-tasks. Database is now clean.";
            System.out.println(message);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error during reset: " + e.getMessage());
        }
    }
}