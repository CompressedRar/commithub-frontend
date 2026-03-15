import CreateDepartmentModal from "../components/DepartmentComponents/DepartmentPage/CreateDepartmentModal"
import DepartmentDetails from "../components/DepartmentComponents/DepartmentPage/DepartmentDetails"
import DepartmentList from "../components/DepartmentComponents/DepartmentPage/DepartmentList"
import { useDepartment } from "../hooks/useDepartment"


function DepartmentPage(){

    const {
        departments,
        currentDepartment,
        setCurrentDepartment,
        loading,
        createDepartment,
        submitting
    } = useDepartment();

    return (

        <div className="container-fluid py-4">

            <div className="row g-3">

                <DepartmentList
                    departments={departments}
                    loading={loading}
                    currentDepartment={currentDepartment}
                    setCurrentDepartment={setCurrentDepartment}
                />

                <DepartmentDetails
                    departmentId={currentDepartment}
                />

            </div>

            <CreateDepartmentModal
                createDepartment={createDepartment}
                submitting={submitting}
            />

        </div>

    )
}

export default DepartmentPage