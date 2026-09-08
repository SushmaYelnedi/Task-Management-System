package com.klef.fsad.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klef.fsad.model.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> 
{
    List<Task> findByAssignedBy(int id);
    List<Task> findByAssignedTo(int id);
}