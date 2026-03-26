import { useRef, useState } from "react"
import { Button } from "@mui/material"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import { uploadIPCRExcel } from "../../../../services/pcrServices"
import Swal from "sweetalert2"

function UploadIPCRButton({onUpload}) {
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(false)

    const handleButtonClick = () => {
        fileInputRef.current.click()
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]

        if (!file) return

        try {
            setLoading(true)
            const res = await uploadIPCRExcel(file)
            await Swal.fire("Success", 'IPCR Ratings Uploaded', "success")
            window.location.reload()
        } catch (err) {
            alert("Upload failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Completely hidden input */}
            <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {/* Only visible button */}
            <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={handleButtonClick}
                disabled={loading}
            >
                {loading ? "Uploading..." : "Upload IPCR"}
            </Button>
        </>
    )
}

export default UploadIPCRButton