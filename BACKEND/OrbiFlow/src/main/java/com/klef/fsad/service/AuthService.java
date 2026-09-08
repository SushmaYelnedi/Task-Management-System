package com.klef.fsad.service;

import com.klef.fsad.dto.LoginResponseDTO;

public interface AuthService 
{
    public LoginResponseDTO verifyLogin(String usernameOrEmail, String password);
}