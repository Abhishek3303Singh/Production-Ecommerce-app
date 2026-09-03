import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBanner, resetAdminBannerState } from '../../store/adminBannerSlice';
import SideBar from '../SideBar';
import './addbanner.css';
import {STATUSES, setStatus, setError} from '../../store/adminBannerSlice'
import {uploadToCloudinary, getSignature} from '../../utils/cloudinaryUpload'

const AddBanner = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { status, error, isCreated } = useSelector((state) => state.adminBanners);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ctaText: 'Shop Now',
    ctaUrl: '',
    position: 'hero',
    priority: 0,
    displayOrder: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    userSegments: 'all',
    device: 'all',
    themeColor: '#131921',
  });

  // Image previews and files
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    
    if (type === 'desktop') {
      setDesktopFile(file);
      setDesktopPreview(previewUrl);
    } else {
      setMobileFile(file);
      setMobilePreview(previewUrl);
    }
  };

 

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) return alert('Title is required');
    if (!formData.ctaUrl.trim()) return alert('CTA URL is required');
    if (!formData.endDate) return alert('End date is required');
    if (!desktopFile) return alert('Desktop image is required');

    try {
      dispatch(setStatus(STATUSES.LOADING)); // optional: show loading immediately

      // 1. Get signature from backend
      const signatureData = await getSignature();

      // 2. Upload desktop image directly to Cloudinary
      const desktopImage = await uploadToCloudinary(desktopFile, signatureData);

      // 3. Upload mobile image (if provided)
      let mobileImage = null;
      if (mobileFile) {
        mobileImage = await uploadToCloudinary(mobileFile, signatureData);
      }

      // 4. Build payload with Cloudinary URLs
      const submitData = {
        title: formData.title,
        description: formData.description,
        ctaText: formData.ctaText,
        ctaUrl: formData.ctaUrl,
        position: formData.position,
        priority: Number(formData.priority),
        displayOrder: Number(formData.displayOrder),
        startDate: formData.startDate,
        endDate: formData.endDate,
        targeting: {
          userSegments: formData.userSegments,
          device: formData.device,
        },
        desktopImage,
        mobileImage,
      };

      // 5. Send metadata to your backend
      dispatch(createBanner(submitData));

    } catch (err) {
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setError(err.message));
      alert(err.message);
    }
  };

  // Success - redirect to list
  useEffect(() => {
    if (isCreated) {
      dispatch(resetAdminBannerState());
      navigate('/admin/banners');
    }
  }, [isCreated, dispatch, navigate]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (desktopPreview) URL.revokeObjectURL(desktopPreview);
      if (mobilePreview) URL.revokeObjectURL(mobilePreview);
    };
  }, []);

  return (
    <div className='create-banner-main-container'>
      <div className='craete-banner-sidebar'>
        <SideBar/>

      </div>
    <div className="admin-banner-create">
      <div className="admin-header">
        <h1>Create New Banner</h1>
        <button className="btn-back" onClick={() => navigate('/admin/banners')}>
          ← Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="banner-form">
        
        {/* Left Column - Form Fields */}
        <div className="form-left">
          
          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Summer Sale 2026"
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Up to 50% off on all electronics"
              maxLength={500}
              rows={3}
            />
          </div>

          {/* CTA Row */}
          <div className="form-row">
            <div className="form-group">
              <label>CTA Text</label>
              <input
                type="text"
                name="ctaText"
                value={formData.ctaText}
                onChange={handleChange}
                placeholder="Shop Now"
              />
            </div>
            <div className="form-group">
              <label>CTA URL *</label>
              <input
                type="text"
                name="ctaUrl"
                value={formData.ctaUrl}
                onChange={handleChange}
                placeholder="/sale/summer-2026"
                required
              />
            </div>
          </div>

          {/* Position & Priority */}
          <div className="form-row">
            <div className="form-group">
              <label>Position</label>
              <select name="position" value={formData.position} onChange={handleChange}>
                <option value="hero">Hero (Main)</option>
                <option value="mid">Mid Page</option>
                <option value="mid2">Mid Page 2</option>
                <option value="bottom">Bottom</option>
                <option value="sidebar">Sidebar</option>
                <option value="promotion">Braand promotion</option>
                <option value="hero2">product Hero</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                min={0}
                max={100}
              />
            </div>
            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                min={0}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Targeting */}
          <div className="form-row">
            <div className="form-group">
              <label>User Segment</label>
              <select name="userSegments" value={formData.userSegments} onChange={handleChange}>
                <option value="all">All Users</option>
                <option value="new">New Users</option>
                <option value="returning">Returning Users</option>
                <option value="premium">Premium Users</option>
              </select>
            </div>
            <div className="form-group">
              <label>Device</label>
              <select name="device" value={formData.device} onChange={handleChange}>
                <option value="all">All Devices</option>
                <option value="desktop">Desktop Only</option>
                <option value="mobile">Mobile Only</option>
              </select>
            </div>
          </div>

        </div>

        {/* Right Column - Image Upload */}
        <div className="form-right">
          
          {/* Desktop Image */}
          <div className="image-upload-box">
            <label>
              Desktop Image * 
              <small>(1920 x 600 recommended)</small>
            </label>
            <div 
              className="upload-area"
              style={{ aspectRatio: '3.2/1' }}
              onClick={() => document.getElementById('desktop-upload').click()}
            >
              {desktopPreview ? (
                <img src={desktopPreview} alt="Desktop preview" className="preview-img" />
              ) : (
                <div className="upload-placeholder">
                  <span>+</span>
                  <p>Click to upload desktop image</p>
                  <small>Landscape format</small>
                </div>
              )}
            </div>
            <input
              id="desktop-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'desktop')}
              hidden
            />
          </div>

          {/* Mobile Image */}
          <div className="image-upload-box">
            <label>
              Mobile Image 
              <small>(1080 x 1920 recommended)</small>
            </label>
            <div 
              className="upload-area"
              style={{ aspectRatio: '9/16', maxHeight: '400px' }}
              onClick={() => document.getElementById('mobile-upload').click()}
            >
              {mobilePreview ? (
                <img src={mobilePreview} alt="Mobile preview" className="preview-img" />
              ) : (
                <div className="upload-placeholder">
                  <span>+</span>
                  <p>Click to upload mobile image</p>
                  <small>Portrait format (optional)</small>
                </div>
              )}
            </div>
            <input
              id="mobile-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'mobile')}
              hidden
            />
            <small className="hint">If empty, desktop image will be used</small>
          </div>

        </div>
        <div className="form-group">
          {/* color picker for matching  */}
  <label>Header Theme Color</label>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <input
      type="color"
      name="themeColor"
      value={formData.themeColor || '#131921'}
      onChange={handleChange}
      style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer' }}
    />
    <input
      type="text"
      name="themeColor"
      value={formData.themeColor || '#131921'}
      onChange={handleChange}
      placeholder="#131921"
      maxLength={7}
    />
  </div>
  <small>Header will change to this color when banner is active</small>
</div>

        {/* Submit */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Creating...' : 'Create Banner'}
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate('/admin/banners')}
          >
            Cancel
          </button>
          {error && <span className="error-msg">{error}</span>}
        </div>

      </form>
    </div>
    </div>
  );
};

export default AddBanner;