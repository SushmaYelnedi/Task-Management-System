package com.klef.fsad.dto;

public class TaskProgressDTO 
{
    private Long id;
    private Long taskid;
    private int updatedBy;
    private double progress;
    private String remarks;
    private String reviewstatus;
    private String progressUpdatedTime;
    private boolean hasFile;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Long getTaskid() {
        return taskid;
    }
    public void setTaskid(Long taskid) {
        this.taskid = taskid;
    }
    public int getUpdatedBy() {
        return updatedBy;
    }
    public void setUpdatedBy(int updatedBy) {
        this.updatedBy = updatedBy;
    }
    public double getProgress() {
        return progress;
    }
    public void setProgress(double progress) {
        this.progress = progress;
    }
    public String getRemarks() {
        return remarks;
    }
    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
    public String getReviewstatus() {
        return reviewstatus;
    }
    public void setReviewstatus(String reviewstatus) {
        this.reviewstatus = reviewstatus;
    }
    public String getProgressUpdatedTime() {
        return progressUpdatedTime;
    }
    public void setProgressUpdatedTime(String progressUpdatedTime) {
        this.progressUpdatedTime = progressUpdatedTime;
    }
    public boolean isHasFile() {
        return hasFile;
    }
    public void setHasFile(boolean hasFile) {
        this.hasFile = hasFile;
    }
    @Override
    public String toString() {
        return "TaskProgressDTO [id=" + id + ", taskid=" + taskid + ", updatedBy=" + updatedBy + ", progress=" + progress
                + ", remarks=" + remarks + ", reviewstatus=" + reviewstatus + ", progressUpdatedTime="
                + progressUpdatedTime + ", hasFile=" + hasFile + "]";
    }
}