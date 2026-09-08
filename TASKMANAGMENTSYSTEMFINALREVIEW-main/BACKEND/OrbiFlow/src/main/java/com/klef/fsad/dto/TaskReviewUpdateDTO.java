package com.klef.fsad.dto;

public class TaskReviewUpdateDTO 
{
    private Long taskId;
    private String status;
    private String remarks;

    public Long getTaskId() {
        return taskId;
    }
    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getRemarks() {
        return remarks;
    }
    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
    @Override
    public String toString() {
        return "TaskReviewUpdateDTO [taskId=" + taskId + ", status=" + status + ", remarks=" + remarks + "]";
    }
}