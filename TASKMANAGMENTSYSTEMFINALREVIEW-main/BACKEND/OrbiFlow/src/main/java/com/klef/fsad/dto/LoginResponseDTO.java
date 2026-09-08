package com.klef.fsad.dto;

public class LoginResponseDTO 
{
    private Object user; // Admin, Manager, or Employee
    private String role;
    private String token;

    public Object getUser() {
        return user;
    }
    public void setUser(Object user) {
        this.user = user;
    }
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }
    @Override
    public String toString() {
        return "LoginResponseDTO [user=" + user + ", role=" + role + ", token=" + token + "]";
    }
}