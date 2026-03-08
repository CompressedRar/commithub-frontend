import { Box, Button, FormControl, FormLabel, InputLabel, OutlinedInput, Stack } from "@mui/material";
import { useState } from "react";
import { requestPasswordReset } from "../services/userService";
import Swal from "sweetalert2";



export default function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [loggingIn, setLoggingIn] = useState(false);


    function handleDataChange(e) {
        setEmail(e.target.value);
    }

    async function handleSubmission(e) {
        e.preventDefault();
        setLoggingIn(true);
        try {
            const res = await requestPasswordReset(email);
            console.log(res)
            Swal.fire({
                title: "Request Sent",
                text: "Forgot Password link has been sent to the email.",
                icon: "success",
            });
        }
        catch(error) {
            console.error(error);
            Swal.fire({
                title: "Error",
                text: error.response?.data?.error || "An error occurred while requesting password reset. Please try again later.",
                icon: "error",
            });
        }
        finally {
            setEmail("");
            setLoggingIn(false);
        }  
        setEmail("");      
    }
    

    return(
        <Box display={"flex"} flexDirection={"column"} gap={2}>
            <FormLabel>Enter the email of the account you want to change the password.</FormLabel>
            <form onSubmit={handleSubmission}>
                <Stack spacing={3}>
                  <FormControl fullWidth variant="outlined" > 
                    <InputLabel htmlFor="outlined-adornment-password">Email</InputLabel>
                    <OutlinedInput
                      type="email"
                      placeholder="Enter your email"
                      required
                      id="email"
                      name="email"
                      onChange={handleDataChange}
                      maxLength={30}                    
                      label="Email" 
                      value={email}
                    />
                  </FormControl>    
                  <Button
                    id="login-btn"
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loggingIn}
                    loading={loggingIn}
                    size="large"
                  >
                    Send Request
                  </Button>
                </Stack>
              </form>
        </Box>
    ) 

}
