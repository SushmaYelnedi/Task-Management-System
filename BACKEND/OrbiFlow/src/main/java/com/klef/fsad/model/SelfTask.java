package com.klef.fsad.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name="selftask_table")
public class SelfTask 
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private int assignedBy; // References Manager.id or Employee.id - MUST be current user

    // Add validation method
    public boolean belongsToUser(int userId) {
        return this.assignedBy == userId;
    }

    @Column(length = 500)
    private String status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime taskAssignedTime;

    @PrePersist
    protected void onCreate() {
        this.taskAssignedTime = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public LocalDate getStartDate() {
        return startDate;
    }
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    public LocalDate getEndDate() {
        return endDate;
    }
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    public int getAssignedBy() {
        return assignedBy;
    }
    public void setAssignedBy(int assignedBy) {
        this.assignedBy = assignedBy;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public LocalDateTime getTaskAssignedTime() {
        return taskAssignedTime;
    }
    public void setTaskAssignedTime(LocalDateTime taskAssignedTime) {
        this.taskAssignedTime = taskAssignedTime;
    }
    @Override
    public String toString() {
        return "SelfTask [id=" + id + ", title=" + title + ", description=" + description
                + ", startDate=" + startDate + ", endDate=" + endDate + ", assignedBy=" + assignedBy + ", status="
                + status + ", taskAssignedTime=" + taskAssignedTime + "]";
    }
}