package com.klef.fsad.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klef.fsad.model.TaskProgress;

@Repository
public interface TaskProgressRepository extends JpaRepository<TaskProgress, Long> 
{
    List<TaskProgress> findByTaskid(Long id);
    Optional<TaskProgress> findById(Long id);
}