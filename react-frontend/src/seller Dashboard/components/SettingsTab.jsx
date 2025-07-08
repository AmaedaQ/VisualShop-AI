import React, { useState, useEffect } from "react";
import { BiSave, BiImageAdd, BiCreditCard, BiTaxi, BiBell, BiPencil } from "react-icons/bi";
import { Tab, Nav, Form, Card, Button, Image, InputGroup } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

const SettingsTab = () => {
  const { user, getCurrentUser } = useAuth();
  const [settings, setSettings] = useState({
    paymentMethods: {
      paypal: { enabled: true, email: "payments@mystore.com" },
      stripe: { enabled: true, apiKey: "sk_test_123456789" },
      jazzCash: { enabled: false },
      cod: { enabled: true },
    },
    shippingSettings: {
      freeShipping: true,
      freeShippingThreshold: 50,
      methods: [
        { name: "Standard Shipping", days: "3-5 business days", price: 5.99 },
        { name: "Express Shipping", days: "1-2 business days", price: 12.99 },
        { name: "Next Day Delivery", days: "Next business day", price: 19.99 },
      ],
    },
    notificationSettings: {
      email: { newOrder: true, lowStock: true, customerReview: true, promotions: false },
      push: { newOrder: true, lowStock: false },
    },
  });
  const [editField, setEditField] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const profile = await getCurrentUser();
        setUserProfile(profile);
      }
    };
    fetchUserProfile();
  }, [user, getCurrentUser]);

  useEffect(() => {
    const saved = localStorage.getItem("storeSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("storeSettings", JSON.stringify(settings));
  }, [settings]);

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings((prev) => ({
          ...prev,
          paymentMethods: { ...prev.paymentMethods }, // Ensure other settings remain intact
        }));
        // Note: Logo update requires backend integration to persist
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle payment method toggle
  const togglePaymentMethod = (method) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: { ...prev.paymentMethods[method], enabled: !prev.paymentMethods[method].enabled },
      },
    }));
  };

  // Handle payment method details change
  const handlePaymentMethodChange = (method, field, value) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: { ...prev.paymentMethods[method], [field]: value },
      },
    }));
  };

  // Handle shipping settings change
  const handleShippingSettingsChange = (e) => {
    const { id, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      shippingSettings: { ...prev.shippingSettings, [id]: type === "checkbox" ? checked : value },
    }));
  };

  // Handle shipping method price change
  const handleShippingMethodPriceChange = (index, value) => {
    const updatedMethods = [...settings.shippingSettings.methods];
    updatedMethods[index].price = parseFloat(value) || 0;
    setSettings((prev) => ({
      ...prev,
      shippingSettings: { ...prev.shippingSettings, methods: updatedMethods },
    }));
  };

  // Handle notification settings change
  const handleNotificationSettingsChange = (type, setting, checked) => {
    setSettings((prev) => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [type]: { ...prev.notificationSettings[type], [setting]: checked },
      },
    }));
  };

  // Save settings
  const handleSaveSettings = () => {
    console.log("Saving settings:", settings);
    alert("Settings saved successfully!");
  };

  // Toggle edit mode for a field
  const toggleEdit = (field) => {
    setEditField(editField === field ? null : field);
  };

  return (
    <div className="tab-pane fade show active p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-dark fw-bold">Account Settings</h3>
        <Button variant="primary" onClick={handleSaveSettings} className="d-flex align-items-center">
          <BiSave className="me-2" /> Save Changes
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Tab.Container defaultActiveKey="profile">
            <Nav variant="tabs" className="nav-pills px-3 pt-3 bg-light">
              <Nav.Item>
                <Nav.Link eventKey="profile" className="text-dark">Store Profile</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="payment" className="text-dark">Payment Methods</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="shipping" className="text-dark">Shipping</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="notifications" className="text-dark">Notifications</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content className="p-4">
              {/* Store Profile Tab */}
              <Tab.Pane eventKey="profile">
                <div className="row mb-4">
                  <div className="col-md-3 text-center">
                    <Image
                      src={userProfile?.logo || "https://via.placeholder.com/150?text=Store"}
                      alt="Store Logo"
                      className="img-thumbnail rounded-circle border"
                      style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    />
                    <div className="d-grid mt-3">
                      <input
                        type="file"
                        id="logoUpload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={{ display: "none" }}
                      />
                      <Button
                        variant="outline-primary"
                        as="label"
                        htmlFor="logoUpload"
                        className="d-flex align-items-center justify-content-center"
                      >
                        <BiImageAdd className="me-2" /> Change Logo
                      </Button>
                    </div>
                  </div>
                  <div className="col-md-9">
                    {userProfile && userProfile.account_type === "business" && (
                      <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-light">
                          <h5 className="mb-0 text-dark fw-bold">Business Profile</h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="row g-3">
                            {[
                              { label: "Business Name", value: userProfile.business_name },
                              { label: "Business Email", value: userProfile.business_email },
                              { label: "Tax ID", value: userProfile.tax_id },
                              { label: "Website", value: userProfile.website },
                              { label: "Business Type", value: userProfile.business_type },
                              { label: "Product Category", value: userProfile.product_category },
                              { label: "Owner Name", value: userProfile.owner_name },
                              { label: "Owner Phone", value: userProfile.owner_phone },
                              { label: "ID Number", value: userProfile.id_number },
                              { label: "Bank Name", value: userProfile.bank_name },
                              { label: "Account Number", value: userProfile.account_number },
                              { label: "SWIFT Code", value: userProfile.swift_code },
                            ].map(({ label, value }, index) => (
                              <div key={index} className="col-md-6">
                                <Form.Group>
                                  <Form.Label className="text-muted">{label}</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={value || "N/A"}
                                    readOnly
                                    className="bg-light"
                                  />
                                </Form.Group>
                              </div>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </div>
                </div>
              </Tab.Pane>

              {/* Payment Methods Tab */}
              <Tab.Pane eventKey="payment">
                <h5 className="mb-4 text-dark fw-bold d-flex align-items-center">
                  <BiCreditCard className="me-2" /> Payment Methods
                </h5>
                {Object.keys(settings.paymentMethods).map((method) => (
                  <div key={method} className="mb-4">
                    <Form.Check
                      type="switch"
                      id={`${method}Enabled`}
                      label={method.charAt(0).toUpperCase() + method.slice(1)}
                      checked={settings.paymentMethods[method].enabled}
                      onChange={() => togglePaymentMethod(method)}
                      className="mb-2"
                    />
                    {settings.paymentMethods[method].enabled && (
                      <div className="ms-4">
                        {Object.keys(settings.paymentMethods[method]).map((field) => {
                          if (field === "enabled") return null;
                          return (
                            <Form.Group key={field} className="mb-3">
                              <Form.Label className="d-flex justify-content-between align-items-center">
                                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                                <BiPencil
                                  className="text-muted cursor-pointer"
                                  onClick={() => toggleEdit(`payment_${method}_${field}`)}
                                />
                              </Form.Label>
                              {editField === `payment_${method}_${field}` ? (
                                <Form.Control
                                  type={field === "email" ? "email" : "text"}
                                  value={settings.paymentMethods[method][field]}
                                  onChange={(e) => handlePaymentMethodChange(method, field, e.target.value)}
                                  onBlur={() => toggleEdit(null)}
                                  autoFocus
                                />
                              ) : (
                                <Form.Control
                                  type="text"
                                  value={settings.paymentMethods[method][field]}
                                  readOnly
                                />
                              )}
                            </Form.Group>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </Tab.Pane>

              {/* Shipping Tab */}
              <Tab.Pane eventKey="shipping">
                <h5 className="mb-4 text-dark fw-bold d-flex align-items-center">
                  <BiTaxi className="me-2" /> Shipping Settings
                </h5>
                <Form.Check
                  type="switch"
                  id="freeShipping"
                  label="Enable Free Shipping"
                  checked={settings.shippingSettings.freeShipping}
                  onChange={handleShippingSettingsChange}
                  className="mb-3"
                />
                {settings.shippingSettings.freeShipping && (
                  <Form.Group className="mb-4">
                    <Form.Label className="d-flex justify-content-between align-items-center">
                      Minimum Order Amount for Free Shipping ($)
                      <BiPencil
                        className="text-muted cursor-pointer"
                        onClick={() => toggleEdit("shipping_freeShippingThreshold")}
                      />
                    </Form.Label>
                    {editField === "shipping_freeShippingThreshold" ? (
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          value={settings.shippingSettings.freeShippingThreshold}
                          onChange={handleShippingSettingsChange}
                          onBlur={() => toggleEdit(null)}
                          autoFocus
                        />
                      </InputGroup>
                    ) : (
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          value={settings.shippingSettings.freeShippingThreshold}
                          readOnly
                        />
                      </InputGroup>
                    )}
                  </Form.Group>
                )}
                <Form.Label className="mb-3">Shipping Methods</Form.Label>
                {settings.shippingSettings.methods.map((method, index) => (
                  <Card key={index} className="mb-3 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{method.name}</h6>
                          <p className="text-muted mb-0"><small>{method.days}</small></p>
                        </div>
                        <InputGroup style={{ width: "150px" }}>
                          <InputGroup.Text>$</InputGroup.Text>
                          <Form.Control
                            type="number"
                            value={method.price}
                            onChange={(e) => handleShippingMethodPriceChange(index, e.target.value)}
                          />
                        </InputGroup>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Tab.Pane>

              {/* Notifications Tab */}
              <Tab.Pane eventKey="notifications">
                <h5 className="mb-4 text-dark fw-bold d-flex align-items-center">
                  <BiBell className="me-2" /> Notification Settings
                </h5>
                <div className="mb-4">
                  <Form.Label className="mb-3">Email Notifications</Form.Label>
                  {Object.keys(settings.notificationSettings.email).map((setting) => (
                    <Form.Check
                      key={setting}
                      type="checkbox"
                      id={`email_${setting}`}
                      label={setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      checked={settings.notificationSettings.email[setting]}
                      onChange={(e) => handleNotificationSettingsChange("email", setting, e.target.checked)}
                      className="mb-2"
                    />
                  ))}
                </div>
                <div className="mb-3">
                  <Form.Label className="mb-3">Push Notifications</Form.Label>
                  {Object.keys(settings.notificationSettings.push).map((setting) => (
                    <Form.Check
                      key={setting}
                      type="checkbox"
                      id={`push_${setting}`}
                      label={setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      checked={settings.notificationSettings.push[setting]}
                      onChange={(e) => handleNotificationSettingsChange("push", setting, e.target.checked)}
                      className="mb-2"
                    />
                  ))}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SettingsTab;