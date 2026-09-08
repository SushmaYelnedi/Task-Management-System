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
@Table(name = "task_table")
public class Task 
{    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String subcategory;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private int assignedTo; // References Manager.id or Employee.id
    
    @Column(nullable = false)
    private int assignedBy; // References Manager.id

    @Column(length = 500)
    private String remarks;
    
    private double progress;
    
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
    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }
    public String getSubcategory() {
        return subcategory;
    }
    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
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
    public int getAssignedTo() {
        return assignedTo;
    }
    public void setAssignedTo(int assignedTo) {
        this.assignedTo = assignedTo;
    }
    public int getAssignedBy() {
        return assignedBy;
    }
    public void setAssignedBy(int assignedBy) {
        this.assignedBy = assignedBy;
    }
    public String getRemarks() {
        return remarks;
    }
    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
    public double getProgress() {
        return progress;
    }
    public void setProgress(double progress) {
        this.progress = progress;
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
        return "Task [id=" + id + ", category=" + category + ", subcategory=" + subcategory + ", name=" + name
                + ", description=" + description + ", startDate=" + startDate + ", endDate="
                + endDate + ", assignedTo=" + assignedTo + ", assignedBy=" + assignedBy + ", remarks=" + remarks
                + ", progress=" + progress + ", status=" + status + ", taskAssignedTime=" + taskAssignedTime + "]";
    }
}