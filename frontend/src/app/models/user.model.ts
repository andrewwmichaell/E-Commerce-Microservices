export interface User {
    userId: number;
    username: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    userId: number;
    username: string;
    email: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}
