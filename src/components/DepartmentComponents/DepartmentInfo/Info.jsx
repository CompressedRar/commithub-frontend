

import DepartmentBanner from "./DepartmentBanner";
import DepartmentPhaseBanner from "./DepartmentPhaseBanner";
import DepartmentTabs from "./DepartmentTabs";
import DepartmentModals from "./DepartmentModals";
import useDepartmentPhase from "../../../hooks/useDepartmentPhase";
import useDepartmentInfo from "../../../hooks/useDepartmentInfo";

function DepartmentInfo({id,onLoadDepartments}){

    const dept = useDepartmentInfo(id,onLoadDepartments)
    const phase = useDepartmentPhase()

    if(phase.loading){

        return(
            <div className="text-center p-5">
                <div className="spinner-border"/>
            </div>
        )

    }

    return(

        <div className="container-fluid py-3 bg-light">

            <DepartmentModals
                id={id}
                dept={dept}
            />

            <DepartmentPhaseBanner
                currentPhase={phase.currentPhase}
            />

            <DepartmentBanner
                deptInfo={dept.deptInfo}
                managerInfo={dept.managerInfo}
            />

            <DepartmentTabs
                deptId={id}
                currentPhase={phase.currentPhase}
            />

        </div>

    )

}

export default DepartmentInfo