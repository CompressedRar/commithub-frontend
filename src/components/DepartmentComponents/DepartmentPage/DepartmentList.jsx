import { useState } from "react"
import { Button, FormControl, InputLabel, List, OutlinedInput } from "@mui/material"
import DepartmentListItem from "./DepartmentListItem"


function DepartmentList({
    departments = [],
    currentDepartment,
    setCurrentDepartment,
    loading
}) {

    const [searchQuery, setSearchQuery] = useState("")

    console.log("dept list render", { departments, currentDepartment, loading }) // DEBUG

    const filtered = (departments ?? []).filter(d =>
        (d.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (      
        

        <div className="col-12 col-lg-5 col-xl-4">

            <div className="card shadow-sm sticky-top" style={{ top: "1rem" }}>

                <div className="card-body">

                    <div className="d-flex justify-content-between mb-3">

                        <div>
                            <h5 className="fw-bold mb-0">Offices</h5>
                            <small className="text-muted">
                                Select an office to manage
                            </small>
                        </div>

                        <Button
                            variant="contained"
                            data-bs-toggle="modal"
                            data-bs-target="#add-department"
                        >
                            +
                        </Button>

                    </div>

                    <FormControl fullWidth className="mb-3">

                        <InputLabel>Search Office</InputLabel>

                        <OutlinedInput
                            label="Search Office"
                            value={searchQuery}
                            onChange={(e)=>setSearchQuery(e.target.value)}
                        />

                    </FormControl>

                    <List>

                        {loading ? (
                            <div className="text-center py-3">
                                <div className="spinner-border"/>
                            </div>
                        ) : (

                            filtered && filtered.map(dept => (

                                <DepartmentListItem
                                    key={dept.id}
                                    dept={dept}
                                    active={dept.id === currentDepartment}
                                    onClick={()=>{
                                        setCurrentDepartment(dept.id)
                                        console.log("setting department", dept.id) // DEBUG
                                        localStorage.setItem("currentDepartment", dept.id)
                                    }}
                                />

                            ))

                        )}

                    </List>

                </div>

            </div>

        </div>
    )
}

export default DepartmentList