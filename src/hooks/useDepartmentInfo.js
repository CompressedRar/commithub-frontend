import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { socket } from "../components/api";
import {
  getDepartment,
  updateDepartment,
  archiveDepartment
} from "../services/departmentService";
import { objectToFormData } from "../components/api";
import { Modal } from "bootstrap";

export default function useDepartmentInfo(id, onLoadDepartments){

    const [deptInfo,setDeptInfo] = useState({})
    const [managerInfo,setManagerInfo] = useState(null)
    const [formData,setFormData] = useState({department_name:"",icon:""})
    const [submitting,setSubmitting] = useState(false)
    const [archiving,setArchiving] = useState(false)

    const loadDepartment = async ()=>{

        try{

            const res = await getDepartment(id)
            const data = res.data

            setDeptInfo(data)

            const manager = data.users?.find(
                u => u.role === "head" || u.role === "president"
            )

            setManagerInfo(manager || null)

            setFormData({
                id,
                department_name:data.name,
                icon:data.icon
            })

        }catch(err){

            Swal.fire(
                "Error",
                err.response?.data?.error || "Failed to load department",
                "error"
            )

        }

    }

    const updateDept = async ()=>{

        if(!formData.department_name){
            return Swal.fire("Error","Office name required","error")
        }

        setSubmitting(true)

        try{

            const res = await updateDepartment(objectToFormData(formData))

            Swal.fire("Success",res.data.message,"success")

            await loadDepartment()
            onLoadDepartments?.()

        }catch(err){

            Swal.fire(
                "Error",
                err.response?.data?.error || "Update failed",
                "error"
            )

        }

        setSubmitting(false)
    }

    const archiveDept = async ()=>{

        setArchiving(true)

        try{

            const res = await archiveDepartment(id)

            await Swal.fire("Success",res.data.message,"success")

            await onLoadDepartments?.()
            Modal.getInstance(document.getElementById("archive-department"))?.hide();
            window.location.reload();

        }catch(err){

            Swal.fire(
                "Error",
                err.response?.data?.error || "Archive failed",
                "error"
            )

        }

        setArchiving(false)
    }

    useEffect(()=>{
        loadDepartment()
    },[id])

    useEffect(()=>{

        socket.on("department",loadDepartment)

        return ()=> socket.off("department")

    },[id])

    return{
        deptInfo,
        managerInfo,
        formData,
        setFormData,
        submitting,
        archiving,
        updateDept,
        archiveDept
    }

}