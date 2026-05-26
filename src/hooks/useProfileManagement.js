import { useState, useCallback, useEffect } from "react";
import * as profileService from "../services/profileService";
import Swal from "sweetalert2";

/**
 * useProfileManagement Hook
 * Manages state and operations for a single profile
 * @param {string} profileId - The profile ID to manage
 * @returns {Object} Profile data, users, loading/error states, and action handlers
 */
export const useProfileManagement = (profileId) => {
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch profile and users
  const fetchProfile = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    try {
      const profileData = await profileService.getProfileDetail(profileId);
      setProfile(profileData);
      setUsers(profileData.users || []);
    } catch (err) {
      setError(err.error || err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update profile
  const handleUpdateProfile = useCallback(async (updateData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await profileService.updateProfile(profileId, updateData);
      setProfile(updated.profile);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: updated.message || "Profile updated successfully"
      });
      return updated;
    } catch (err) {
      const errorMsg = err.error || err.message || "Failed to update profile";
      setError(errorMsg);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  // Delete profile
  const handleDeleteProfile = useCallback(async () => {
    const confirm = await Swal.fire({
      title: "Delete Profile?",
      text: "This will delete the profile and all associated users. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!"
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    setError(null);
    try {
      const result = await profileService.deleteProfile(profileId);
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: result.message || "Profile deleted successfully"
      });
      return result;
    } catch (err) {
      const errorMsg = err.error || err.message || "Failed to delete profile";
      setError(errorMsg);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  // Add user to profile
  const handleAddUser = useCallback(
    async (userData) => {
      setLoading(true);
      setError(null);
      try {
        const newUser = await profileService.createUserInProfile(
          profileId,
          userData
        );
        setUsers([...users, newUser.user]);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: newUser.message || "User created successfully"
        });
        return newUser;
      } catch (err) {
        const errorMsg = err.error || err.message || "Failed to create user";
        setError(errorMsg);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMsg
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [profileId, users]
  );

  // Update user in profile
  const handleUpdateUser = useCallback(
    async (userId, userData) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await profileService.updateUserInProfile(
          profileId,
          userId,
          userData
        );
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, ...updated.user } : user
          )
        );
        Swal.fire({
          icon: "success",
          title: "Success",
          text: updated.message || "User updated successfully"
        });
        return updated;
      } catch (err) {
        const errorMsg = err.error || err.message || "Failed to update user";
        setError(errorMsg);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMsg
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [profileId, users]
  );

  // Delete user from profile
  const handleDeleteUser = useCallback(
    async (userId) => {
      const confirm = await Swal.fire({
        title: "Delete User?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!"
      });

      if (!confirm.isConfirmed) return;

      setLoading(true);
      setError(null);
      try {
        const result = await profileService.deleteUserFromProfile(
          profileId,
          userId
        );
        setUsers(users.filter((user) => user.id !== userId));
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: result.message || "User deleted successfully"
        });
        return result;
      } catch (err) {
        const errorMsg = err.error || err.message || "Failed to delete user";
        setError(errorMsg);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMsg
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [profileId, users]
  );

  return {
    profile,
    users,
    loading,
    error,
    fetchProfile,
    handleUpdateProfile,
    handleDeleteProfile,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser
  };
};
