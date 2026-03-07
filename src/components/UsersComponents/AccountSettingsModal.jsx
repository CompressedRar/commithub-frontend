import { Box, Typography } from "@mui/material";
import Modal from '@mui/material/Modal';
import AccountSettings from "./AccountSettings";


function AccountSettingsModal({open, handleClose, userID}){
    <Modal 
        open = { open } 
        handleClose = {handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        {userID? 
        <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
                Account Settings
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <AccountSettings id = {userID}></AccountSettings>
            </Typography>
        </Box>
        : null}
    </Modal>

}


export default AccountSettingsModal;