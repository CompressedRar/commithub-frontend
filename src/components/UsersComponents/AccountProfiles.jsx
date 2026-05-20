import { Avatar, Stack, Box, Typography } from "@mui/material";


export default function AccountProfile({account, onSwitch}) {
    return (
        <Stack direction={"row"} alignItems={"center"} gap={2} padding={1} sx={{ cursor: "pointer" }} onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#f0f0f0"
        }} onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
        }}
        onClick={()=> {onSwitch(account.profile_id, account.id)}}
        >
            <Stack direction={"column"} sx={{ textAlign: "center" }} alignItems={"center"} >
                <Avatar alt={account.first_name}  sx={{ width: 35, height: 35 }}></Avatar>
                
            </Stack>

            <Stack direction="column" justifyContent={"center"}>
                <Typography variant="caption" fontWeight={"bold"}>{account.first_name}</Typography>
                <Typography variant="caption" color="text.secondary" >{account.position.name} - {account.department_name}</Typography>                
            </Stack>
        </Stack>
    )
}

export function AccountCollections({accounts, onSwitch}) {
    return (
        <Stack>
            {accounts && accounts.map((account)=> {
                return <AccountProfile key={account.id}  account={account} onSwitch={onSwitch}></AccountProfile>
            })}
        </Stack>
    )
}