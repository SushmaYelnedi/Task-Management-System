package com.klef.fsad.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.klef.fsad.model.SelfTask;

@Repository
public interface SelfTaskRepository extends JpaRepository<SelfTask, Long> 
{
    // Original method - keep for backward compatibility
    List<SelfTask> findByAssignedBy(int id);
    
    // Add explicit query with strict filtering to ensure data integrity
    @Query("SELECT st FROM SelfTask st WHERE st.assignedBy = :userId ORDER BY st.taskAssignedTime DESC")
    List<SelfTask> findSelfTasksByUserId(@Param("userId") int userId);
    
    // Add method to check if task belongs to user
    @Query("SELECT COUNT(st) > 0 FROM SelfTask st WHERE st.id = :taskId AND st.assignedBy = :userId")
    boolean isTaskOwnedByUser(@Param("taskId") Long taskId, @Param("userId") int userId);
    
    // Add method to get all tasks with their assignedBy values for debugging
    @Query("SELECT st FROM SelfTask st ORDER BY st.id")
    List<SelfTask> findAllForDebugging();
    
    // Add method to delete tasks that don't belong to any valid user
    @Query("DELETE FROM SelfTask st WHERE st.assignedBy NOT IN (SELECT e.id FROM Employee e UNION SELECT m.id FROM Manager m)")
    void deleteOrphanedTasks();
}