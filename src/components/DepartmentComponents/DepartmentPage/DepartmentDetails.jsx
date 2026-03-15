import DepartmentInfo from "../DepartmentInfo/Info"



function DepartmentDetails({ departmentId, onLoadDepartments }) {

    return (

        <div className="col-12 col-lg-7 col-xl-8">

            <div className="border rounded shadow-sm p-3">
                

                {departmentId ? (

                    <DepartmentInfo
                        key={departmentId}
                        id={departmentId}
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