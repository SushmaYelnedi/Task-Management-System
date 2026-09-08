package com.klef.fsad.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klef.fsad.model.Admin;
import com.klef.fsad.model.Employee;
import com.klef.fsad.model.Manager;
import com.klef.fsad.model.Task;
import com.klef.fsad.repository.AdminRepository;
import com.klef.fsad.repository.EmployeeRepository;
import com.klef.fsad.repository.ManagerRepository;
import com.klef.fsad.repository.TaskRepository;

@Service
public class AdminServiceImpl implements AdminService{
	
	 @Autowired
	    private AdminRepository adminRepository;
	    
	    @Autowired
	    private ManagerRepository managerRepository;
	    
	    @Autowired
	    private EmployeeRepository employeeRepository;
	    
	    @Autowired
	    private TaskRepository taskRepository;
	    
	    @Override
	    public Manager addManager(Manager manager) 
	    {
	        return managerRepository.save(manager);
	    }

	    @Override
	    public List<Manager> getAllManagers() 
	    {
	        return managerRepository.findAll();
	    }
	    
	    @Override
	    public String deleteManager(int id) 
	    {
	        managerRepository.deleteById(id);
	        return "Manager Deleted Successfully";
	    }
	    
	    @Override
	    public boolean isManagerEmailExist(String email) 
	    {
	        return managerRepository.findByEmail(email) != null;
	    }
    @Override
    public boolean isManagerContactExist(String contact) 
    {
        if (contact == null || contact.trim().isEmpty()) {
            return false;
        }
        return managerRepository.findByContact(contact) != null;
    }	    @Override
	    public Employee addEmployee(Employee employee) 
	    {
	        return employeeRepository.save(employee);
	    }

	    @Override
	    public List<Employee> getAllEmployees() 
	    {
	        return employeeRepository.findAll();
	    }

	    @Override
	    public String deleteEmployee(int id) 
	    {
	        employeeRepository.deleteById(id);
	        return "Employee Deleted Successfully";
	    }

	    @Override
	    public boolean isEmployeeEmailExist(String email) 
	    {
	        return employeeRepository.findByEmail(email) != null;
	    }

    @Override
    public boolean isEmployeeContactExist(String contact) 
    {
        if (contact == null || contact.trim().isEmpty()) {
            return false;
        }
        return employeeRepository.findByContact(contact) != null;
    }	    @Override
	    public Admin getAdminByUsername(String username) 
	    {
	        return adminRepository.findByUsername(username);
	    }

	    @Override
	    public String updateAdmin(Admin admin) 
	    {
	        Admin existing = adminRepository.findByUsername(admin.getUsername());
	        if (existing != null) {
	            existing.setPassword(admin.getPassword());
	            adminRepository.save(existing);
	            return "Admin Updated Successfully";
	        }
	        return "Admin Not Found";
	    }

	    @Override
	    public Manager getManagerById(int id) 
	    {
	        return managerRepository.findById(id).orElse(null);
	    }

	    @Override
	    public String updateManager(Manager manager) 
	    {
	        Manager existing = managerRepository.findById(manager.getId()).orElse(null);
	        if (existing != null) {
	            existing.setName(manager.getName());
	            existing.setGender(manager.getGender());
	            existing.setDepartment(manager.getDepartment());
	            existing.setContact(manager.getContact());
	            existing.setPassword(manager.getPassword());
	            managerRepository.save(existing);
	            return "Manager Updated Successfully";
	        }
	        return "Manager Not Found";
	    }

	    @Override
	    public Employee getEmployeeById(int id) 
	    {
	        return employeeRepository.findById(id).orElse(null);
	    }

	    @Override
	    public String updateEmployee(Employee employee) 
	    {
	        Employee existing = employeeRepository.findById(employee.getId()).orElse(null);
	        if (existing != null) {
	            existing.setName(employee.getName());
	            existing.setGender(employee.getGender());
	            existing.setDepartment(employee.getDepartment());
	            existing.setContact(employee.getContact());
	            existing.setPassword(employee.getPassword());
	            employeeRepository.save(existing);
	            return "Employee Updated Successfully";
	        }
	        return "Employee Not Found";
	    }

	    @Override
	    public List<Task> getAllTasks() 
	    {
	        return taskRepository.findAll();
	    }

	    @Override
	    public Map<String, Long> getTaskDashboardCounts() 
	    {
	        List<Task> tasks = taskRepository.findAll();
	        long totalTasks = tasks.size();
	        long assignedTasks = tasks.stream().filter(t -> t.getStatus().equals("ASSIGNED")).count();
	        long inProgressTasks = tasks.stream().filter(t -> t.getStatus().equals("IN_PROGRESS")).count();
	        long completedTasks = tasks.stream().filter(t -> t.getStatus().equals("COMPLETED")).count();
	        
	        Map<String, Long> counts = new HashMap<>();
	        counts.put("totalTasks", totalTasks);
	        counts.put("assignedTasks", assignedTasks);
	        counts.put("inProgressTasks", inProgressTasks);
	        counts.put("completedTasks", completedTasks);
	        return counts;
	    }

}
