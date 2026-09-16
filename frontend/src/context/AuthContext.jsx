import React, { createContext, useContext, useState, useCallback } from 'react';
import { loginRequest, signupRequest } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'vs_token';
const HOSPITAL_KEY = 'vs_hospital';

const readStored = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => readStored(TOKEN_KEY));
    const [hospital, setHospital] = useState(() => {
        const raw = readStored(HOSPITAL_KEY);
        return raw ? JSON.parse(raw) : null;
    });

    const persist = (data, remember = true) => {
        const store = remember ? localStorage : sessionStorage;
        const other = remember ? sessionStorage : localStorage;
        other.removeItem(TOKEN_KEY);
        other.removeItem(HOSPITAL_KEY);
        store.setItem(TOKEN_KEY, data.access_token);
        store.setItem(HOSPITAL_KEY, JSON.stringify(data.hospital));
        setToken(data.access_token);
        setHospital(data.hospital);
    };

    const login = useCallback(async (email, password, remember = true) => {
        const data = await loginRequest(email, password);
        persist(data, remember);
        return data;
    }, []);

    const signup = useCallback(async (hospitalName, email, password, plan, hospitalCount) => {
        // Signup no longer returns a token — new hospitals are "pending" until an
        // admin approves them, so there's nothing to persist here.
        const data = await signupRequest(hospitalName, email, password, plan, hospitalCount);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(HOSPITAL_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(HOSPITAL_KEY);
        setToken(null);
        setHospital(null);
    }, []);

    return (
        <AuthContext.Provider value={{ token, hospital, isAuthenticated: !!token, isAdmin: !!hospital?.is_admin, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const getStoredToken = () => readStored(TOKEN_KEY);
