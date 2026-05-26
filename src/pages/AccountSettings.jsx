import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  getPositionInfo,
  getPositions,
} from "../services/positionService";
import { getDepartmentsLite } from "../services/departmentService";
import {
  getUserSettings,
  updateUserName,
  updateUserPosition,
  updateUserDepartment,
  updateProfilePicture,
  updateRecoveryEmail,
  getProfileSettings,
  updateProfileSettings,
} from "../services/userService";

function AccountSettings({userID, profileID}) {
  // User State
  const [userSettings, setUserSettings] = useState({
    id: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    position_id: "",
    department_id: "",
    role: "",
  });

  // Profile State
  const [profileSettings, setProfileSettings] = useState({
    id: "",
    email: "",
    recovery_email: "",
    two_factor_enabled: false,
    profile_picture_link: "",
  });

  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("account"); // account, profile, security
  const fileInput = useRef(null);

  // Get user ID from local storage or auth context
  const userId = userID;
  const profileId = profileID;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUserSettings(),
        loadProfileSettings(),
        loadPositions(),
        loadDepartments(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      Swal.fire("Error", "Failed to load settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadUserSettings = async () => {
    try {
      const res = await getUserSettings(userId);
      setUserSettings(res.data);
      console.log("user settings", res.data)
      setPreview(res.data.profile_picture_link);
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  };

  const loadProfileSettings = async () => {
    try {
      const res = await getProfileSettings(profileId);
      setProfileSettings(res.data);
      console.log("profile settings", res.data)
    } catch (error) {
      console.error("Error loading profile settings:", error);
    }
  };

  const loadPositions = async () => {
    try {
      const res = await getPositionInfo();
      setPositions(res.data);
    } catch (error) {
      console.error("Error loading positions:", error);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await getDepartmentsLite();
      setDepartments(res.data);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  // Account Settings Handlers
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    console.log("updating user setting", name, value)
    setUserSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = () => {
    const file = fileInput?.current?.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      Swal.fire("Invalid File", "Please upload a valid image.", "error");
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const saveAccountSettings = async () => {
    setUpdating(true);
    try {
      // Update user name
      if (
        true
      ) {
        await updateUserName(
          userId,
          userSettings.first_name,
          userSettings.middle_name,
          userSettings.last_name
        );
      }
      console.log("user settings to update", {
        first_name: userSettings.first_name,
        middle_name: userSettings.middle_name,
        last_name: userSettings.last_name
      });

      // Update position if changed
      if (true) {
        await updateUserPosition(userId, userSettings.position.id);
      }

      // Update department if changed
      if (true) {
        await updateUserDepartment(userId, userSettings.department.id);
      }

      Swal.fire("Success", "Account settings updated.", "success");
      setUpdating(false);
    } catch (error) {
      console.error("Error saving account settings:", error);
      Swal.fire(
        "Error",
        error.response?.data?.error || "Failed to update settings.",
        "error"
      );
      setUpdating(false);
    }
  };

  const saveProfileSettings = async () => {
    setUpdating(true);
    try {
      // Update profile picture if provided
      if (fileInput?.current?.files?.[0]) {
        await updateProfilePicture(profileId, fileInput.current.files[0]);
      }

      // Update recovery email if changed
      if (
        profileSettings.recovery_email &&
        profileSettings.recovery_email !== ""
      ) {
        await updateRecoveryEmail(profileId, profileSettings.recovery_email);
      }

      Swal.fire("Success", "Profile settings updated.", "success");
      setUpdating(false);
    } catch (error) {
      console.error("Error saving profile settings:", error);
      Swal.fire(
        "Error",
        error.response?.data?.error || "Failed to update profile.",
        "error"
      );
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column justify-content-start p-4 bg-white w-100 h-100"
      style={{ overflowY: "auto" }}
    >
      <div className="mb-4">
        <h4 className="fw-bold text-primary d-flex align-items-center">
          <span className="material-symbols-outlined me-2">settings</span>
          Account Settings
        </h4>
        <hr />
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            <span className="material-symbols-outlined me-2">person</span>
            Account Info
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="material-symbols-outlined me-2">account_circle</span>
            Profile
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <span className="material-symbols-outlined me-2">security</span>
            Security
          </button>
        </li>
      </ul>

      {/* Account Info Tab */}
      {activeTab === "account" && (
        <div className="tab-pane active">
          <h5 className="mb-3">Account Information</h5>

          {/* Name Fields */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="first_name" className="form-label">
                Given Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                maxLength={30}
                className="form-control"
                id="first_name"
                name="first_name"
                placeholder="John"
                value={userSettings.first_name || ""}
                onChange={handleUserChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="middle_name" className="form-label">
                Middle Name
              </label>
              <input
                type="text"
                maxLength={30}
                className="form-control"
                id="middle_name"
                name="middle_name"
                placeholder="Craig"
                value={userSettings.middle_name || ""}
                onChange={handleUserChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="last_name" className="form-label">
                Last Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                maxLength={30}
                className="form-control"
                id="last_name"
                name="last_name"
                placeholder="Doe"
                value={userSettings.last_name || ""}
                onChange={handleUserChange}
              />
            </div>
          </div>

          {/* Position */}
          <div className="mb-3">
            <label htmlFor="position_id" className="form-label">
              Position <span className="text-danger">*</span>
            </label>
            <select
              name="position_id"
              id="position_id"
              className="form-select"
              disabled
              value={userSettings.position.id || ""}
              onChange={handleUserChange}
            >
              <option value="">Select Position</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="mb-4">
            <label htmlFor="department_id" className="form-label">
              Office <span className="text-danger">*</span>
            </label>
            <select
              name="department_id"
              id="department_id"
              className="form-select"
              value={userSettings.department.id || ""}
              onChange={handleUserChange}
              disabled
            >
              <option value="">Select Office</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role (Read-only) */}
          <div className="mb-4 p-3 bg-light rounded">
            <label className="form-label fw-semibold">Role</label>
            <p className="text-muted text-capitalize">{userSettings.role}</p>
            <small className="text-muted">
              Role can only be changed by administrators.
            </small>
          </div>

          <div className="text-end">
            <button
              className="btn btn-primary"
              onClick={saveAccountSettings}
              disabled={updating}
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="tab-pane active">
          <h5 className="mb-3">Profile Settings</h5>

          {/* Profile Picture */}
          <div className="mb-4 text-center">
            <div
              className="mx-auto rounded-circle border border-secondary shadow-sm mb-2"
              style={{
                width: "150px",
                height: "150px",
                backgroundImage: preview
                  ? `url('${preview}')`
                  : "url('/default-profile-pic.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
            <label
              htmlFor="profile-pic"
              className="btn btn-outline-primary btn-sm"
            >
              <span className="material-symbols-outlined me-1">
                add_photo_alternate
              </span>
              Change Picture
            </label>
            <input
              type="file"
              name="profile-pic"
              id="profile-pic"
              onChange={handleImageChange}
              ref={fileInput}
              accept="image/*"
              hidden
            />
          </div>

          {/* Email (Read-only) */}
          <div className="mb-3 p-3 bg-light rounded">
            <label htmlFor="email" className="form-label fw-semibold">
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={profileSettings.email || ""}
              disabled
            />
            <small className="text-muted">
              Email cannot be changed. Contact administrator if you need to
              change it.
            </small>
          </div>

          {/* Recovery Email */}
          

          {/* Two Factor Authentication */}
          <div className="mb-4">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="two_factor"
                checked={profileSettings.two_factor_enabled || false}
                onChange={(e) =>
                  setProfileSettings((prev) => ({
                    ...prev,
                    two_factor_enabled: e.target.checked,
                  }))
                }
              />
              <label className="form-check-label" htmlFor="two_factor">
                Enable Two-Factor Authentication
              </label>
            </div>
            <small className="text-muted d-block mt-2">
              Add an extra layer of security to your account. You'll need to
              verify your identity with a second method when logging in.
            </small>
          </div>

          <div className="text-end">
            <button
              className="btn btn-primary"
              onClick={saveProfileSettings}
              disabled={updating}
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="tab-pane active">
          <h5 className="mb-3">Security Settings</h5>

          <div className="row">
            <div className="col-md-12 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">
                    <span className="material-symbols-outlined me-2">
                      lock
                    </span>
                    Change Password
                  </h6>
                  <p className="card-text text-muted small">
                    Update your account password regularly for better security.
                  </p>
                  <a href="/change-password" className="btn btn-outline-primary btn-sm">
                    Change Password
                  </a>
                </div>
              </div>
            </div>

            
          </div>

          <div className="alert alert-info mt-4" role="alert">
            <span className="material-symbols-outlined me-2">info</span>
            <strong>Security Tips:</strong>
            <ul className="mb-0 mt-2">
              <li>Use a strong password with numbers, symbols, and mixed case.</li>
              <li>
                Enable two-factor authentication for enhanced security.
              </li>
              <li>Regularly review your login history for unauthorized access.</li>
              <li>Never share your password with anyone.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountSettings;
