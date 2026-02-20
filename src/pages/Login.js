
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import * as yup from 'yup';

const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [apiError, setApiError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setApiError('');
        setFieldErrors({});
        try {
            await loginSchema.validate({ email, password }, { abortEarly: false });
            // Attempt login
            if (login(email, password)) {
                const from = location.state?.from?.pathname || '/';
                // Navigate to origin or home
                navigate(from, { replace: true });
            } else {
                // Set API error
                setApiError('Invalid credentials. Please check your email and password.');
            }
        } catch (err) {
            // Handle Yup validation errors
            if (err instanceof yup.ValidationError) {
                const errors = {};
                err.inner.forEach(error => {
                    errors[error.path] = error.message;
                });
                setFieldErrors(errors);
            } else {
                setApiError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">Login</h2>
                {/* API Error Alert */}
                {apiError && <div className="alert alert-danger" role="alert">{apiError}</div>}
                <form onSubmit={handleLogin} noValidate>
                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input
                            type="email"
                            className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                            }}
                        />
                        {/* Email Error */}
                        {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                            }}
                        />
                        {/* Password Error */}
                        {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
                    </div>
                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
                <div className="mt-3 text-muted small">
                    <p className="mb-1 fw-bold">Test Credentials:</p>
                    <div>User: ompatel@gmail.com</div>
                    <div>Pass: Test@123</div>
                </div>
            </div>
        </div>
    );
};

export default Login;
