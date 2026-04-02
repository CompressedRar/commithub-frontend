import { useCallback, useEffect, useState } from "react"
import { approveIPCR, assignMainIPCR, calculateSubTaskRating, downloadIPCR, downloadPlannedIPCR, downloadWeightedIPCR, getIPCR, updateSubTask } from "../services/pcrServices"
import { downloadFile } from "../utils/download";
import Swal from "sweetalert2"
import { jwtDecode } from "jwt-decode";

export const useIPCR = () => {

    const [ipcrInfo, setIPCRInfo] = useState(null)
    const [arrangedSubTasks, setArrangedSubTasks] = useState({})
    const [categoryTypes, setCategoryTypes] = useState({})
    const [loading, setLoading] = useState(false);
    const [subTaskArray, setSubTaskArray] = useState([]);
    const [stats, setStats] = useState({
        quantity: 0,
        efficiency: 0,
        timeliness: 0,
        average: 0,
        categories: {
            "Core Function": { count: 0, total: 0, weight: 0 },
            "Strategic Function": { count: 0, total: 0, weight: 0 },
            "Support Function": { count: 0, total: 0, weight: 0 }
        }
    });

    const [downloading, setDownloading] = useState(false);
    const VALID_VISITORS = ["administrator", "president"]

    function verifyVisitor(ipcr_info) {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = jwtDecode(token);

                if(VALID_VISITORS.includes(String(payload.role).toLowerCase())) return;

                console.log(payload)
                if (payload.department.id != ipcr_info.user_info.department_id) {
                    window.location.href = "/unauthorized"
                }

            } catch (err) {
                window.location.href = "/unauthorized"

            }
        }
        else {
            window.location.href = "/unauthorized"
        }
    }

    const loadIPCR = useCallback(async (ipcr_id) => {
        try {
            console.log("fetching id", ipcr_id);
            const res = await getIPCR(ipcr_id).then(data => data.data);
            setIPCRInfo(res);
            processIPCRData(res);
            verifyVisitor(res);


        } catch (error) {
            console.log(error)
            Swal.fire({
                title: "Error",
                text: error.response?.data?.error,
                icon: "error"
            })
        }
    }, [])

    const handleSubmit = useCallback(async (ipcr_id, user_id) => {
        
        const result = await Swal.fire({
            title: "Submit IPCR?",
            text: "Are you sure you want to submit this IPCR?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, submit it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const res = await assignMainIPCR(ipcr_id, user_id);
                await Swal.fire({
                    title: "Success!",
                    text: "IPCR has been submitted successfully.",
                    icon: "success",
                    timer: 1000
                });
                await loadIPCR(ipcr_id);
            } catch (error) {
                console.error(error);
                Swal.fire({
                    title: "Submission Failed",
                    text: error.response?.data?.error || "An unexpected error occurred.",
                    icon: "error"
                });
            } finally {
                setLoading(false);
            }
        }
    }, [ipcrInfo]);

    const handleApprove = useCallback(async (ipcr_id) => {
        
        const result = await Swal.fire({
            title: "Approve IPCR?",
            text: "Are you sure you want to approve this IPCR?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, approve it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const res = await approveIPCR(ipcr_id);
                await Swal.fire({
                    title: "Success!",
                    text: "IPCR has been approved successfully.",
                    icon: "success",
                    timer: 1000
                });
                await loadIPCR(ipcr_id);
            } catch (error) {
                console.error(error);
                Swal.fire({
                    title: "Approval Failed",
                    text: error.response?.data?.error || "An unexpected error occurred.",
                    icon: "error"
                });
            } finally {
                setLoading(false);
            }
        }
    }, [ipcrInfo]);


    const handleCalculateRatings = useCallback(async (ipcr_id) => {
        const result = await Swal.fire({
            title: "Calculate Ratings?",
            text: "This will override the ratings for all tasks.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, calculate it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);

                const res = await calculateSubTaskRating(subTaskArray);
                

                await Swal.fire({
                    title: "Success!",
                    text: "Ratings have been calculated successfully.",
                    icon: "success",
                    timer: 1000
                });
                await loadIPCR(ipcr_id)



            } catch (error) {
                console.error(error);
                Swal.fire({
                    title: "Calculation Failed",
                    text: error.response?.data?.error || "An unexpected error occurred.",
                    icon: "error"
                });
            } finally {
                setLoading(false);
            }
        }
    }, [subTaskArray])

    const processIPCRData = useCallback((ipcrInfo) => {
        const sub_tasks = ipcrInfo.sub_tasks
        const all_categories = {}
        const all_category_type = {}
        const newStats = { ...stats }

        newStats.categories = {
            "Core Function": { count: 0, total: 0, weight: ipcrInfo.user_info.position.core_weight },
            "Strategic Function": { count: 0, total: 0, weight: ipcrInfo.user_info.position.strategic_weight },
            "Support Function": { count: 0, total: 0, weight: ipcrInfo.user_info.position.support_weight }
        }

        let q = 0, e = 0, t = 0, a = 0
        const allID = []
        sub_tasks.forEach(task => {
            allID.push(task.id)

            const category = task.main_task.category.name
            const type = task.main_task.category.type

            all_categories[category] = all_categories[category] || []
            all_category_type[category] = type

            if (newStats.categories[type]) {
                newStats.categories[type].count++
                newStats.categories[type].total += task.average
            }

            q += task.quantity
            e += task.efficiency
            t += task.timeliness
            a += task.average
            all_categories[category].push(task)
        })
        setSubTaskArray(allID)

        const count = sub_tasks.length || 1
        newStats.quantity = q / count
        newStats.efficiency = e / count
        newStats.timeliness = t / count
        newStats.average = a / count

        setArrangedSubTasks(all_categories)
        setCategoryTypes(all_category_type)
        setStats(newStats)
    }, [])


    const downloadPlanned = useCallback(async (ipcr_id) => {
        try {
            setDownloading(true);
            const res = await downloadPlannedIPCR(ipcr_id);
            downloadFile(res.data.link)
        }
        catch (error) {
            Swal.fire({
                title: "Error",
                text: "Download failed.",
                icon: "error",
            });
        }
        finally {
            setDownloading(false);
        }
    }, [])

    const downloadWeighted = useCallback(async (ipcr_id) => {
        try {
            setDownloading(true);
            const res = await downloadWeightedIPCR(ipcr_id);
            downloadFile(res.data.link)
        }
        catch (error) {
            Swal.fire({
                title: "Error",
                text: "Download failed.",
                icon: "error",
            });
        }
        finally {
            setDownloading(false);
        }
    }, [])

    const downloadStandard = useCallback(async (ipcr_id) => {
        try {
            setDownloading(true);
            const res = await downloadIPCR(ipcr_id);
            downloadFile(res.data.link)
        }
        catch (error) {
            Swal.fire({
                title: "Error",
                text: "Download failed.",
                icon: "error",
            });
        }
        finally {
            setDownloading(false);
        }
    }, []);




    return { stats, setStats, 
        downloading, downloadWeighted, downloadPlanned, downloadStandard, 
        ipcrInfo, arrangedSubTasks, categoryTypes, 
        loadIPCR, handleCalculateRatings, 
        loading, handleSubmit, handleApprove
     }
}