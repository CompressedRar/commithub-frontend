import { useCallback, useEffect, useState } from "react"
import { getDepartments, getDepartmentsLite, registerDepartment } from "../services/departmentService"
import Swal from "sweetalert2"
import { objectToFormData } from "../components/api"


export const useDepartment = () => {
    const [departments, setDepartments] = useState([])
    const [currentDepartment, setCurrentDepartment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const fetchDepartments = useCallback(async ()=> {
        try {
            const res = await getDepartmentsLite();
            return res.data
        }
        catch(error){
            console.log("hook dept", error);
            Swal.fire("Error", "There is an error fetching offices", "error");
            return null
        }
    }, []);
    
    const fetchFullDepartments = useCallback(async () => {
        setLoading(true)

        try {
            const res = await getDepartmentsLite()
            const data = res.data


            setDepartments(data)
            console.log("First department", data, data[0])

            if (!currentDepartment && data.length > 0) {
                
                setCurrentDepartment(data[0].id)
            }

            return data

        } catch (error) {
            console.error("fetching dept error", error)

            Swal.fire({
                title: "Error",
                text: error.response?.data?.error,
                icon: "error"
            })

            return []

        } finally {
            setLoading(false)
        }

    }, [])

    const createDepartment = async (formData) => {

        if (!formData.department_name.trim()) {
            return Swal.fire("Validation", "Office name is required", "warning")
        }

        setSubmitting(true)

        try {

            const res = await registerDepartment(objectToFormData(formData))

            if (res.data.message === "Office successfully created.") {

                Swal.fire("Success", res.data.message, "success")

                await fetchFullDepartments()
            }

        } catch (error) {
            console.log(error)

            Swal.fire({
                title: "Error",
                text: error.response?.data?.error,
                icon: "error"
            })

        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        fetchFullDepartments()        
    }, [fetchFullDepartments])


    return {        
        departments,
        currentDepartment,        
        loading,
        submitting,
        fetchFullDepartments,
        createDepartment,
        setCurrentDepartment,
        fetchDepartments, 
    }
}