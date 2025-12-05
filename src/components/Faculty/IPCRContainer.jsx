import { useEffect, useState } from "react";
import {
  getDepartment,
  getDepartmentTasks,
  getGeneralTasks,
} from "../../services/departmentService";
import { jwtDecode } from "jwt-decode";
import {
  createUserTasks,
  getAccountInfo,
  getAssignedAccountTasks,
} from "../../services/userService";
import Swal from "sweetalert2";
import { socket } from "../api";
import { Modal } from "bootstrap";
import IPCR from "./IPCR";
import ManageSupportingDocuments from "./ManageSupportingDocuments";

function IPCRContainer({ switchPage }) {
  const [userinfo, setUserInfo] = useState({});
  const [departmentInfo, setDepartmentInfo] = useState({});
  const [availableTasks, setAvailableTasks] = useState([]);
  const [accountTasks, setAccountTasks] = useState([]);
  const [allAssignedID, setAllAssignedID] = useState([]);
  const [checkedArray, setChecked] = useState([]);
  const [allIPCR, setAllIPCR] = useState([]);
  const [creating, setCreating] = useState(false)

  const [currentIPCRID, setCurrentIPCRID] = useState(null)
  const [batchID, setBatchID] = useState(null)

  async function loadUserTasks(user_id) {
    setAllAssignedID([]);
    const res = await getAssignedAccountTasks(user_id)
      .then((data) => data.data)
      .catch((error) => {
        Swal.fire("Error", error.response.data.error, "error");
      });

    const ids = [];
    const assigned = [];
    for (const task of res.assigned_tasks) {
      if (task.is_assigned) {
        assigned.push(task.tasks);
        ids.push(task.tasks.id);
      }
    }

    setAccountTasks(assigned);
    setAllAssignedID(ids);
  }

  async function loadUserInfo() {
    if (localStorage.getItem("token")) {
      const payload = jwtDecode(localStorage.getItem("token"));
      const res = await getAccountInfo(payload.id)
        .then((data) => data.data)
        .catch((error) => {
          Swal.fire("Error", error.response.data.error, "error");
        });

      setUserInfo(res);
      setAllIPCR(res.ipcrs);
    }
  }

  async function loadDepartmentInfo(id) {
    const res = await getDepartment(id)
      .then((data) => data.data)
      .catch((error) => Swal.fire("Error", error.response.data.error, "error"));
    setDepartmentInfo(res);
  }

  async function loadAllTasks(id) {
    const available = [];

    const deptTasks = await getDepartmentTasks(id)
      .then((data) => data.data)
      .catch((error) => Swal.fire("Error", error.response.data.error, "error"));

    for (const task of deptTasks) {
      if (!allAssignedID.includes(task.id)) available.push(task);
    }

    const generalTasks = await getGeneralTasks()
      .then((data) => data.data)
      .catch((error) => Swal.fire("Error", error.response.data.error, "error"));

    for (const task of generalTasks) {
      if (!allAssignedID.includes(task.id)) available.push(task);
    }

    setAvailableTasks(available);
  }

  function getAllCheckedTasks() {
    const all = document.getElementsByName("chosen");
    const checkedID = [...allAssignedID];

    for (const taskEl of all) {
      if (taskEl.checked) checkedID.push(parseInt(taskEl.id));
    }

    setChecked(checkedID);
  }

  function handleCheck(taskId) {
        setChecked((prev) => {
            if (prev.includes(taskId)) {
                return prev.filter((id) => id !== taskId); // uncheck
            } else {
                return [...prev, taskId]; // check
            }
        });
    }


  async function createTasks() {
    return;
    setCreating(true)
    if (allAssignedID.length === 0) {
      //Swal.fire("Empty Output", "You must have at least one assigned output for IPCR.");
      setCreating(false)
      console.log("No assigned outputs");
      return;
      
    }

    const res = await createUserTasks(userinfo.id, allAssignedID)
      .then((data) => data.data.message)
      .catch((error) => {
        //Swal.fire("Error", error.response.data.error, "error")
        setCreating(false)
      });
      
    
    if (res === "IPCR successfully created") {
      //Swal.fire("Success", res, "success");
      setCreating(false)
    }
    else if(res === "An IPCR for the current period already exists."){
      setCreating(false)
    }
    else {
      console.log(res)
      Swal.fire("Error", "There was an error while creating IPCR", "error");
      setCreating(false)
    }

    const modalEl = document.getElementById("create-ipcr");
    const modal = Modal.getOrCreateInstance(modalEl);
    modal.hide();
    
    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    setCreating(false)

  }

  useEffect(() => {}, [accountTasks]);

  useEffect(() => {
    if (userinfo.department) {
      //loadAllTasks(userinfo.department.id);
      //loadDepartmentInfo(userinfo.department.id);
      createTasks()
    }
  }, [allAssignedID]);

  useEffect(() => {
    if (userinfo.id) {
      loadUserTasks(userinfo.id);
      
    }
  }, [userinfo]);

  useEffect(() => {
    loadUserInfo();
    
    socket.on("ipcr_create", () => loadUserInfo());
  }, []);

  // Group tasks by category
  function groupTasksByCategory(tasks) {
    const grouped = {};
    for (const task of tasks) {
      const category = task.category?.name || "Uncategorized";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(task);
    }
    return grouped;
  }

  const groupedAssigned = groupTasksByCategory(accountTasks);
  const groupedAvailable = groupTasksByCategory(availableTasks);

  return (
    <div className="container-fluid w-100 h-auto px-4">

      {/* Create IPCR Modal */}
      <div
        className="modal fade"
        id="create-ipcr"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="createIpcrLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl" style={{scale:"1.1"}}>
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h4 className="modal-title" id="createIpcrLabel">
                  Create IPCR 
                </h4>
                <small className="text-muted">
                  These are the Outputs assigned to you by the Office Head.
                </small>
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              <div className="row">
                {/* Assigned Tasks */}
                <div className="col-md-12">
                  

                  {Object.keys(groupedAssigned).length === 0 ? (
                    <div className="alert alert-secondary small">
                      No assigned outputs yet.
                    </div>
                  ) : (
                    Object.entries(groupedAssigned).map(([category, tasks]) => (
                      <div key={category} className="mb-4">
                        <h6 className="text-primary">{category}</h6>
                        <div className="list-group small">
                          {tasks.map((task) => (
                            <div
                              key={task.id}
                              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <i className="bi bi-cursor-fill me-2 text-primary"></i>
                                {task.name}
                              </div>
                              <span className="badge bg-light text-muted border">
                                {task.department}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Available Tasks */}
                <div className="col-md-6" style={{display:"none"}}>
                  <h5 className="fw-semibold mb-3">
                    <i className="bi bi-plus-circle-fill text-primary me-2"></i>
                    Available Outputs
                  </h5>

                  {Object.keys(groupedAvailable).length === 0 ? (
                    <div className="alert alert-secondary small">
                      No available Outputs yet.
                    </div>
                  ) : (
                    Object.entries(groupedAvailable).map(([category, tasks]) => (
                      <div key={category} className="mb-4">
                        <h6 className="text-primary">{category}</h6>
                        <div className="list-group small">
                          {tasks.map((task) => (
                            <label
                              key={task.id}
                              htmlFor={`task-${task.id}`}
                              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            >
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input me-2"
                                  id={`task-${task.id}`}
                                  name="chosen"
                                  checked={checkedArray.includes(task.id)}
                                onChange={() => handleCheck(task.id)}
                                />
                                <label
                                  htmlFor={`task-${task.id}`}
                                  className="form-check-label"
                                >
                                  {task.name}
                                </label>
                              </div>
                              <span className="badge bg-light text-muted border">
                                {task.department}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                type="button"
                disabled = {creating}
              >
                Cancel
              </button>
              <button className="btn btn-primary d-flex gap-2"  onClick={createTasks} disabled = {creating}>
                {creating? <span className="material-symbols-outlined spin">refresh</span>:"Create IPCR"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* IPCR List Section */}

      <div className="bg-white shadow-md p-4 rounded-3 mx-auto" style={{ maxWidth: "1600px", height:"85vh" }}>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-semibold mb-0">
              Individual Performance Commitment Forms
            </h5>
            <small className="text-muted">
              Create your IPCR by selecting available outputs.
            </small>
          </div>
          <button
            className="btn btn-primary d-none gap-2"
            data-bs-toggle="modal"
            data-bs-target="#create-ipcr"
            disabled = {creating}            
          >
            {creating ?<span className="material-symbols-outlined">refresh</span>: <span className="material-symbols-outlined">add</span>}
            {creating? "":"Create IPCR"}
          </button>
        </div>
        {
          batchID && currentIPCRID && <ManageSupportingDocuments key = {batchID} ipcr_id={currentIPCRID} batch_id={batchID} />
        }

        <div className="row g-3">
          {allIPCR && allIPCR.length > 0 ? (
            allIPCR.map(
              (ipcr) =>
                ipcr.status === 1 && (
                  <div className="col-md-6" key={ipcr.id}>
                    <IPCR
                      ipcr={ipcr}
                      onClick={()=> {
                        switchPage(ipcr.id, userinfo.department.id)
                      }}
                      onLoad={() =>
                        switchPage(ipcr.id, userinfo.department.id)
                      }
                      onMouseOver={()=> {
                        setBatchID(ipcr.batch_id)
                        setCurrentIPCRID(ipcr.id)
                      }}
                    />
                  </div>
                )
            )
          ) : (
            <div className="text-center text-muted py-5">
              <i className="bi bi-file-earmark-excel display-4 d-block mb-3"></i>
              <p>No IPCRs found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IPCRContainer;
