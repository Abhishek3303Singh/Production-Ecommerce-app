import React, { useState, useEffect, useCallback } from 'react'
import MetaData from '../routes/MetaData';
import { useDispatch, useSelector } from 'react-redux'
import PinDropIcon from '@material-ui/icons/PinDrop'
import HomeIcon from '@material-ui/icons/Home'
import LocatinCityIcon from '@material-ui/icons/LocationCity'
import PublicIcon from '@material-ui/icons/Public'
import PhoneIcon from '@material-ui/icons/Phone'
import { FaLandmark, FaUserTie } from 'react-icons/fa'
import TransferWithinAStation from '@material-ui/icons/TransferWithinAStationOutlined'
import { State, City } from 'country-state-city';
import './shipping.css'
import ChecktOut from './ChecktOut';
import { useAlert } from 'react-alert';
import { shippingDetails } from '../../store/cartSlice';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import axios from 'axios';

const DEFAULT_POSITION = [20.5937, 78.9629];

function LocationMarker({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

const Shipping = () => {
  const dispatch = useDispatch();
  const { shippingInfo } = useSelector((state) => state.cart);

  const [address, setAddress] = useState(shippingInfo?.address || '');
  const [city, setCity] = useState(shippingInfo?.city || '');
  const [instate, setInState] = useState(shippingInfo?.state || '');
  const [pincode, setPincode] = useState(shippingInfo?.pincode || '');
  const [landmark, setLandmark] = useState(shippingInfo?.landmark || '');
  const [country, setCountry] = useState("IN");
  const [phoneNo, setPhoneNo] = useState(shippingInfo?.phoneNo || '');
  const [name, setName] = useState(shippingInfo?.name || '');

  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [mapLoading, setMapLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const alert = useAlert();
  const navigate = useNavigate();

  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN; 

  useEffect(() => {
    setMounted(true);
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    setMapLoading(true);
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const addr = res.data.address || {};

      // adress bulder in detailed  
      const parts = [
        addr.house_number,
        addr.road,
        addr.neighbourhood,
        addr.suburb,
        addr.village,
        addr.town,
        addr.county,
      ].filter(Boolean);
      
      // Takin first 4 parts so it's detailed but not a paragraph 9selecting main part opf adress)
      const builtAddress = parts.slice(0, 4).join(', ');

      const stateName = addr.state || '';
      const allStates = State.getStatesOfCountry('IN');
      const matchedState = allStates.find(s =>
        s.name.toLowerCase() === stateName.toLowerCase()
      );

      setAddress(builtAddress || address);
      setCity(addr.city || addr.town || addr.district || city);
      setInState(matchedState?.isoCode || instate);
      setPincode(addr.postcode || pincode);
      setPosition([lat, lng]);
    } catch (err) {
      console.error(err);
      alert.error('Could not fetch address. Please enter manually.');
    } finally {
      setMapLoading(false);
      setGeoLoading(false);
    }
  }, [address, city, instate, pincode, alert]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert.error('Geolocation not supported');
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setGeoLoading(false);
        let msg = 'Could not get location.';
        if (err.code === 1) msg = 'Location permission denied. Enable it in browser settings or select manually on map.';
        if (err.code === 2) msg = 'Location unavailable on this device. Please select manually on map.';
        if (err.code === 3) msg = 'Location timed out. Please select manually on map.';
        alert.error(msg);
      },
      {
        enableHighAccuracy: false, 
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (phoneNo.length !== 10) {
      alert.error('Phone Number is Not Valid');
      return;
    }
    dispatch(shippingDetails({
      name, address, city, instate, pincode, landmark, country, phoneNo,
      lat: position[0], lng: position[1]
    }));
    navigate('/order/confirm');
  };

  return (
    <>
      <MetaData title='Shipping-Details' />
      <header className='shipping-Heading'>Shipping Information</header>
      <ChecktOut activeStep={0} />

      <div className="shippingMainContainer">

        {/* ===== our map section ===== */}
        <div className="shipping-map-section">
          <div className="map-toolbar">
            <button 
              type="button" 
              className="btn-locate" 
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
            >
              {geoLoading ? 'Locating...' : '📍 Use My Current Location'}
            </button>
            {mapLoading && <span className="map-loading">Fetching address...</span>}
          </div>

          <div className="shipping-map-container" style={{ height: '320px', width: '100%', background: '#e5e5e5' }}>
            {mounted ? (
              <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
               {/* we are using mapbox */}
                <TileLayer attribution='&copy; <a href="https://www.mapbox.com/about/maps/">
                Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 
                contributors' 
                url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`} tileSize={512} zoomOffset={-1} />
                <Marker position={position} />
                <LocationMarker onMapClick={reverseGeocode} />
                <MapController position={position} />
              </MapContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                Loading map...
              </div>
            )}
          </div>
          <small className="map-hint">Click anywhere on the map to set your delivery location</small>
        </div>

        {/* ===== Form for takimg adress (additional caddress )===== */}
        <div className="shippingContainer">
          <form className='shipping-form' onSubmit={handleShippingSubmit}>
            <div><FaUserTie /><input type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><HomeIcon /><input type="text" required placeholder='Address' value={address} onChange={(e) => setAddress(e.target.value)} /></div>
            <div><PinDropIcon /><input type="number" required placeholder='Pincode' value={pincode} onChange={(e) => setPincode(e.target.value)} /></div>
            <div><PhoneIcon /><input type="number" required placeholder='Phone No..' value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} /></div>
            <div><FaLandmark /><input type="text" required placeholder='Landmark' value={landmark} onChange={(e) => setLandmark(e.target.value)} /></div>
            <div>
              <PublicIcon />
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="IN">India</option>
              </select>
            </div>
            {country && (
              <div>
                <TransferWithinAStation />
                <select value={instate} onChange={(e) => setInState(e.target.value)} required>
                  <option value="">State</option>
                  {State.getStatesOfCountry(country).map((item) => (
                    <option key={item.isoCode} value={item.isoCode}>{item.name}</option>
                  ))}
                </select>
              </div>
            )}
            {instate && (
              <div>
                <LocatinCityIcon />
                <select value={city} onChange={(e) => setCity(e.target.value)} required>
                  <option value="">City</option>
                  {City.getCitiesOfState(country, instate).map((item) => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>
            )}
            <input type="submit" value='Continue' className='shipBtn' disabled={!city} />
          </form>
        </div>
      </div>
    </>
  );
};

export default Shipping;