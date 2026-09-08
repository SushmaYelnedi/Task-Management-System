package com.klef.fsad.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klef.fsad.model.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> 
{
    Employee findByEmailAndPassword(String email, String password);
    Employee findByEmail(String email);
    Employee findByContact(String contact);
    Optional<Employee> findById(int id);
}