function Logs({log}){
    return (
        <tr>
            
            
            <td>User: {log.full_name}</td>
            <td>{log.department}</td>
            <td>{log.action}</td>
            <td>{log.target}</td>
            <td>{log.ip_address}</td>
            <td>{log.timestamp}</td>
            <td>{log.user_agent}</td>
            
        </tr>
    )
}

export default Logs