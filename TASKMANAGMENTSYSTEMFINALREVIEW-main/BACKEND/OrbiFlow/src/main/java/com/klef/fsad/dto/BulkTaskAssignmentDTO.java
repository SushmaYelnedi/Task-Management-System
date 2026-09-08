package com.klef.fsad.dto;

import java.time.LocalDate;
import java.util.List;

public class BulkTaskAssignmentDTO {

    private String category;
    private String subcategory;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String remarks;
    private int assignedBy;
    private List<Integer> employeeIds;

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
    public String getRemarks() {
        return remarks;
    }
    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
    public int getAssignedBy() {
        return assignedBy;
    }
    public void setAssignedBy(int assignedBy) {
        this.assignedBy = assignedBy;
    }
    public List<Integer> getEmployeeIds() {
        return employeeIds;
    }
    public void setEmployeeIds(List<Integer> employeeIds) {
        this.employeeIds = employeeIds;
    }
}


