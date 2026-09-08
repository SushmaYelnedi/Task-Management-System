package com.klef.fsad.controller;

import java.util.List;
import java.util.Map;

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
import org.springframework.web.bind.annotation.RestController;

import com.klef.fsad.model.Admin;
import com.klef.fsad.model.Employee;
import com.klef.fsad.model.Manager;
import com.klef.fsad.model.Task;
import com.klef.fsad.service.AdminService;
import com.klef.fsad.dto.RegistrationRequestDTO;
import com.klef.fsad.dto.RegistrationResponseDTO;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController 
{
    @Autowired
    private AdminService adminService;

    @GetMapping("/test")
    public ResponseEntity<String> testAdminEndpoint() {
        return ResponseEntity.ok("Admin controller is working!");
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponseDTO> registerUser(@RequestBody RegistrationRequestDTO request) {
        try {
            String role = request.getRole();
            if (role == null || (!role.equals("Employee") && !role.equals("Manager"))) {
                RegistrationResponseDTO response = new RegistrationResponseDTO();
                response.setMessage("Invalid role. Only Employee or Manager allowed");
                response.setSuccess(false);
                return ResponseEntity.badRequest().body(response);
            }

            if (role.equals("Employee")) {
                if (adminService.isEmployeeEmailExist(request.getEmail())) {
                    RegistrationResponseDTO response = new RegistrationResponseDTO();
                    response.setMessage("Email already exists");
                    response.setSuccess(false);
                    return ResponseEntity.badRequest().body(response);
                }
                
                Employee employee = new Employee();
                employee.setName(request.getName());
                employee.setEmail(request.getEmail());
                employee.setPassword(request.getPassword());
                employee.setContact(request.getContact());
                employee.setGender(request.getGender());
                employee.setDepartment(request.getDepartment());
                
                adminService.addEmployee(employee);
                
                RegistrationResponseDTO response = new RegistrationResponseDTO();
                response.setMessage("Employee registered successfully");
                response.setSuccess(true);
                response.setUserId(employee.getId());
                response.setRole("Employee");
                return ResponseEntity.ok(response);
            } else {
                if (adminService.isManagerEmailExist(request.getEmail())) {
                    RegistrationResponseDTO response = new RegistrationResponseDTO();
                    response.setMessage("Email already exists");
                    response.setSuccess(false);
                    return ResponseEntity.badRequest().body(response);
                }
                
                Manager manager = new Manager();
                manager.setName(request.getName());
                manager.setEmail(request.getEmail());
                manager.setPassword(request.getPassword());
                manager.setContact(request.getContact());
                manager.setGender(request.getGender());
                manager.setDepartment(request.getDepartment());
                
                adminService.addManager(manager);
                
                RegistrationResponseDTO response = new RegistrationResponseDTO();
                response.setMessage("Manager registered successfully");
                response.setSuccess(true);
                response.setUserId(manager.getId());
                response.setRole("Manager");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            RegistrationResponseDTO response = new RegistrationResponseDTO();
            response.setMessage("Registration failed: " + e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/addmanager")
    public ResponseEntity<String> addManager(@RequestBody Manager manager) {
        if (adminService.isManagerEmailExist(manager.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists");
        }
        if (adminService.isManagerContactExist(manager.getContact())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Contact number already exists");
        }
        adminService.addManager(manager);
        return ResponseEntity.status(HttpStatus.CREATED).body("Manager Added Successfully");
    }

    @GetMapping("/managers")
    public ResponseEntity<List<Manager>> getAllManagers() {
        return ResponseEntity.ok(adminService.getAllManagers());
    }

    @DeleteMapping("/deletemanager/{id}")
    public ResponseEntity<String> deleteManager(@PathVariable int id) {
        return ResponseEntity.ok(adminService.deleteManager(id));
    }

    @PostMapping("/addemployee")
    public ResponseEntity<String> addEmployee(@RequestBody Employee employee) {
        if (adminService.isEmployeeEmailExist(employee.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email already exists");
        }
        if (adminService.isEmployeeContactExist(employee.getContact())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Contact number already exists");
        }
        adminService.addEmployee(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body("Employee Added Successfully");
    }

    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(adminService.getAllEmployees());
    }

    @DeleteMapping("/deleteemployee/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable int id) {
        return ResponseEntity.ok(adminService.deleteEmployee(id));
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<Admin> getAdminByUsername(@PathVariable String username) {
        Admin admin = adminService.getAdminByUsername(username);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(admin);
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateAdmin(@RequestBody Admin admin) {
        return ResponseEntity.ok(adminService.updateAdmin(admin));
    }

    @GetMapping("/manager/{id}")
    public ResponseEntity<Manager> getManagerById(@PathVariable int id) {
        Manager manager = adminService.getManagerById(id);
        if (manager == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(manager);
    }

    @PutMapping("/updatemanager")
    public ResponseEntity<String> updateManager(@RequestBody Manager manager) {
        return ResponseEntity.ok(adminService.updateManager(manager));
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable int id) {
        Employee employee = adminService.getEmployeeById(id);
        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(employee);
    }

    @PutMapping("/updateemployee")
    public ResponseEntity<String> updateEmployee(@RequestBody Employee employee) {
        return ResponseEntity.ok(adminService.updateEmployee(employee));
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(adminService.getAllTasks());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> getTaskDashboardCounts() {
        return ResponseEntity.ok(adminService.getTaskDashboardCounts());
    }
}