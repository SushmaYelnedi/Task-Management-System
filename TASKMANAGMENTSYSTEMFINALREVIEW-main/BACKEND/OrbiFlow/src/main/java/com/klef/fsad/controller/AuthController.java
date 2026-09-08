package com.klef.fsad.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.klef.fsad.dto.LoginRequestDTO;
import com.klef.fsad.dto.LoginResponseDTO;
import com.klef.fsad.dto.RegistrationRequestDTO;
import com.klef.fsad.dto.RegistrationResponseDTO;
import com.klef.fsad.model.Employee;
import com.klef.fsad.model.Manager;
import com.klef.fsad.service.AuthService;
import com.klef.fsad.service.AdminService;
import com.klef.fsad.repository.AdminRepository;
import com.klef.fsad.repository.ManagerRepository;
import com.klef.fsad.repository.EmployeeRepository;
import org.springframework.web.bind.annotation.RequestParam;
import com.klef.fsad.security.JwtUtil;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController 
{
    @Autowired
    private AuthService authService;
    
    @Autowired
    private AdminService adminService;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Auth controller is working!");
    }

    @GetMapping("/db-test")
    public ResponseEntity<String> testDatabase() {
        try {
            long employeeCount = adminService.getAllEmployees().size();
            long managerCount = adminService.getAllManagers().size();
            return ResponseEntity.ok("Database connection OK. Employees: " + employeeCount + ", Managers: " + managerCount);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Database error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> verifyLogin(@RequestBody LoginRequestDTO loginRequest) 
    {
        // Log incoming login attempt (do not print raw password)
        String usernameOrEmail = loginRequest.getUsernameOrEmail();
        String password = loginRequest.getPassword();
        String maskedPwd = (password == null) ? "<null>" : (password.length() <= 2 ? "**" : "*" + password.substring(password.length()-2));
        System.out.println("AuthController: login attempt for: " + usernameOrEmail + " from IP: " + 
                           (requestIp() == null ? "unknown" : requestIp()) + ", pwd(masked): " + maskedPwd);

        LoginResponseDTO response = authService.verifyLogin(usernameOrEmail, password);
        if (response == null) {
            System.out.println("AuthController: login failed for: " + loginRequest.getUsernameOrEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login Failed");
        }

        // Build JWT claims
        Map<String, Object> claims = new HashMap<>();
        Object user = response.getUser();
        String role = response.getRole();
        String userId = "";

        try {
            if (user instanceof com.klef.fsad.model.Admin) {
                com.klef.fsad.model.Admin a = (com.klef.fsad.model.Admin) user;
                userId = a.getUsername();
            } else if (user instanceof com.klef.fsad.model.Manager) {
                com.klef.fsad.model.Manager m = (com.klef.fsad.model.Manager) user;
                userId = String.valueOf(m.getId());
            } else if (user instanceof com.klef.fsad.model.Employee) {
                com.klef.fsad.model.Employee e = (com.klef.fsad.model.Employee) user;
                userId = String.valueOf(e.getId());
            }
        } catch (Exception ex) {
            userId = "";
        }

        claims.put("role", role);
        claims.put("userId", userId);

        String token = jwtUtil.generateToken(claims, role);
        response.setToken(token);
        return ResponseEntity.ok(response);
    }

    // Temporary debug endpoint (development only) to inspect stored user records.
    // WARNING: Do NOT enable in production; exposes masked password information.
    @GetMapping("/debug-user")
    public ResponseEntity<?> debugUser(@RequestParam("u") String usernameOrEmail) {
        if (usernameOrEmail == null || usernameOrEmail.isEmpty()) {
            return ResponseEntity.badRequest().body("Missing parameter 'u'");
        }

        // Check admin by username
        try {
            com.klef.fsad.model.Admin admin = adminRepository.findByUsername(usernameOrEmail);
            if (admin != null) {
                String pwd = admin.getPassword() == null ? "<null>" : mask(admin.getPassword());
                return ResponseEntity.ok(Map.of("role", "ADMIN", "identifier", admin.getUsername(), "storedPassword", pwd));
            }
        } catch (Exception e) {
            // continue
        }

        try {
            com.klef.fsad.model.Manager manager = managerRepository.findByEmail(usernameOrEmail);
            if (manager != null) {
                String pwd = manager.getPassword() == null ? "<null>" : mask(manager.getPassword());
                return ResponseEntity.ok(Map.of("role", "MANAGER", "identifier", manager.getEmail(), "storedPassword", pwd));
            }
        } catch (Exception e) {
        }

        try {
            com.klef.fsad.model.Employee employee = employeeRepository.findByEmail(usernameOrEmail);
            if (employee != null) {
                String pwd = employee.getPassword() == null ? "<null>" : mask(employee.getPassword());
                return ResponseEntity.ok(Map.of("role", "EMPLOYEE", "identifier", employee.getEmail(), "storedPassword", pwd));
            }
        } catch (Exception e) {
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user found for: " + usernameOrEmail);
    }

    private String mask(String s) {
        if (s == null) return "<null>";
        if (s.length() <= 4) return "****";
        return s.substring(0,2) + "..." + s.substring(s.length()-2);
    }

    // Helper to try to obtain remote IP (best-effort)
    private String requestIp() {
        try {
            // attempt to read env or system properties — fallback to unknown
            return System.getenv("REMOTE_ADDR");
        } catch (Exception e) {
            return null;
        }
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponseDTO> registerUser(@RequestBody RegistrationRequestDTO request) {
        System.out.println("Registration request received: " + request.getName() + ", " + request.getEmail() + ", Role: " + request.getRole());
        
        try {
            String role = request.getRole();
            if (role == null || (!role.equals("Employee") && !role.equals("Manager"))) {
                System.out.println("Invalid role: " + role);
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
                
                if (request.getContact() != null && adminService.isEmployeeContactExist(request.getContact())) {
                    RegistrationResponseDTO response = new RegistrationResponseDTO();
                    response.setMessage("Contact already exists");
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
                
                if (request.getContact() != null && adminService.isManagerContactExist(request.getContact())) {
                    RegistrationResponseDTO response = new RegistrationResponseDTO();
                    response.setMessage("Contact already exists");
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
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            
            RegistrationResponseDTO response = new RegistrationResponseDTO();
            response.setMessage("Registration failed: " + e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(500).body(response);
        }
    }
}