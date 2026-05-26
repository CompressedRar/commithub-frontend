import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuList from "@mui/material/MenuList";
import { Avatar, Button } from "@mui/material";
import { useState, useEffect } from "react";
import SwitchAccountModal from "./UsersComponents/SwitchAccountModal";


export default function AccountMenu({isOpen, closeMenu, anchorEl, handleLogout, accounts, onSwitch, currentAccountId}) {
    const [switchModalOpen, setSwitchModalOpen] = useState(false);

    useEffect(() => {
        console.log("Accounts in menu", accounts)
    }, [accounts])

    const handleOpenSwitchModal = () => {
        setSwitchModalOpen(true);
        closeMenu();
    };

    const handleCloseSwitchModal = () => {
        setSwitchModalOpen(false);
    };

    const handleSwitchAccount = async (profileId, userId) => {
        await onSwitch(profileId, userId);
        
        setSwitchModalOpen(false);
    };

    return (
    <>
        <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={isOpen}
            onClose={closeMenu}
            
            slotProps={{
              list: {
                'aria-labelledby': 'basic-button',
              },
            }}
          >
            <MenuList>
                <MenuItem onClick={closeMenu} data-bs-toggle="modal" data-bs-target="#account-setting">
                  <ListItemIcon>
                    <ManageAccountsIcon></ManageAccountsIcon>
                  </ListItemIcon>

                  <ListItemText primary={"Account Settings"} />
                </MenuItem>

                {accounts && accounts.length > 0 && (
                    <MenuItem onClick={handleOpenSwitchModal}>
                      <ListItemIcon>
                        <SwitchAccountIcon></SwitchAccountIcon>
                      </ListItemIcon>

                      <ListItemText primary={"Switch Account"} />
                    </MenuItem>
                )}

                <MenuItem id="logout" onClick={()=> {
                    handleLogout()
                    closeMenu()
                }}>
                  <ListItemIcon>
                    <LogoutIcon></LogoutIcon>
                  </ListItemIcon>

                  <ListItemText primary={"Logout"} />
                </MenuItem>
            </MenuList>

        </Menu>

        <SwitchAccountModal 
            open={switchModalOpen}
            onClose={handleCloseSwitchModal}
            accounts={accounts}
            currentAccountId={currentAccountId}
            onSwitch={handleSwitchAccount}
        />
    </>
    )
}