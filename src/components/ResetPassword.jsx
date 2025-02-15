import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  // Use URL search parameters to retrieve the token
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handler for the password reset form submission
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Simple validation to check if both password fields match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // Make the POST request to the reset-password endpoint with the token in the query
      const response = await axios.post(
        `http://localhost:3000/api/v1/auth/password/reset-password?token=${token}`,
        { newPassword }
      );
      setMessage("Password has been reset successfully. You can now login with your new password.");
      setError('');
    } catch (err) {
      console.error('Error resetting password:', err);
      setError("Failed to reset password. Please try again.");
      setMessage('');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Reset Password</h2>
      {token ? (
        <form onSubmit={handlePasswordReset}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 15px' }}>
            Reset Password
          </button>
        </form>
      ) : (
        <p>No token provided. Please check your reset link.</p>
      )}
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      {message && <p style={{ color: 'green', marginTop: '15px' }}>{message}</p>}
    </div>
  );
}

export default ResetPassword; 