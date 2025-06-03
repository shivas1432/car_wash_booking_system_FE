import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import '../css/dashboard.css';
import DashboardBookings from './DashboardBookings';

const AdminDashboard = () => {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // Dashboard data states
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // User detail states
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone_number: '',
    address: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  // View state (summary, users, bookings)
  const [activeView, setActiveView] = useState('summary');
  
  // Display status function (converts 'pending' to 'confirmed')
  const displayStatus = (status) => {
    if (!status || status.toLowerCase() === 'pending') {
      return 'confirmed';
    }
    return status;
  };

  // Test if the admin API is reachable
  const testAdminApi = async () => {
    try {
      const response = await api.get('/api/admin/test');
      console.log('Admin API test result:', response.data);
      return true;
    } catch (error) {
      console.error('Admin API test failed:', error);
      return false;
    }
  };
  
  // Check if admin is already authenticated
  useEffect(() => {
    testAdminApi();
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchDashboardData();
      fetchUsers();
    }
  }, []);
  
  // Handle admin code verification
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    
    try {
      // Use absolute URL instead of relative URL
      const response = await api.post('http://localhost:5000/api/admin/verify-code', { accessCode });
      
      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        setIsAuthenticated(true);
        setAuthLoading(false);
        fetchDashboardData();
        fetchUsers();
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Verification failed');
      setAuthLoading(false);
    }
  };
  
  // Fetch dashboard summary data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/api/admin/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Map any 'pending' status to 'confirmed' in recent bookings
      if (response.data && response.data.recentBookings) {
        response.data.recentBookings = response.data.recentBookings.map(booking => ({
          ...booking,
          status: booking.status?.toLowerCase() === 'pending' ? 'confirmed' : (booking.status || 'confirmed')
        }));
      }
      
      setDashboardData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      setLoading(false);
      
      // If token is invalid, log out
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };
  
  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
      setLoading(false);
      
      // If token is invalid, log out
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };
  
  // Fetch user details
  const fetchUserDetails = async (userId) => {
    setDetailsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Map any 'pending' status to 'confirmed' in user bookings
      if (response.data && response.data.bookings) {
        response.data.bookings = response.data.bookings.map(booking => ({
          ...booking,
          status: booking.status?.toLowerCase() === 'pending' ? 'confirmed' : (booking.status || 'confirmed')
        }));
      }
      
      setUserDetails(response.data);
      setFormData({
        username: response.data.user.username,
        full_name: response.data.user.full_name || '',
        email: response.data.user.email,
        phone_number: response.data.user.phone_number || '',
        address: response.data.user.address || ''
      });
      setDetailsLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user details');
      setDetailsLoading(false);
    }
  };
  
  // Handle user selection
  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    setEditMode(false);
    setUpdateSuccess('');
    fetchUserDetails(userId);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle user update
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(`/api/admin/users/${selectedUser}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the user in the list
      setUsers(users.map(user => 
        user.id === selectedUser ? { ...user, ...formData } : user
      ));
      
      // Update user details
      setUserDetails({
        ...userDetails,
        user: {
          ...userDetails.user,
          ...formData
        }
      });
      
      setUpdateSuccess('User updated successfully');
      setEditMode(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };
  
  // Handle booking status update with point system
  const handleUpdateBooking = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const pointsToAdd = status === 'delivered' ? 10 : 0;
      
      await api.put(`/api/admin/bookings/${bookingId}`, 
        { 
          status, 
          notes: `Status changed to ${status} by admin`,
          addPoints: pointsToAdd
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update booking in user details if we're viewing user details
      if (userDetails) {
        let updatedUser = { ...userDetails.user };
        
        // Add points if status is "delivered"
        if (status === 'delivered') {
          updatedUser.points = (parseInt(updatedUser.points || 0) + 10);
        }
        
        setUserDetails({
          ...userDetails,
          user: updatedUser,
          bookings: userDetails.bookings.map(booking => 
            booking.id === bookingId ? { ...booking, status } : booking
          )
        });
      }
      
      let successMessage = `Booking #${bookingId} updated to ${status}`;
      if (status === 'delivered') {
        successMessage += '. 10 points added to user.';
      }
      
      setUpdateSuccess(successMessage);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess('');
      }, 3000);
      
      // Refresh dashboard data to reflect changes
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking');
    }
  };
  
  // Handle tab switching
  const handleTabSwitch = (view) => {
    setActiveView(view);
    // Reset selected user when switching tabs
    if (view !== 'users') {
      setSelectedUser(null);
      setUserDetails(null);
    }
  };
  
  // Handle admin logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setSelectedUser(null);
    setUserDetails(null);
    setDashboardData(null);
    setUsers([]);
    setActiveView('summary');
  };
  
  // Render access code verification screen
  if (!isAuthenticated) {
    return (
      <div className="admin-auth-container">
        <div className="admin-auth-card">
          <h1>Car Wash Admin</h1>
          <p>Enter your 6-digit access code to continue</p>
          
          {authError && <div className="admin-auth-error">{authError}</div>}
          
          <form onSubmit={handleVerifyCode}>
            <input
              type="text"
              placeholder="6-digit access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              maxLength={6}
              required
            />
            
            <button 
              type="submit" 
              disabled={accessCode.length !== 6 || authLoading}
              className="admin-auth-button"
            >
              {authLoading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-dashboard-container">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Car Wash Admin Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeView === 'summary' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('summary')}
        >
          Summary
        </button>
        <button 
          className={`admin-tab ${activeView === 'users' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('users')}
        >
          Users
        </button>
        <button 
          className={`admin-tab ${activeView === 'bookings' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('bookings')}
        >
          Bookings
        </button>
      </div>
      
      {/* Error and success messages */}
      {error && <div className="admin-error">{error}</div>}
      {updateSuccess && <div className="admin-success">{updateSuccess}</div>}
      
      {/* Dashboard content */}
      <div className="admin-dashboard-content">
        {/* Summary View */}
        {activeView === 'summary' && dashboardData && (
          <div className="admin-summary-view">
            <div className="admin-summary-cards">
              <div className="admin-summary-card">
                <div className="admin-summary-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="admin-summary-text">
                  <h3>Total Users</h3>
                  <p>{dashboardData.counts.users}</p>
                </div>
              </div>
              
              <div className="admin-summary-card">
                <div className="admin-summary-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="admin-summary-text">
                  <h3>Total Bookings</h3>
                  <p>{dashboardData.counts.bookings}</p>
                </div>
              </div>
              
              <div className="admin-summary-card">
                <div className="admin-summary-icon">
                  <i className="fas fa-car"></i>
                </div>
                <div className="admin-summary-text">
                  <h3>Registered Cars</h3>
                  <p>{dashboardData.counts.cars}</p>
                </div>
              </div>
            </div>
            
            {/* Recent Users */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2>Recent Users</h2>
              </div>
              <div className="admin-recent-users">
                {dashboardData.recentUsers && dashboardData.recentUsers.map(user => (
                  <div key={user.id} className="admin-user-item" onClick={() => {
                    handleTabSwitch('users');
                    handleUserSelect(user.id);
                  }}>
                    <div className="admin-user-avatar">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="admin-user-info">
                      <h3>{user.full_name || user.username}</h3>
                      <p>{user.email}</p>
                      <span className="admin-user-joined">Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="admin-user-arrow">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Users View */}
        {activeView === 'users' && (
          <div className="admin-users-view">
            {/* Left panel - User list */}
            <div className="admin-left-panel">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h2>Users</h2>
                  {dashboardData && (
                    <span className="admin-count-badge">{dashboardData.counts.users}</span>
                  )}
                </div>
                
                {loading ? (
                  <div className="admin-loading">
                    <div className="admin-spinner"></div>
                    <span>Loading users...</span>
                  </div>
                ) : (
                  <div className="admin-user-list">
                    {users.map(user => (
                      <div 
                        key={user.id}
                        className={`admin-user-item ${selectedUser === user.id ? 'selected' : ''}`}
                        onClick={() => handleUserSelect(user.id)}
                      >
                        <div className="admin-user-avatar">
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="admin-user-info">
                          <h3>{user.full_name || user.username}</h3>
                          <p>{user.email}</p>
                        </div>
                      </div>
                    ))}
                    
                    {users.length === 0 && !loading && (
                      <div className="admin-no-data">No users found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right panel - User details */}
            <div className="admin-right-panel">
              {selectedUser ? (
                detailsLoading ? (
                  <div className="admin-card">
                    <div className="admin-loading">
                      <div className="admin-spinner"></div>
                      <span>Loading user details...</span>
                    </div>
                  </div>
                ) : userDetails ? (
                  <>
                    {/* User Profile */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h2>User Profile</h2>
                        {!editMode ? (
                          <button 
                            className="admin-edit-btn"
                            onClick={() => setEditMode(true)}
                          >
                            Edit
                          </button>
                        ) : (
                          <button 
                            className="admin-cancel-btn"
                            onClick={() => {
                              setEditMode(false);
                              // Reset form data to original values
                              setFormData({
                                username: userDetails.user.username,
                                full_name: userDetails.user.full_name || '',
                                email: userDetails.user.email,
                                phone_number: userDetails.user.phone_number || '',
                                address: userDetails.user.address || ''
                              });
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      
                      {editMode ? (
                        <form onSubmit={handleUpdateUser} className="admin-edit-form">
                          <div className="admin-form-group">
                            <label>Username</label>
                            <input
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="admin-form-group">
                            <label>Full Name</label>
                            <input
                              type="text"
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="admin-form-group">
                            <label>Email</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="admin-form-group">
                            <label>Phone Number</label>
                            <input
                              type="text"
                              name="phone_number"
                              value={formData.phone_number}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="admin-form-group">
                            <label>Address</label>
                            <textarea
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              rows="3"
                            ></textarea>
                          </div>
                          <button type="submit" className="admin-save-btn">Save Changes</button>
                        </form>
                      ) : (
                        <div className="admin-user-profile">
                          <div className="admin-profile-header">
                            <div className="admin-profile-avatar">
                              {userDetails.user.full_name ? userDetails.user.full_name.charAt(0).toUpperCase() : userDetails.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="admin-profile-name">
                              <h3>{userDetails.user.full_name || userDetails.user.username}</h3>
                              <p>Joined: {new Date(userDetails.user.created_at).toLocaleDateString()}</p>
                              <p>Points: {userDetails.user.points || 0}</p>
                            </div>
                          </div>
                          
                          <div className="admin-profile-details">
                            <div className="admin-profile-detail">
                              <span>Username:</span>
                              <span>{userDetails.user.username}</span>
                            </div>
                            <div className="admin-profile-detail">
                              <span>Email:</span>
                              <span>{userDetails.user.email}</span>
                            </div>
                            <div className="admin-profile-detail">
                              <span>Phone:</span>
                              <span>{userDetails.user.phone_number || 'Not provided'}</span>
                            </div>
                            <div className="admin-profile-detail">
                              <span>Address:</span>
                              <span>{userDetails.user.address || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* User's Cars */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h2>Cars</h2>
                        <span className="admin-count-badge">{userDetails.cars.length}</span>
                      </div>
                      
                      <div className="admin-cars-list">
                        {userDetails.cars.map(car => (
                          <div key={car.id} className="admin-car-item">
                            <div className="admin-car-icon">
                              <i className="fas fa-car"></i>
                            </div>
                            <div className="admin-car-details">
                              <h3>{car.model}</h3>
                              <div className="admin-car-info">
                                <div className="admin-car-license">{car.plate_number}</div>
                                <div className="admin-car-color" style={{backgroundColor: car.color}}></div>
                                <div className="admin-car-seats">{car.seats} Seats</div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {userDetails.cars.length === 0 && (
                          <div className="admin-no-data">No cars registered</div>
                        )}
                      </div>
                    </div>
                    
                    {/* User's Bookings */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h2>Bookings</h2>
                        <span className="admin-count-badge">{userDetails.bookings.length}</span>
                      </div>
                      
                      <div className="admin-bookings-list">
                        {userDetails.bookings.map(booking => {
                          // Get the booking status, converting 'pending' to 'confirmed' for display
                          const statusDisplay = displayStatus(booking.status);
                          // Get the real status for button logic
                          const realStatus = booking.status || 'pending';
                          
                          return (
                            <div key={booking.id} className="admin-booking-item">
                              <div className="admin-booking-header">
                                <span className="admin-booking-id">#{booking.id}</span>
                                <span className={`admin-booking-status ${realStatus === 'pending' ? 'confirmed' : (realStatus || 'confirmed')}`}>
                                  {statusDisplay}
                                </span>
                              </div>
                              
                              <div className="admin-booking-detail">
                                <span>Service:</span>
                                <span>{booking.service} - {booking.subservice}</span>
                              </div>
                              <div className="admin-booking-detail">
                                <span>Date:</span>
                                <span>{new Date(booking.date).toLocaleDateString()} {booking.time_slot}</span>
                              </div>
                              <div className="admin-booking-detail">
                                <span>Car:</span>
                                <span>{booking.model} ({booking.plate_number})</span>
                              </div>
                              <div className="admin-booking-detail">
                                <span>Price:</span>
                                <span>${booking.price}</span>
                              </div>
                              
                              {/* Status update actions */}
                              <div className="admin-booking-actions">
                                <button 
                                  className={`admin-status-btn work-started ${realStatus === 'work started' ? 'active' : ''}`}
                                  onClick={() => handleUpdateBooking(booking.id, 'work started')}
                                  disabled={realStatus === 'work started' || realStatus === 'ready to collect' || realStatus === 'delivered' || realStatus === 'cancelled'}
                                >
                                  Work Started
                                </button>
                                <button 
                                  className={`admin-status-btn ready ${realStatus === 'ready to collect' ? 'active' : ''}`}
                                  onClick={() => handleUpdateBooking(booking.id, 'ready to collect')}
                                  disabled={realStatus === 'ready to collect' || realStatus === 'delivered' || realStatus === 'cancelled' || !['work started', 'confirmed', 'pending'].includes(realStatus)}
                                >
                                  Ready
                                </button>
                                <button 
                                  className={`admin-status-btn delivered ${realStatus === 'delivered' ? 'active' : ''}`}
                                  onClick={() => handleUpdateBooking(booking.id, 'delivered')}
                                  disabled={realStatus === 'delivered' || realStatus === 'cancelled' || realStatus !== 'ready to collect'}
                                >
                                  Delivered
                                </button>
                                <button 
                                  className={`admin-status-btn cancelled ${realStatus === 'cancelled' ? 'active' : ''}`}
                                  onClick={() => handleUpdateBooking(booking.id, 'cancelled')}
                                  disabled={realStatus === 'delivered' || realStatus === 'cancelled'}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        
                        {userDetails.bookings.length === 0 && (
                          <div className="admin-no-data">No bookings found</div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="admin-card">
                    <div className="admin-no-data">User details not found</div>
                  </div>
                )
              ) : (
                <div className="admin-card">
                  <div className="admin-welcome-message">
                    <i className="fas fa-arrow-left"></i>
                    <p>Select a user from the list to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Bookings View */}
        {activeView === 'bookings' && (
          <DashboardBookings 
            handleUpdateBooking={handleUpdateBooking} 
            displayStatus={displayStatus}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;