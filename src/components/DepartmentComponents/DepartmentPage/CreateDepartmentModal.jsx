import { useState } from "react"
import { Button, FormControl, InputLabel, OutlinedInput } from "@mui/material"

function CreateDepartmentModal({ createDepartment, submitting }){

    const [formData, setFormData] = useState({
        department_name: ""
    })

    const handleChange = (e)=>{
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const submit = async ()=>{

        await createDepartment(formData)

        setFormData({department_name:""})
    }

    return (

        <div className="modal fade" id="add-department">

            <div className="modal-dialog modal-dialog-centered">

                <div className="modal-content">

                    <div className="modal-header">

                        <h5>Create Office</h5>

                    </div>

                    <div className="modal-body">

                        <FormControl fullWidth>

                            <InputLabel>Office Name</InputLabel>

                            <OutlinedInput
                                label="Office Name"
                                name="department_name"
                                value={formData.department_name}
                                onChange={handleChange}
                            />

                        </FormControl>

                    </div>

                    <div className="modal-footer">

                        <Button data-bs-dismiss="modal">
                            Close
                        </Button>

                        <Button
                            variant="contained"
                            onClick={submit}
                            disabled={submitting}
                        >
                            Create
                        </Button>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default CreateDepartmentModal