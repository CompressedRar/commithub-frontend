import DepartmentInfo from "../DepartmentInfo"


function DepartmentDetails({ departmentId }){

    return (

        <div className="col-12 col-lg-7 col-xl-8">

            <div className="border rounded shadow-sm p-3">
                

                {departmentId ? (

                    <DepartmentInfo
                        key={departmentId}
                        id={departmentId}
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