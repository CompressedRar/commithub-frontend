import { useState, useCallback, useEffect } from "react";
import * as profileService from "../services/profileService";
import Swal from "sweetalert2";

/**
 * useProfileList Hook
 * Manages state and operations for multiple profiles
 * @returns {Object} Profiles list, loading/error states, and action handlers
 */
export const useProfileList = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all profiles
  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.listProfiles();

      console.log("Fetched profiles:", data);
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.error || err.message || "Failed to fetch profiles");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Create new profile
  const handleCreateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const newProfile = await profileService.createProfile(profileData);
      setProfiles([...profiles, newProfile.profile]);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: newProfile.message || "Profile created successfully"
      });
      return newProfile;
    } catch (err) {
      const errorMsg = err.error || err.message || "Failed to create profile";
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
  }, [profiles]);

  // Delete profile from list
  const handleDeleteProfile = useCallback(
    async (profileId) => {
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
        setProfiles(profiles.filter((p) => p.id !== profileId));
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
    },
    [profiles]
  );

  // Filter profiles by search term
  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.recovery_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    profiles,
    filteredProfiles,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchProfiles,
    handleCreateProfile,
    handleDeleteProfile
  };
};
