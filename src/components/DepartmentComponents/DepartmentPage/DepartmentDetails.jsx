import DepartmentInfo from "../DepartmentInfo/Info"



function DepartmentDetails({ departmentId, onLoadDepartments = ()=>{}, headMode = false }) {

    return (

        <div className={headMode ? "col-12" : "col-12 col-lg-7 col-xl-8"}>

            <div className="border rounded shadow-sm p-3">
                

                {departmentId ? (

                    <DepartmentInfo
                        key={departmentId}
                        id={departmentId}
                        headMode={headMode}
                        onLoadDepartments={onLoadDepartments}
                    />

                ) : (

                    <div className="text-center py-5 text-muted">
                        No office selected
                    </div>

                )}

            </div>

        </div>

    )
}

export default DepartmentDetails