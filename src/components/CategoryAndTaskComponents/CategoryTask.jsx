import { useEffect, useState } from "react"



function CategoryTask(props){

    const [assigned, setAssigned] = useState([])
    
    function filterAssigned(){
        var iteratedmembers = []
        var filteredMembers = []
    
        for(const user of props.category.users){
            console.log("dpet task user",user)
            if(iteratedmembers.includes(user.id)) continue;
    
            iteratedmembers.push(user.id)
            filteredMembers.push(user)            
        }
    
        setAssigned(filteredMembers)
    }
    
    useEffect(()=> {
        filterAssigned()
    }, [])
    return (
      <div
        className="task"
        key={props.category.id}
        onClick={props.onClick}
      >
        <div
          className="department-name"
          style={
            props.category.department == "General"
              ? {
                  backgroundImage:
                    "linear-gradient(to left, rgb(143, 143, 250), var(--lighter-primary-color), var(--primary-color))",
                }
              : {
                  backgroundImage:
                    "linear-gradient(to left,var(--secondary-color), rgb(255, 136, 0), rgb(255, 136, 0))",
                }
          }
        >
          {props.category.department}
        </div>
        <div className="task-title">
          <span className="material-symbols-outlined">
            highlight_mouse_cursor
          </span>
          <span>{props.category.name}</span>
        </div>

        <div className="task-description">
          <div className="title">Description</div>
          <div className="description">{props.category.target_accomplishment}</div>
        </div>

        <div className="tasks-measurements">
          <div className="time-measurement">
            <div className="title">Time Measurement</div>
            <div className="description">
              {props.category.time_measurement.charAt(0).toUpperCase() +
                props.category.time_measurement.slice(1)}
            </div>
          </div>
          <div className="modification-measurement">
            <div className="title">Modification</div>
            <div className="description">
              {props.category.modifications.charAt(0).toUpperCase() +
                props.category.modifications.slice(1)}
            </div>
          </div>
        </div>

        <div className="assigned-users">
          <div className="title">Assigned Users</div>
          <div className="profile-icon-container">
            {assigned.map((user) => (
              <div
                className="profile-icon"
                style={{
                  backgroundImage: `url('${user.profile_picture_link}')`,
                }}
              >
                .
              </div>
            ))}
          </div>
        </div>
      </div>
    );
}

export default CategoryTask