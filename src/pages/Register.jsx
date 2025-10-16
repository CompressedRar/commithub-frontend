import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

import { getPositions } from "../services/positionService";
import { doesPresidentExists } from "../services/userService";
import { getDepartments } from "../services/departmentService";
import { registerAccount, checkEmail } from "../services/userService";
import { objectToFormData } from "../components/api";

function Register() {
  console.log("MOUNT: Register.jsx");
  console.log("REGISTER COMPONENT MOUNTED")


  const [formData, setFormData] = useState({ role: "faculty", middle_name:"" });
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [preview, setPreview] = useState(null);
  const [emailQuery, setEmailQuery] = useState("");
  const [emailQueryResult, setEmailQueryResult] = useState(null);
  const fileInput = useRef(null);

  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    loadDepartments();
    loadPositions();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await getDepartments();
      const deptList = res.data;
      setDepartments(deptList);
      if (deptList.length > 0) {
        setFormData((prev) => ({ ...prev, department: deptList[0].id }));
      }
    } catch {
      Swal.fire("Error", "Fetching departments failed.", "error");
    }
  };

  const loadPositions = async () => {
    try {
      const res = await getPositions();
      const posList = res.data;
      setPositions(posList);
      if (posList.length > 0) {
        setFormData((prev) => ({ ...prev, position: posList[0].id }));
      }
    } catch {
      Swal.fire("Error", "Fetching positions failed.", "error");
    }
  };

  const handleDataChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = async (e) => {
    const selectedRole = e.target.value;
    const selectedDept = departments.find(
      (dept) => dept.id === parseInt(formData.department)
    );

    // Check if role is president and already exists
    if (selectedRole === "president") {
      try {
        const res = await doesPresidentExists();
        if (res.data === true || res.data.exists === true) {
          Swal.fire(
            "Position Unavailable",
            "A President already exists. Please choose another role.",
            "warning"
          );
          setFormData((prev) => ({ ...prev, role: "faculty" }));
          return;
        }
      } catch {
        Swal.fire("Error", "Unable to verify president availability.", "error");
      }
    }

    // Check if role is head and department already has a head
    if (selectedRole === "head") {
      if (selectedDept?.is_head_occupied) {
        Swal.fire(
          "Position Unavailable",
          "This department already has a head. Please choose another role.",
          "warning"
        );
        setFormData((prev) => ({ ...prev, role: "faculty" }));
        return;
      }
    }

    setFormData({ ...formData, role: selectedRole });
  };

  const handleImageChange = () => {
    const file = fileInput.current.files[0];
    if (!file || !file.type.startsWith("image/")) {
      Swal.fire("Invalid File", "Please upload a valid image.", "error");
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const handleDataSubmission = async (e) => {
    setRegistering(true)
    e.preventDefault();

    if (!fileInput.current.files[0]) {
      Swal.fire("Error", "You must upload a profile picture.", "error");
      return;
    }

    const newFormData = objectToFormData(formData);
    newFormData.append("profile_picture", fileInput.current.files[0]);

    try {
      const res = await registerAccount(newFormData);
      Swal.fire("Success", res.data.message, "success");
      clearFields();
      setRegistering(false)
    } catch (error) {
        console.log(error)
      Swal.fire(
        "Error",
        error.response?.data?.error || "Registration failed.",
        "error"
      );
      setRegistering(false)
    }
    setRegistering(false)
  };

  const clearFields = () => {
    setPreview(null);
    fileInput.current.value = null;
    setEmailQuery("");
    setEmailQueryResult(null);
    setFormData({
      department: departments[0]?.id || "",
      position: positions[0]?.id || "",
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      role: "faculty",
    });
  };

  useEffect(() => {
    if (!emailQuery) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await checkEmail(emailQuery);
        const msg = res.data.message;
        if (msg === "Available") {
          setEmailQueryResult(<span className="text-success">{msg}</span>);
        } else if (msg === "Email was already taken.") {
          setEmailQueryResult(<span className="text-danger">{msg}</span>);
        } else {
          setEmailQueryResult(
            <span className="text-muted">Error checking email</span>
          );
        }
      } catch {
        setEmailQueryResult(
          <span className="text-muted">Error checking email</span>
        );
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [emailQuery]);

  return (
    <form
      onSubmit={handleDataSubmission}
      className="d-flex flex-column justify-content-start p-4 bg-white w-100 h-100 border-0"
      style={{ overflowY: "auto" }}
    >
      <div className="mb-4">
        <h4 className="fw-bold text-primary d-flex align-items-center">
          <span className="material-symbols-outlined me-2">person_add</span>
          Create New Account
        </h4>
        <hr />
      </div>

      {/* Profile Picture */}
      <div className="mb-4 text-center">
        <div
          className="mx-auto rounded-circle border border-secondary shadow-sm mb-2"
          style={{
            width: "120px",
            height: "120px",
            backgroundImage: preview
              ? `url('${preview}')`
              : "url('/default-avatar.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <label htmlFor="profile-pic" className="btn btn-outline-primary btn-sm">
          <span className="material-symbols-outlined me-1">
            add_photo_alternate
          </span>
          Upload Picture
        </label>
        <input
          type="file"
          name="profile-pic"
          id="profile-pic"
          onChange={handleImageChange}
          ref={fileInput}
          required
          accept="image/*"
          hidden
        />
      </div>

      {/* Email */}
      <div className="mb-3">
        <label htmlFor="email" className="form-label fw-semibold">
          Email Address <span className="text-danger">*</span>
        </label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          placeholder="e.g. johndoe@gmail.com"
          onInput={(e) => {
            handleDataChange(e);
            setEmailQuery(e.target.value);
          }}
          required
        />
        <div className="mt-1">{emailQueryResult}</div>
      </div>

      {/* Name Fields */}
      <div className="row">
        <div className="col-md-4 mb-3">
          <label htmlFor="first_name" className="form-label">
            Given Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="first_name"
            name="first_name"
            placeholder="John"
            onInput={handleDataChange}
            required
          />
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="middle_name" className="form-label">
            Middle Name
          </label>
          <input
            type="text"
            className="form-control"
            id="middle_name"
            name="middle_name"
            placeholder="Craig"
            onInput={handleDataChange}
          />
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="last_name" className="form-label">
            Last Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="last_name"
            name="last_name"
            placeholder="Doe"
            onInput={handleDataChange}
            required
          />
        </div>
      </div>

      {/* Department */}
      <div className="mb-3">
        <label htmlFor="department" className="form-label">
          Department <span className="text-danger">*</span>
        </label>
        <select
          name="department"
          id="department"
          className="form-select"
          onChange={handleDataChange}
          value={formData.department || ""}
        >
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Position */}
      <div className="mb-3">
        <label htmlFor="position" className="form-label">
          Position <span className="text-danger">*</span>
        </label>
        <select
          name="position"
          id="position"
          className="form-select"
          onChange={handleDataChange}
          value={formData.position || ""}
        >
          {positions.map((pos) => (
            <option key={pos.id} value={pos.id}>
              {pos.name}
            </option>
          ))}
        </select>
      </div>

      {/* Role */}
      <div className="mb-4">
        <label htmlFor="role" className="form-label">
          Role <span className="text-danger">*</span>
        </label>
        <select
          name="role"
          id="role"
          className="form-select"
          value={formData.role || "faculty"}
          onChange={handleRoleChange}
        >
          <option value="faculty">Faculty</option>
          <option value="administrator">Administrator</option>
          <option value="president">President</option>
          <option value="head">Head</option>
        </select>
      </div>

      {/* Submit */}
      <div className="mt-auto pt-3 border-top text-end d-flex flex-row-reverse ">
        <button type="submit" className="btn btn-primary d-flex flex-row " disabled = {registering}>
          {!registering ? <span className="material-symbols-outlined me-1">save</span>
          :<span className="material-symbols-outlined">refresh</span>}
          {!registering ? "Register"
          :""}
        </button>
      </div>
    </form>
  );
}

export default Register;
