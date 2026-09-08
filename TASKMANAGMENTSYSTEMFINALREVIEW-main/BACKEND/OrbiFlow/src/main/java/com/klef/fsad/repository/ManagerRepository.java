package com.klef.fsad.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klef.fsad.model.Manager;

@Repository
public interface ManagerRepository extends JpaRepository<Manager, Integer> 
{
    Manager findByEmailAndPassword(String email, String password);
    Manager findByEmail(String email);
    Manager findByContact(String contact);
    Optional<Manager> findById(int id);
}