import { ListItemButton, ListItemIcon } from "@mui/material"
import { Apartment } from "@mui/icons-material"

function DepartmentListItem({ dept, active, onClick }){

    return (

        <ListItemButton
            selected={active}
            onClick={onClick}
        >

            <ListItemIcon>
                <Apartment/>
            </ListItemIcon>

            <div>
                {dept.name || "No name"}
            </div>

        </ListItemButton>

    )
}

export default DepartmentListItem