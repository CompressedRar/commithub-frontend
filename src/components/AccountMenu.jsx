import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuList from "@mui/material/MenuList";


export default function AccountMenu({isOpen, closeMenu, anchorEl, handleLogout}){
    return (
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
    )
}