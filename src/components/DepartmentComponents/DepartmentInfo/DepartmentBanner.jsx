function DepartmentBanner({ deptInfo, managerInfo }) {

  const protectedOffices = [
    "College of Computing Studies ",
    "College of Education ",
    "College of Hospitality Management",
    "President's Office"
  ]

  const isProtected = protectedOffices.includes(deptInfo?.name)

  return (
    <div
      className="rounded-4 shadow-sm mb-4 position-relative overflow-hidden"
      style={{
        backgroundImage: `url('${import.meta.env.BASE_URL}nc-splash-new.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "240px",
      }}
    >
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>

      <div className="position-relative text-white p-4 h-100 d-flex flex-column justify-content-between">

        <div>
          <h3 className="fw-bold mb-1">
            {deptInfo?.name || "Loading..."}
          </h3>

          <p className="mb-0">
            Office Head:{" "}
            {managerInfo ? (
              <span className="fw-semibold text-info">
                {managerInfo.first_name} {managerInfo.last_name}
              </span>
            ) : (
              <span className="text-warning">None</span>
            )}
          </p>
        </div>

        <div className="d-flex gap-2 justify-content-end flex-wrap">

          <button
            className="btn btn-light text-dark fw-semibold d-flex align-items-center gap-1 shadow-sm border-0 px-3 py-2 rounded-pill"
            data-bs-toggle="modal"
            data-bs-target="#assign-head"
          >
            <span className="material-symbols-outlined">person_add</span>
            Assign Head
          </button>

          {!isProtected && (
            <button
              className="btn btn-primary fw-semibold d-flex align-items-center gap-1 shadow-sm px-3 py-2 rounded-pill"
              data-bs-toggle="modal"
              data-bs-target="#edit-department"
            >
              <span className="material-symbols-outlined">edit</span>
              Edit
            </button>
          )}

          {!isProtected && (
            <button
              className="btn btn-danger fw-semibold d-flex align-items-center gap-1 shadow-sm px-3 py-2 rounded-pill"
              data-bs-toggle="modal"
              data-bs-target="#archive-department"
            >
              <span className="material-symbols-outlined">archive</span>
              Archive
            </button>
          )}

        </div>
      </div>
    </div>
  )
}

export default DepartmentBanner