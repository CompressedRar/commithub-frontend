
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AppLogo from './AppLogo';



export default function TemporaryDrawer({links, isOpen, closeNavigation }) {
  
  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={closeNavigation}>
        
      <List>
        <AppLogo></AppLogo>
        {links.map((link, index) => (
          <ListItem key={link.text} disablePadding>
            <ListItemButton href={link.href}>
              <ListItemIcon>
                {link.icon}
              </ListItemIcon>
              <ListItemText primary={link.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>      
    </Box>
  );

  return (
    <div>
    
        
      <Drawer open={isOpen} onClose={closeNavigation}>
        {DrawerList}
      </Drawer>
    </div>
  );
}