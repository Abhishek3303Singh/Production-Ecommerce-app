// components/address/AddressMapPicker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import './addressMapPicker.css';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_POSITION = [28.6139, 77.2090]; // New Delhi

// Component that handles map clicks
function LocationMarker({ position, setPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

const AddressMapPicker = ({ onAddressChange, initialAddress = null }) => {
  const [position, setPosition] = useState(
    initialAddress?.lat ? [initialAddress.lat, initialAddress.lng] : DEFAULT_POSITION
  );
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: initialAddress?.fullName || '',
    phone: initialAddress?.phone || '',
    addressLine1: initialAddress?.addressLine1 || '',
    addressLine2: initialAddress?.addressLine2 || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    pincode: initialAddress?.pincode || '',
    country: initialAddress?.country || 'India',
    lat: initialAddress?.lat || DEFAULT_POSITION[0],
    lng: initialAddress?.lng || DEFAULT_POSITION[1],
    isDefault: initialAddress?.isDefault || false,
  });

  // Reverse geocode using OpenStreetMap (free, no key)
  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );

      const addr = res.data.address || {};
      
      setFormData(prev => ({
        ...prev,
        lat,
        lng,
        addressLine1: [
          addr.house_number,
          addr.road,
          addr.neighbourhood,
          addr.suburb
        ].filter(Boolean).slice(0, 2).join(', ') || prev.addressLine1,
        city: addr.city || addr.town || addr.district || prev.city,
        state: addr.state || prev.state,
        pincode: addr.postcode || prev.pincode,
        country: addr.country || 'India',
      }));

      // Notify parent
      onAddressChange?.({
        ...formData,
        lat,
        lng,
        addressLine1: [
          addr.house_number,
          addr.road,
          addr.neighbourhood,
          addr.suburb
        ].filter(Boolean).slice(0, 2).join(', '),
        city: addr.city || addr.town || addr.district,
        state: addr.state,
        pincode: addr.postcode,
        country: addr.country || 'India',
      });

    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      alert('Could not fetch address. Please enter manually.');
    } finally {
      setLoading(false);
    }
  }, [formData, onAddressChange]);

  // Handle manual form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updated = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };
    setFormData(updated);
    onAddressChange?.(updated);
  };

  // Get current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        alert('Location access denied. Please select manually on map.');
      }
    );
  };

  return (
    <div className="address-map-picker">
      
      {/* Map Section */}
      <div className="map-section">
        <div className="map-toolbar">
          <button type="button" className="btn-locate" onClick={handleUseCurrentLocation}>
            📍 Use My Current Location
          </button>
          {loading && <span className="loading-text">Fetching address...</span>}
        </div>

        <div className="map-container">
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={position}
              setPosition={setPosition}
              onLocationSelect={reverseGeocode}
            />
          </MapContainer>
        </div>
        <small className="map-hint">Click anywhere on the map to set delivery location</small>
      </div>

      {/* Form Section */}
      <div className="address-form">
        <h3>Delivery Address</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
              maxLength={10}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address Line 1 (House No, Street, Area) *</label>
          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            placeholder="12/3, MG Road, Koramangala"
            required
          />
        </div>

        <div className="form-group">
          <label>Address Line 2 (Landmark, Apartment)</label>
          <input
            type="text"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            placeholder="Near City Mall, 4th Floor"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Bangalore"
              required
            />
          </div>
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Karnataka"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>PIN Code *</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="560034"
              maxLength={6}
              required
            />
          </div>
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              readOnly
            />
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
            />
            Set as default address
          </label>
        </div>

        <div className="coordinates-display">
          <small>📍 Lat: {formData.lat?.toFixed(4)}, Lng: {formData.lng?.toFixed(4)}</small>
        </div>
      </div>
    </div>
  );
};

export default AddressMapPicker;