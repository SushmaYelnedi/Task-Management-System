package com.klef.fsad.service;

import java.util.List;
import java.util.Map;

import com.klef.fsad.model.Admin;
import com.klef.fsad.model.Employee;
import com.klef.fsad.model.Manager;
import com.klef.fsad.model.Task;

public interface AdminService {
	
	public Manager addManager(Manager manager);
    public List<Manager> getAllManagers();
    public String deleteManager(int id);
    public boolean isManagerEmailExist(String email);
    public boolean isManagerContactExist(String contact);
    
    public Employee addEmployee(Employee employee);
    public List<Employee> getAllEmployees();
    public String deleteEmployee(int id);
    public boolean isEmployeeEmailExist(String email);
    public boolean isEmployeeContactExist(String contact);
    
    public Admin getAdminByUsername(String username);
    public String updateAdmin(Admin admin);
    public Manager getManagerById(int id);
    public String updateManager(Manager manager);
    public Employee getEmployeeById(int id);
    public String updateEmployee(Employee employee);
    
    public List<Task> getAllTasks();
    public Map<String, Long> getTaskDashboardCounts();
    

}
