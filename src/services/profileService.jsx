import api from '../components/api';

/**
 * Profile Service - Handles all profile-related API calls
 * Endpoints use /api/v1/profiles/ route
 */

// =========================
// PROFILE CRUD
// =========================

export async function listProfiles() {
  try {
    const response = await api.get("/api/v1/profiles", {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
}

export async function getProfileDetail(profileId) {
  try {
    const response = await api.get(`/api/v1/profiles/${profileId}`, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
}

export async function createProfile(profileData) {
  try {
    const response = await api.post("/api/v1/profiles", profileData, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
}

export async function updateProfile(profileId, profileData) {
  try {
    const response = await api.patch(`/api/v1/profiles/${profileId}`, profileData, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
}

export async function deleteProfile(profileId) {
  try {
    const response = await api.delete(`/api/v1/profiles/${profileId}`, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
}

// =========================
// USERS IN PROFILE
// =========================

export async function listProfileUsers(profileId) {
  try {
    const response = await api.get(`/api/v1/profiles/${profileId}/users`, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
}

export async function createUserInProfile(profileId, userData) {
  try {
    const response = await api.post(`/api/v1/profiles/${profileId}/users`, userData, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
}

export async function updateUserInProfile(profileId, userId, userData) {
  try {
    const response = await api.patch(
      `/api/v1/profiles/${profileId}/users/${userId}`,
      userData,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
}

export async function deleteUserFromProfile(profileId, userId) {
  try {
    const response = await api.delete(
      `/api/v1/profiles/${profileId}/users/${userId}`,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: error.message };
  }
}
