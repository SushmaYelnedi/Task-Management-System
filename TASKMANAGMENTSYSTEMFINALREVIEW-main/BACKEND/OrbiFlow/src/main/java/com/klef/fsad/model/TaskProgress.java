package com.klef.fsad.model;

import java.sql.Blob;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "task_progress_table")
public class TaskProgress 
{    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long taskid;

    @Column(nullable = false)
    private int updatedBy;
    
    @Column(nullable = false)
    private double progress;
    
    @Column(length = 500)
    private String remarks1;
    
    @Column(length = 500)
    private String remarks2;
    
    @Column(length = 500)
    private String reviewstatus;
    
    @JsonIgnore
    @Lob
    private Blob progressfile;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime progressUpdatedTime;

    @PrePersist
    protected void onCreate() {
        this.progressUpdatedTime = LocalDateTime.now();
    }

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
    public String getRemarks1() {
        return remarks1;
    }
    public void setRemarks1(String remarks1) {
        this.remarks1 = remarks1;
    }
    public String getRemarks2() {
        return remarks2;
    }
    public void setRemarks2(String remarks2) {
        this.remarks2 = remarks2;
    }
    public String getReviewstatus() {
        return reviewstatus;
    }
    public void setReviewstatus(String reviewstatus) {
        this.reviewstatus = reviewstatus;
    }
    public Blob getProgressfile() {
        return progressfile;
    }
    public void setProgressfile(Blob progressfile) {
        this.progressfile = progressfile;
    }
    public LocalDateTime getProgressUpdatedTime() {
        return progressUpdatedTime;
    }
    public void setProgressUpdatedTime(LocalDateTime progressUpdatedTime) {
        this.progressUpdatedTime = progressUpdatedTime;
    }
    @Override
    public String toString() {
        return "TaskProgress [id=" + id + ", taskid=" + taskid + ", updatedBy=" + updatedBy + ", progress=" + progress
                + ", remarks1=" + remarks1 + ", remarks2=" + remarks2 + ", reviewstatus=" + reviewstatus
                + ", progressfile=" + progressfile + ", progressUpdatedTime=" + progressUpdatedTime + "]";
    }
}