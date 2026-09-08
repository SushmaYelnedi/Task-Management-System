package com.klef.fsad.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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
import com.klef.fsad.model.Employee;
import com.klef.fsad.model.SelfTask;
import com.klef.fsad.model.Task;
import com.klef.fsad.service.EmployeeService;

@RestController
@RequestMapping("/employee")
@CrossOrigin(origins = "*")
public class EmployeeController 
{
    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/profile/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable int id) {
        Employee employee = employeeService.getEmployeeById(id);
        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(employee);
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateEmployee(@RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.updateEmployee(employee));
    }

    @PutMapping("/updateimage/{id}")
    public ResponseEntity<String> updateEmployeeImage(@PathVariable int id, @RequestParam MultipartFile image) {
        try {
            byte[] imageBytes = image.getBytes();
            return ResponseEntity.ok(employeeService.updateEmployeeImage(id, imageBytes));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating image: " + e.getMessage());
        }
    }

    @PostMapping("/addselftask")
    public ResponseEntity<String> addSelfTask(@RequestBody SelfTask selfTask) {
        // Ensure the assignedBy field is set to the current user creating the task
        if (selfTask.getAssignedBy() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid assignedBy field");
        }
        selfTask.setStatus("ASSIGNED");
        System.out.println("Creating self-task for user: " + selfTask.getAssignedBy());
        return ResponseEntity.ok(employeeService.addSelfTask(selfTask));
    }

    @GetMapping("/tasks/assignedto/{id}")
    public ResponseEntity<List<Task>> getTasksAssignedTo(@PathVariable int id) {
        return ResponseEntity.ok(employeeService.getTasksAssignedTo(id));
    }

    @GetMapping("/selftasks/{id}")
    public ResponseEntity<List<SelfTask>> getSelfTasksByEmployee(@PathVariable int id) {
        System.out.println("SIMPLE: Getting self-tasks for employee " + id);
        List<SelfTask> tasks = employeeService.getSelfTasksByEmployee(id);
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/updateselftask")
    public ResponseEntity<String> updateSelfTask(@RequestBody SelfTask selfTask) {
        return ResponseEntity.ok(employeeService.updateSelfTask(selfTask.getId(), selfTask.getStatus()));
    }

    @PostMapping("/updatetaskprogress")
    public ResponseEntity<String> updateTaskProgress(@RequestBody TaskProgressDTO taskProgressDTO) {
        String result = employeeService.updateTaskProgress(taskProgressDTO);
        if (taskProgressDTO.getProgress() == 100) {
            employeeService.updateTask(taskProgressDTO.getTaskid(), taskProgressDTO.getProgress(), "COMPLETED");
        } else {
            employeeService.updateTask(taskProgressDTO.getTaskid(), taskProgressDTO.getProgress(), "IN_PROGRESS");
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/taskprogress/{taskId}")
    public ResponseEntity<List<TaskProgressDTO>> getTaskProgress(@PathVariable Long taskId) {
        return ResponseEntity.ok(employeeService.getTaskProgressByTaskId(taskId));
    }
}