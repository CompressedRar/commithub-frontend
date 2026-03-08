import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Container, Paper, TextField, Button, Typography, 
  Box, Alert, CircularProgress, IconButton, InputAdornment,
  LinearProgress, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";
import { 
  Visibility, VisibilityOff, CheckCircle, Cancel 
} from "@mui/icons-material";
import { updateForgotPassword, verifyForgotPass } from "../services/userService";

export default function ChangeForgotPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [userID, setUserID] = useState(null);
    const [passwords, setPasswords] = useState({ new: "", confirm: "" });
    const [showPassword, setShowPassword] = useState(false);
    
    // Status States
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Password Validation Logic
    const validation = useMemo(() => {
        const p = passwords.new;
        return {
            hasMinLength: p.length >= 8,
            hasUppercase: /[A-Z]/.test(p),
            hasLowercase: /[a-z]/.test(p),
            hasNumber: /[0-9]/.test(p),
            isMatched: p === passwords.confirm && p !== ""
        };
    }, [passwords]);

    const strength = useMemo(() => {
        const checks = [
            validation.hasMinLength,
            validation.hasUppercase,
            validation.hasLowercase,
            validation.hasNumber
        ].filter(Boolean).length;

        if (checks <= 2) return { label: "Weak", color: "error", value: 25 };
        if (checks === 3) return { label: "Medium", color: "warning", value: 60 };
        return { label: "Strong", color: "success", value: 100 };
    }, [validation]);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const res = await verifyForgotPass(token);
                if (res.data?.user_id) setUserID(res.data.user_id);
                else setError("This link is invalid or has expired.");
            } catch (err) {
                setError("Verification failed. The link may be expired.");
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const allValid = Object.values(validation).every(Boolean);
        if (!allValid) return setError("Please meet all password requirements.");
        
        setSubmitting(true);
        setError("");
        
        try {
            await updateForgotPassword(userID, { password: passwords.new });
            setSuccess(true);
            setTimeout(() => navigate("/"), 3000);
        } catch (err) {
            setError("Failed to update password. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Container maxWidth="sm">
            <Box mt={8}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                        Reset Your Password
                    </Typography>
                    
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>Password updated! Redirecting...</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth label="New Password"
                            type={showPassword ? "text" : "password"}
                            margin="normal" required
                            disabled={!userID || success}
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Password Strength Indicator */}
                        {passwords.new && (
                            <Box sx={{ mt: 1, mb: 2 }}>
                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="caption" fontWeight="bold" color={`${strength.color}.main`}>
                                        Strength: {strength.label}
                                    </Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={strength.value} 
                                    color={strength.color}
                                    sx={{ height: 6, borderRadius: 5 }}
                                />
                                
                                <List dense sx={{ mt: 1 }}>
                                    <ValidationItem isMet={validation.hasMinLength} text="At least 8 characters" />
                                    <ValidationItem isMet={validation.hasUppercase} text="One uppercase letter" />
                                    <ValidationItem isMet={validation.hasLowercase} text="One lowercase letter" />
                                    <ValidationItem isMet={validation.hasNumber} text="One number" />
                                </List>
                            </Box>
                        )}

                        <TextField
                            fullWidth label="Confirm Password"
                            type="password" margin="normal" required
                            disabled={!userID || success}
                            error={passwords.confirm !== "" && !validation.isMatched}
                            helperText={passwords.confirm !== "" && !validation.isMatched ? "Passwords do not match" : ""}
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        />

                        <Button
                            fullWidth type="submit" variant="contained"
                            size="large" sx={{ mt: 4, py: 1.5, fontWeight: "bold" }}
                            disabled={submitting || !userID || success || strength.label === "Weak"}
                        >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : "Update Password"}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
}

// Helper component for the Checklist items
function ValidationItem({ isMet, text }) {
    return (
        <ListItem disablePadding sx={{ py: 0.2 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
                {isMet ? <CheckCircle color="success" sx={{ fontSize: 18 }} /> : <Cancel color="error" sx={{ fontSize: 18 }} />}
            </ListItemIcon>
            <ListItemText 
                primary={text} 
                primaryTypographyProps={{ variant: 'caption', color: isMet ? 'textPrimary' : 'textSecondary' }} 
            />
        </ListItem>
    );
}