package com.klef.fsad.dto;

public class LoginRequestDTO 
{
    private String usernameOrEmail;
    private String password;

    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }
    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    @Override
    public String toString() {
        return "LoginRequestDTO [usernameOrEmail=" + usernameOrEmail + ", password=" + password + "]";
    }
}