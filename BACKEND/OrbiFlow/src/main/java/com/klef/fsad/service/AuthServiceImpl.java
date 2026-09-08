package com.klef.fsad.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.klef.fsad.Roles;
import com.klef.fsad.model.Admin;
import com.klef.fsad.model.Employee;
import com.klef.fsad.model.Manager;
import com.klef.fsad.repository.AdminRepository;
import com.klef.fsad.repository.EmployeeRepository;
import com.klef.fsad.repository.ManagerRepository;
import com.klef.fsad.dto.LoginResponseDTO;

@Service
public class AuthServiceImpl implements AuthService 
{
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public LoginResponseDTO verifyLogin(String usernameOrEmail, String password) 
    {
        System.out.println("AuthService: verifyLogin called with usernameOrEmail='" + usernameOrEmail + "'");
        LoginResponseDTO response = new LoginResponseDTO();

        // Try admin by username
        try {
            com.klef.fsad.model.Admin admin = adminRepository.findByUsername(usernameOrEmail);
            if (admin != null) {
                String stored = admin.getPassword();
                if (stored != null && (stored.equals(password) || passwordEncoder.matches(password, stored))) {
                    System.out.println("AuthService: matched admin user: " + admin.getUsername());
                    response.setUser(admin);
                    response.setRole(Roles.ADMIN_ROLE);
                    return response;
                }
            }
        } catch (Exception e) {
            System.out.println("AuthService: admin check error: " + e.getMessage());
        }

        // Try manager by email
        try {
            com.klef.fsad.model.Manager manager = managerRepository.findByEmail(usernameOrEmail);
            if (manager != null) {
                String stored = manager.getPassword();
                if (stored != null && (stored.equals(password) || passwordEncoder.matches(password, stored))) {
                    System.out.println("AuthService: matched manager user: " + manager.getEmail());
                    response.setUser(manager);
                    response.setRole(Roles.MANAGER_ROLE);
                    return response;
                }
            }
        } catch (Exception e) {
            System.out.println("AuthService: manager check error: " + e.getMessage());
        }

        // Try employee by email
        try {
            com.klef.fsad.model.Employee employee = employeeRepository.findByEmail(usernameOrEmail);
            if (employee != null) {
                String stored = employee.getPassword();
                if (stored != null && (stored.equals(password) || passwordEncoder.matches(password, stored))) {
                    System.out.println("AuthService: matched employee user: " + employee.getEmail());
                    response.setUser(employee);
                    response.setRole(Roles.EMPLOYEE_ROLE);
                    return response;
                }
            }
        } catch (Exception e) {
            System.out.println("AuthService: employee check error: " + e.getMessage());
        }

        System.out.println("AuthService: no matching user found for '" + usernameOrEmail + "'");
        return null;
    }
}