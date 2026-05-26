import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from "@mui/material";
import { useProfileList } from "../hooks/useProfileList";
import { useProfileManagement } from "../hooks/useProfileManagement";
import ProfileList from "../components/UserManagement/ProfileList";
import UserList from "../components/UserManagement/UserList";
import CreateProfileModal from "../components/UserManagement/CreateProfileModal";
import EditProfileModal from "../components/UserManagement/EditProfileModal";
import CreateUserModal from "../components/UserManagement/CreateUserModal";
import EditUserModal from "../components/UserManagement/EditUserModal";
import { getPositions } from "../services/positionService";
import { getDepartmentsLite } from "../services/departmentService";


/**
 * UserManagement Page
 * Main admin interface for managing profiles and users
 * Features:
 * - View all profiles with search
 * - Create, edit, and delete profiles
 * - Manage users within each profile
 * - Create, edit, and delete users
 */
const UserManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState(null);
    
  // Modals state
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);

  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Edit states
  const [editingProfile, setEditingProfile] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

    // Fetch positions and departments for user forms
    useEffect(() => {
      const fetchMetadata = async () => {
        try {
          const [positionsData, departmentsData] = await Promise.all([
            getPositions(),
            getDepartmentsLite()
          ]);
          setPositions(positionsData.data || []);
          setDepartments(departmentsData.data || []);
        } catch (error) {
          console.error("Error fetching metadata:", error);
        }
      };

      fetchMetadata();
    }, []);

  // Profile list management
  const {
    profiles,
    filteredProfiles,
    loading: listLoading,
    error: listError,
    searchTerm,
    setSearchTerm,
    handleCreateProfile,
    handleDeleteProfile
  } = useProfileList();

  // Profile detail management (when viewing users)
  const profileManagement = useProfileManagement(selectedProfile?.id);
  
  // Handle create profile
  const onCreateProfile = async (data) => {
    await handleCreateProfile(data);
    setCreateProfileOpen(false);
  };

  // Handle edit profile
  const onEditProfile = (profile) => {
    setEditingProfile(profile);
    setEditProfileOpen(true);
  };

  const onSubmitEditProfile = async (data) => {
    if (editingProfile) {
      await profileManagement.handleUpdateProfile(data);
      setEditProfileOpen(false);
      setEditingProfile(null);
    }
  };

  // Handle delete profile
  const onDeleteProfile = async (profileId) => {
    await handleDeleteProfile(profileId);
    if (selectedProfile?.id === profileId) {
      setSelectedProfile(null);
      setActiveTab(0);
    }
  };

  // Handle create user
  const onCreateUser = async (userData) => {
    await profileManagement.handleAddUser(userData);
    setCreateUserOpen(false);
  };

  // Handle edit user
  const onEditUser = (user) => {
    setEditingUser(user);
    setEditUserOpen(true);
  };

  const onSubmitEditUser = async (userData) => {
    if (editingUser) {
      await profileManagement.handleUpdateUser(editingUser.id, userData);
      setEditUserOpen(false);
      setEditingUser(null);
    }
  };

  // Handle delete user
  const onDeleteUser = async (userId) => {
    await profileManagement.handleDeleteUser(userId);
  };

  // Handle profile selection (view users)
  const onViewUsers = (profile) => {
    setSelectedProfile(profile);
    setActiveTab(1);
  };

  return (
    <Container maxWidth="fluid" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          User & Profile Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage user accounts and their associated profiles
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Profiles" />
          <Tab
            label={`Users${selectedProfile ? ` (${selectedProfile.email})` : ""}`}
            disabled={!selectedProfile}
          />
        </Tabs>
      </Paper>

      {/* Profiles Tab */}
      {activeTab === 0 && (
        <Box>
          {listError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {listError}
            </Alert>
          )}
          <ProfileList
            profiles={filteredProfiles}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={listLoading}
            error={null}
            onCreateProfile={() => setCreateProfileOpen(true)}
            onEditProfile={onEditProfile}
            onDeleteProfile={onDeleteProfile}
            onViewUsers={onViewUsers}
          />
        </Box>
      )}

      {/* Users Tab */}
      {activeTab === 1 && (
        <Box>
          {profileManagement.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileManagement.error}
            </Alert>
          )}

          {profileManagement.loading && !profileManagement.users ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <UserList
              users={profileManagement.users}
              loading={profileManagement.loading}
              error={null}
              onAddUser={() => setCreateUserOpen(true)}
              onEditUser={onEditUser}
              onDeleteUser={onDeleteUser}
              profileEmail={selectedProfile?.email}
            />
          )}
        </Box>
      )}

      {/* Modals */}
      {departments && positions && (
        <>
        <CreateProfileModal
            open={createProfileOpen}
            onClose={() => setCreateProfileOpen(false)}
            onSubmit={onCreateProfile}
            loading={listLoading}
            error={null}
        />

        <EditProfileModal
            open={editProfileOpen}
            profile={editingProfile}
            onClose={() => {
            setEditProfileOpen(false);
            setEditingProfile(null);
            }}
            onSubmit={onSubmitEditProfile}
            loading={profileManagement.loading}
            error={null}
        />

        <CreateUserModal
            open={createUserOpen}
            onClose={() => setCreateUserOpen(false)}
            onSubmit={onCreateUser}
            loading={profileManagement.loading}
            error={null}
            positions={positions}
            departments={departments}
        />

        <EditUserModal
            open={editUserOpen}
            user={editingUser}
            onClose={() => {
            setEditUserOpen(false);
            setEditingUser(null);
            }}
            positions={positions}
            departments={departments}
            onSubmit={onSubmitEditUser}
            loading={profileManagement.loading}
            error={null}
        />
      </>
      )}
    </Container>
  );
};

export default UserManagement;