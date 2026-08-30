import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllBanners, deleteBanner } from '../../store/adminBannerSlice';
import './AllBanners.css';
import SideBar from '../SideBar';

const AllBanners = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { allBanners, status, error } = useSelector((state) => state.adminBanners);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    dispatch(getAllBanners());
  }, [dispatch]);

  // Filter banners
  const filteredBanners = allBanners?.filter((banner) => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition === 'all' || banner.position === filterPosition;
    const matchesStatus = filterStatus === 'all' || banner.status === filterStatus;
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      dispatch(deleteBanner(id));
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/banners/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/admin/banners/create');
  };

  if (status === 'loading') return <div className="admin-loading">Loading banners...</div>;

  return (
    <div className='admin-banner-list-main-container'>
      <div className="banner-sidebar-container">
        <SideBar/>
      </div>
    <div className="admin-banner-list">
      <div className="admin-header">
        <h1>Banner Management</h1>
        <button className="btn-create" onClick={handleCreate}>
          + Create New Banner
        </button>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search banners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)}>
          <option value="all">All Positions</option>
          <option value="hero">Hero</option>
          <option value="mid">Mid</option>
          <option value="mid2">Mid 2</option>
          <option value="bottom">Bottom</option>
          <option value="sidebar">Sidebar</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Banner Table */}
      <div className="banner-table-container">
        <table className="banner-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Position</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanners?.map((banner) => (
              <tr key={banner._id} className={banner.isDeleted ? 'deleted' : ''}>
                <td>
                  <img 
                    src={banner.desktopImage?.url || banner.Image?.[0]?.url} 
                    alt={banner.title}
                    className="banner-thumb"
                  />
                </td>
                <td>{banner.title}</td>
                <td>
                  <span className={`badge badge-${banner.position}`}>
                    {banner.position}
                  </span>
                </td>
                <td>
                  <span className={`status status-${banner.status}`}>
                    {banner.status}
                  </span>
                </td>
                <td>{new Date(banner.startDate).toLocaleDateString()}</td>
                <td>{new Date(banner.endDate).toLocaleDateString()}</td>
                <td>{banner.priority}</td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => handleEdit(banner._id)}>
                    Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(banner._id)}
                    disabled={banner.isDeleted}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default AllBanners;