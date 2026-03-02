import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaMapMarkerAlt, FaArrowLeft, FaUser, FaPhone,
  FaMapPin, FaCity, FaFlag, FaHome, FaBuilding,
  FaLandmark, FaCheckCircle, FaStar, FaTruck,
  FaClipboardList, FaChevronDown, FaBriefcase,
  FaEllipsisH, FaPlus, FaTimes, FaTag, FaClock,
  FaExclamationTriangle, FaShieldAlt, FaLock,FaPencilAlt,
} from 'react-icons/fa';
import './styles/AddAddress.css';

const API_URL = process.env.REACT_APP_API_URL;

// ── Key validators ─────────────────────────────────────────────────────────
const NAV_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];

const onlyLettersAndSpace = (e) => {
  if (NAV_KEYS.includes(e.key)) return;
  if (!/^[a-zA-Z ]$/.test(e.key)) e.preventDefault();
};
const onlyDigits = (e) => {
  if (NAV_KEYS.includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
  if (e.target.value.length === 0 && e.key === '0') e.preventDefault();
  if (e.target.value.length >= 6) e.preventDefault();
};
const phoneKeys = (e) => {
  if (NAV_KEYS.includes(e.key)) return;
  if (!/^[\d+\- ]$/.test(e.key)) e.preventDefault();
  if (e.target.value.length >= 10) e.preventDefault();
};
const addressKeys = (e) => {
  if (NAV_KEYS.includes(e.key)) return;
  if (!/^[a-zA-Z0-9 ,.\-/#]$/.test(e.key)) e.preventDefault();
};

// ── Address types ──────────────────────────────────────────────────────────
const ADDRESS_TYPES = [
  { id: 'house',     label: 'House',     icon: <FaHome /> },
  { id: 'apartment', label: 'Apartment', icon: <FaBuilding /> },
  { id: 'office',    label: 'Office',    icon: <FaBriefcase /> },
  { id: 'other',     label: 'Other',     icon: <FaEllipsisH /> },
];

// ── Instruction categories ─────────────────────────────────────────────────
const INSTRUCTION_CATEGORIES = [
  {
    id: 'location',
    label: 'Location Guidance',
    icon: <FaMapMarkerAlt />,
    customOnly: true,
    placeholder: 'e.g. Opposite SBI Bank, next to blue gate…',
    suggestions: [],
  },
  {
    id: 'contact',
    label: 'Contact & Accessibility',
    icon: <FaPhone />,
    suggestions: [
      { id: 'call_before', text: 'Call before delivery' },
      { id: 'no_call',     text: 'Do not call, ring the bell' },
      { id: 'whatsapp',    text: 'WhatsApp only — do not call' },
      { id: 'sms',         text: 'SMS preferred' },
      { id: 'alt_number',  text: null, isPhoneInput: true },
    ],
  },
  {
    id: 'dropoff',
    label: 'Delivery Preferences',
    icon: <FaTruck />,
    suggestions: [
      { id: 'doorstep',   text: 'Leave at doorstep' },
      { id: 'security',   text: 'Leave with security guard' },
      { id: 'reception',  text: 'Leave at reception' },
      { id: 'neighbor',   text: 'Leave with neighbor (Flat ___)' },
      { id: 'hand',       text: 'Hand it to me personally' },
      { id: 'office_rec', text: 'Deliver to office reception' },
    ],
  },
  {
    id: 'timing',
    label: 'Time-Related Instructions',
    icon: <FaClock />,
    suggestions: [
      { id: 'morning',     text: 'Deliver between 9 AM – 12 PM' },
      { id: 'evening',     text: 'Deliver between 6 PM – 9 PM' },
      { id: 'avoid_noon',  text: 'Avoid 1 PM – 3 PM' },
      { id: 'after_5',     text: 'Deliver after 5 PM only' },
      { id: 'no_mornings', text: 'Avoid weekday mornings' },
    ],
  },
  {
    id: 'handling',
    label: 'Special Handling',
    icon: <FaExclamationTriangle />,
    suggestions: [
      { id: 'fragile',  text: 'Fragile — handle with care' },
      { id: 'no_tilt',  text: 'Do not tilt the package' },
      { id: 'upright',  text: 'Keep upright at all times' },
      { id: 'no_sun',   text: 'Avoid sunlight / heat exposure' },
      { id: 'keep_dry', text: 'Keep dry — do not expose to rain' },
    ],
  },
  {
    id: 'security_instr',
    label: 'Security Instructions',
    icon: <FaShieldAlt />,
    suggestions: [
      { id: 'inform_guard', text: 'Inform security at the main gate' },
      { id: 'gate_pass',    text: 'Gate pass required — call me first' },
      { id: 'show_id',      text: 'Show ID at entrance' },
      { id: 'gate2',        text: 'Entry only via Gate No. 2' },
      { id: 'preapproval',  text: 'Society requires pre-approval' },
    ],
  },
  {
    id: 'personal',
    label: 'Personal Notes',
    icon: <FaClipboardList />,
    suggestions: [
      { id: 'dog',         text: 'Dog inside — please call before entering' },
      { id: 'locked_gate', text: 'Gate is locked — call me' },
      { id: 'back_entry',  text: 'Use the back entrance' },
      { id: 'ring_twice',  text: 'Ring twice' },
      { id: 'intercom',    text: null, isIntercomInput: true },
    ],
  },
];

// ── Basic fields ───────────────────────────────────────────────────────────
const FIELDS = [
  { name: 'name',         label: 'Full Name',            icon: <FaUser />,     type: 'text', required: true,  half: false, onKeyDown: onlyLettersAndSpace, autoComplete: 'name',           placeholder: 'Enter your full name' },
  { name: 'phoneNumber',  label: 'Phone Number',         icon: <FaPhone />,    type: 'tel',  required: true,  half: false, onKeyDown: phoneKeys,           autoComplete: 'tel',            placeholder: '+91 00000 00000', maxLength: 10 },
  { name: 'pincode',      label: 'Pincode',              icon: <FaMapPin />,   type: 'text', required: true,  half: true,  onKeyDown: onlyDigits,          autoComplete: 'postal-code',    placeholder: '6-digit pincode', maxLength: 6 },
  { name :'branch',       label: 'Branch',               icon: <FaCity />,     type: 'text', required: true,  half: true,  onKeyDown: onlyLettersAndSpace, autoComplete: 'address-level4', placeholder: 'Enter Branch' },
  { name :'district',     label: 'District',             icon: <FaCity />,     type: 'text', required: true,  half: true,  onKeyDown: onlyLettersAndSpace, autoComplete: 'address-level3', placeholder: 'Enter District' },
  { name: 'city',         label: 'City',                 icon: <FaCity />,     type: 'text', required: true,  half: true,  onKeyDown: onlyLettersAndSpace, autoComplete: 'address-level2', placeholder: 'Enter city' },
  { name: 'state',        label: 'State',                icon: <FaFlag />,     type: 'text', required: true,  half: false, onKeyDown: onlyLettersAndSpace, autoComplete: 'address-level1', placeholder: 'Enter state' },
  { name: 'locality',     label: 'Locality / Area',      icon: <FaHome />,     type: 'text', required: true,  half: false, onKeyDown: addressKeys,         autoComplete: 'off',            placeholder: 'Street, locality or area name' },
  { name: 'buildingName', label: 'Building / Flat Name', icon: <FaBuilding />, type: 'text', required: true,  half: false, onKeyDown: addressKeys,         autoComplete: 'street-address', placeholder: 'Flat no., building or apartment name' },
  { name: 'landmark',     label: 'Landmark',             icon: <FaLandmark />, type: 'text', required: false, half: false, onKeyDown: addressKeys,         autoComplete: 'off',            placeholder: 'Near school, hospital, etc.' },
];

// ── InstructionTag ─────────────────────────────────────────────────────────
const InstructionTag = ({ text, onRemove }) => (
  <span className="instr-tag">
    {text}
    <button type="button" className="instr-tag-remove" onClick={onRemove}>
      <FaTimes />
    </button>
  </span>
);

// ── Main component ─────────────────────────────────────────────────────────
const AddAddress = () => {
  const navigate = useNavigate();

  // ── All useState hooks must be here, inside the component ──────────────
  const [formData, setFormData] = useState({
    name: '', phoneNumber: '', pincode: '',
    branch: '', district: '', city: '', state: '',
    locality: '', buildingName: '', landmark: '',
  });
  const [isDefault, setIsDefault]                       = useState(false);
  const [addressType, setAddressType]                   = useState('house');
  const [customType, setCustomType]                     = useState('');
  const [satDelivery, setSatDelivery]                   = useState(null);
  const [sunDelivery, setSunDelivery]                   = useState(null);
  const [instructionsOpen, setInstructionsOpen]         = useState(false);
  const [activeCategoryId, setActiveCategoryId]         = useState(null);
  const [selectedInstructions, setSelectedInstructions] = useState([]);
  const [customInstruction, setCustomInstruction]       = useState('');
  const [altPhone, setAltPhone]                         = useState('');
  const [intercomCode, setIntercomCode]                 = useState('');
  const [submitting, setSubmitting]                     = useState(false);
  const [status, setStatus]                             = useState(null);
  const [focused, setFocused]                           = useState('');

  // ── Pincode auto-fill state 
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError]     = useState('');
  const [pincodeValid, setPincodeValid]     = useState(false);
  const [unlockedFields, setUnlockedFields] = useState(new Set());

  const AUTO_FILL_FIELDS = ['branch', 'district', 'city', 'state'];

  const unlockField = (fieldName) =>
    setUnlockedFields(prev => new Set([...prev, fieldName]))

  // ── Helpers ────────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Pincode change handler — calls India postal API ────────────────────
  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);

    // Always update pincode; clear city/state & validity on every change
    setFormData(prev => ({ ...prev, pincode: value,branch: '', district: '', city: '', state: '' }));
    setPincodeValid(false);
    setPincodeError('');
    setUnlockedFields(new Set());

    if (value.length === 6) {
      setPincodeLoading(true);
      try {
        const res  = await axios.get(
          `https://api.postalpincode.in/pincode/${value}`
        );
        const data = res.data[0];

        if (data.Status === 'Success' && data.PostOffice?.length > 0) {
          const po = data.PostOffice[0];
          setFormData(prev => ({
            ...prev,
            city:  po.Block || '',
            state: po.State    || '',
            branch: po.BranchType || '',
            district: po.District || '',
          }));
          setPincodeValid(true);
        } else {
          setPincodeError('Invalid pincode — no results found.');
        }
      } catch {
        setPincodeError('Could not fetch pincode details. Check your connection.');
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const addInstruction = (text) => {
    const trimmed = text.trim();
    if (!trimmed || selectedInstructions.includes(trimmed)) return;
    setSelectedInstructions(prev => [...prev, trimmed]);
  };

  const removeInstruction = (text) =>
    setSelectedInstructions(prev => prev.filter(i => i !== text));

  const handleAddCustom = () => {
    if (customInstruction.trim()) {
      addInstruction(customInstruction.trim());
      setCustomInstruction('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    const token = sessionStorage.getItem('authToken');

    if (formData.phoneNumber.length !== 10) {
      setStatus('error');
      setSubmitting(false);
      // Optionally set a specific error message
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    const payload = {
      ...formData,
      isDefault,
      addressType: addressType === 'other' ? customType || 'Other' : addressType,
      weekendDelivery: { saturday: satDelivery, sunday: sunDelivery },
      deliveryInstructions: selectedInstructions.join(' | '),
    };

    try {
      //STEP 1 SAVE ADDRESS
      await axios.post(`${API_URL}/address`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      /*
       // 2. Create payment attempt — pass your orderID
      const orderID = sessionStorage.getItem('currentOrderID');
      if (!orderID) {
        setStatus('error'); // no order found
        setSubmitting(false);
        return;
      }
      const { data } = await axios.post(`${API_URL}/payment/create`, 
        { orderID, paymentProvider: 'razorpay' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3. Navigate to payment page with paymentID
      setTimeout(() => navigate('/order-confirmation', { 
        state: { paymentID: data.payment.id, orderID } 
      }), 800);
      */
      setStatus('success');                              
      setTimeout(() => navigate('/order'), 1600);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setSubmitting(false);
    }
  };

  const activeCategory = INSTRUCTION_CATEGORIES.find(c => c.id === activeCategoryId);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="addr-page">
      <div className="addr-card">

        {/* Header */}
        <div className="addr-header">
          <button className="addr-back-btn" type="button" onClick={() => navigate('/order')}>
            <FaArrowLeft /> Back
          </button>
          <div className="addr-title-wrap">
            <div className="addr-title-icon"><FaMapMarkerAlt /></div>
            <div>
              <h1 className="addr-title">Add New Address</h1>
              <p className="addr-subtitle">Saved addresses speed up future checkouts</p>
            </div>
          </div>
        </div>

        {status === 'success' && (
          <div className="addr-alert success"><FaCheckCircle /> Address saved! Redirecting…</div>
        )}
        {status === 'error' && (
          <div className="addr-alert error">Something went wrong. Please try again.</div>
        )}

        <form className="addr-form" onSubmit={handleSubmit}>

          {/* ── Basic fields ── */}
          <div className="addr-grid">
            {FIELDS.map(({
              name, label, icon, type, required,
              half, onKeyDown, autoComplete, placeholder, maxLength,
            }) => {
              const isPincode       = name === 'pincode';
              const isAutoFillField = AUTO_FILL_FIELDS.includes(name);
              const isLocked  = isAutoFillField && pincodeValid && !unlockedFields.has(name);
              const isEditing = isAutoFillField && pincodeValid && unlockedFields.has(name);

              return (
                <div key={name} className={`addr-field ${half ? 'half' : ''}`}>
                  <div className="addr-label-row">
                    <label className="addr-label" htmlFor={name}>
                      {label}
                      {!required && <span className="addr-optional">optional</span>}
                    </label>

                    {isLocked && (
                      <div className="addr-autofill-controls">
                        <span className="addr-autofilled-badge">✓ auto-filled</span>
                        <button
                          type="button"
                          className="addr-edit-btn"
                          onClick={() => unlockField(name)}
                          title={`Edit ${label}`}
                        >
                          <FaPencilAlt /> Edit
                        </button>
                      </div>
                    )}

                    {isEditing && (
                      <span className="addr-editing-badge">✎ editing</span>
                    )}
                  </div>

                  <div className={`addr-input-wrap
                    ${focused === name   ? 'focused'    : ''}
                    ${formData[name]     ? 'filled'     : ''}
                    ${isLocked           ? 'autofilled' : ''}
                    ${isEditing          ? 'editing'    : ''}
                  `}>
                    <span className="addr-input-icon">
                      {/* Show spinner inside the pincode icon while loading */}
                      {isPincode && pincodeLoading
                        ? <span className="addr-spinner" />
                        : icon
                      }
                    </span>
                    <input
                      id={name}
                      name={name}
                      type={type}
                      value={formData[name]}
                      onChange={isPincode ? handlePincodeChange : handleChange}
                      onFocus={() => setFocused(name)}
                      onBlur={() => setFocused('')}
                      onKeyDown={isLocked ? undefined : onKeyDown}
                      required={required}
                      disabled={submitting || isLocked}
                      placeholder={
                        isPincode && pincodeLoading
                          ? 'Fetching details…'
                          : placeholder
                      }
                      className="addr-input"
                      autoComplete={autoComplete}
                      maxLength={maxLength}
                      readOnly={isLocked}
                    />
                  </div>

                  {/* Pincode error message */}
                  {isPincode && pincodeError && (
                    <p className="addr-pincode-error">{pincodeError}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Section divider ── */}
          <div className="addr-section-divider"><span>Delivery Preferences</span></div>

          {/* ── Address type ── */}
          <div className="addr-pref-block">
            <p className="addr-pref-label"><FaHome className="pref-icon" /> Address Type</p>
            <div className="addr-type-chips">
              {ADDRESS_TYPES.map(({ id, label, icon }) => (
                <button key={id} type="button"
                  className={`type-chip ${addressType === id ? 'active' : ''}`}
                  onClick={() => setAddressType(id)}>
                  {icon} {label}
                </button>
              ))}
            </div>
            {addressType === 'other' && (
              <div className={`addr-input-wrap mt-10 ${focused === 'customType' ? 'focused' : ''}`}>
                <span className="addr-input-icon"><FaEllipsisH /></span>
                <input
                  className="addr-input"
                  placeholder="Describe your address type"
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  onFocus={() => setFocused('customType')}
                  onBlur={() => setFocused('')}
                  onKeyDown={addressKeys}
                  maxLength={40}
                />
              </div>
            )}
          </div>

          {/* ── Weekend deliveries ── */}
          <div className="addr-pref-block">
            <p className="addr-pref-label"><FaTruck className="pref-icon" /> Weekend Deliveries</p>
            <div className="weekend-rows">
              {[
                { day: 'Saturday', value: satDelivery, setter: setSatDelivery },
                { day: 'Sunday',   value: sunDelivery, setter: setSunDelivery },
              ].map(({ day, value, setter }) => (
                <div key={day} className="weekend-row">
                  <span className="weekend-day">{day}</span>
                  <div className="weekend-options">
                    <button type="button"
                      className={`weekend-btn yes ${value === true ? 'active' : ''}`}
                      onClick={() => setter(v => v === true ? null : true)}>
                      <FaCheckCircle /> Yes
                    </button>
                    <button type="button"
                      className={`weekend-btn no ${value === false ? 'active' : ''}`}
                      onClick={() => setter(v => v === false ? null : false)}>
                      ✕ No
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Delivery instructions ── */}
          <div className="addr-pref-block">
            <button type="button" className="instructions-toggle"
              onClick={() => setInstructionsOpen(v => !v)}>
              <span className="addr-pref-label no-mb">
                <FaClipboardList className="pref-icon" /> Additional Delivery Instructions
                <span className="addr-optional">optional</span>
              </span>
              <FaChevronDown className={`toggle-chevron ${instructionsOpen ? 'open' : ''}`} />
            </button>

            {instructionsOpen && (
              <div className="instr-panel">

                {/* Selected tags */}
                {selectedInstructions.length > 0 && (
                  <div className="instr-tags-wrap">
                    {selectedInstructions.map(text => (
                      <InstructionTag
                        key={text}
                        text={text}
                        onRemove={() => removeInstruction(text)}
                      />
                    ))}
                  </div>
                )}

                {/* Category pills */}
                <div className="instr-categories">
                  {INSTRUCTION_CATEGORIES.map(cat => (
                    <button key={cat.id} type="button"
                      className={`instr-cat-pill ${activeCategoryId === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveCategoryId(v => v === cat.id ? null : cat.id)}>
                      <span className="pill-cat-icon">{cat.icon}</span>
                      {cat.label}
                      <FaChevronDown className={`pill-chevron ${activeCategoryId === cat.id ? 'open' : ''}`} />
                    </button>
                  ))}
                </div>

                {/* Active category panel */}
                {activeCategory && (
                  <div className="instr-suggestions">
                    <p className="instr-suggestions-label">
                      <span className="instr-cat-icon">{activeCategory.icon}</span>
                      {activeCategory.label}
                    </p>

                    {/* Location Guidance — free text only */}
                    {activeCategory.customOnly ? (
                      <div className="instr-custom-row">
                        <div className={`addr-input-wrap flex-1 ${focused === 'locationCustom' ? 'focused' : ''}`}>
                          <span className="addr-input-icon"><FaMapMarkerAlt /></span>
                          <input
                            className="addr-input"
                            placeholder={activeCategory.placeholder}
                            value={customInstruction}
                            onChange={e => setCustomInstruction(e.target.value)}
                            onFocus={() => setFocused('locationCustom')}
                            onBlur={() => setFocused('')}
                            maxLength={120}
                            onKeyDown={e => {
                              if (e.key === 'Enter') { e.preventDefault(); handleAddCustom(); }
                            }}
                          />
                        </div>
                        <button type="button" className="instr-add-btn"
                          onClick={handleAddCustom}
                          disabled={!customInstruction.trim()}>
                          <FaPlus /> Add
                        </button>
                      </div>

                    ) : (
                      /* All other categories — chips + optional special inputs */
                      <div className="instr-suggestion-chips">
                        {activeCategory.suggestions.map(s => {

                          /* Alternate phone input */
                          if (s.isPhoneInput) return (
                            <div key="alt_number" className="instr-input-chip-row">
                              <div className={`addr-input-wrap flex-1 ${focused === 'altPhone' ? 'focused' : ''}`}>
                                <span className="addr-input-icon"><FaPhone /></span>
                                <input
                                  className="addr-input"
                                  placeholder="Alternate number: +91 _______"
                                  value={altPhone}
                                  onChange={e => setAltPhone(e.target.value)}
                                  onFocus={() => setFocused('altPhone')}
                                  onBlur={() => setFocused('')}
                                  onKeyDown={phoneKeys}
                                  type="tel"
                                  maxLength={13}
                                />
                              </div>
                              <button type="button" className="instr-add-btn"
                                disabled={altPhone.trim().length < 10}
                                onClick={() => {
                                  addInstruction(`Alternate number: ${altPhone.trim()}`);
                                  setAltPhone('');
                                }}>
                                <FaPlus /> Add
                              </button>
                            </div>
                          );

                          /* Intercom code input */
                          if (s.isIntercomInput) return (
                            <div key="intercom" className="instr-input-chip-row">
                              <div className={`addr-input-wrap flex-1 ${focused === 'intercomCode' ? 'focused' : ''}`}>
                                <span className="addr-input-icon"><FaLock /></span>
                                <input
                                  className="addr-input"
                                  placeholder="Intercom code: e.g. 402"
                                  value={intercomCode}
                                  onChange={e => setIntercomCode(e.target.value)}
                                  onFocus={() => setFocused('intercomCode')}
                                  onBlur={() => setFocused('')}
                                  onKeyDown={addressKeys}
                                  maxLength={20}
                                />
                              </div>
                              <button type="button" className="instr-add-btn"
                                disabled={!intercomCode.trim()}
                                onClick={() => {
                                  addInstruction(`Intercom code: ${intercomCode.trim()}`);
                                  setIntercomCode('');
                                }}>
                                <FaPlus /> Add
                              </button>
                            </div>
                          );

                          /* Regular suggestion chip */
                          const already = selectedInstructions.includes(s.text);
                          return (
                            <button key={s.id} type="button"
                              className={`instr-suggestion-chip ${already ? 'added' : ''}`}
                              onClick={() => already ? removeInstruction(s.text) : addInstruction(s.text)}>
                              {already
                                ? <FaCheckCircle className="chip-check" />
                                : <FaPlus className="chip-plus" />
                              }
                              {s.text}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Global custom instruction row (always visible) */}
                <div className="instr-custom-row">
                  <div className={`addr-input-wrap flex-1 ${focused === 'customInstr' ? 'focused' : ''}`}>
                    <span className="addr-input-icon"><FaTag /></span>
                    <input
                      className="addr-input"
                      placeholder="Or type your own instruction…"
                      value={customInstruction}
                      onChange={e => setCustomInstruction(e.target.value)}
                      onFocus={() => setFocused('customInstr')}
                      onBlur={() => setFocused('')}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); handleAddCustom(); }
                      }}
                      maxLength={120}
                    />
                  </div>
                  <button type="button" className="instr-add-btn"
                    onClick={handleAddCustom}
                    disabled={!customInstruction.trim()}>
                    <FaPlus /> Add
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* ── Default address ── */}
          <label className="addr-default-row">
            <div className={`addr-checkbox ${isDefault ? 'checked' : ''}`}
              onClick={() => setIsDefault(v => !v)}>
              {isDefault && <FaCheckCircle />}
            </div>
            <div className="addr-default-text">
              <span className="addr-default-label">
                <FaStar className={`default-star ${isDefault ? 'active' : ''}`} /> Set as default address
              </span>
              <span className="addr-default-sub">Used automatically at checkout</span>
            </div>
          </label>

          {/* ── Actions ── */}
          <div className="addr-actions">
            <button type="submit" className="addr-submit-btn" disabled={submitting}>
              {submitting
                ? <><span className="addr-spinner" /> Saving…</>
                : <><FaCheckCircle /> Save Address</>
              }
            </button>
            <button type="button" className="addr-cancel-btn" onClick={() => navigate('/order')}>
              <FaArrowLeft /> Back to Order
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddAddress;