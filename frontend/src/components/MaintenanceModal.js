import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config.js';

const MaintenanceModal = ({ show, handleClose, issueId = null, refreshIssues }) => {
    const initialState = useMemo(() => ({
        description: '',
        status: '',
        propertyId: '',
        tenantId: '',
        price: '',
        createdAt: '',
        updatedAt: '',
    }), []);

    const [issueDetails, setIssueDetails] = useState(initialState);
    const [properties, setProperties] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);

    useEffect(() => {
        if (show) {
            const fetchProperties = async () => {
                const querySnapshot = await getDocs(collection(db, "Property"));
                const propertyList = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                }));
                setProperties(propertyList);
            };
            fetchProperties();
        }
    }, [show]);

    useEffect(() => {
        const fetchTenantDetails = async () => {
            if (issueDetails.propertyId) {
                const tenantQuery = query(collection(db, "Tenants"), where("propertyId", "==", issueDetails.propertyId));
                const tenantSnapshot = await getDocs(tenantQuery);
                if (!tenantSnapshot.empty) {
                    const tenantData = tenantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0]; // Assuming one tenant per property
                    setSelectedTenant(tenantData);
                } else {
                    setSelectedTenant(null);
                }
            }
        };
        fetchTenantDetails();
    }, [issueDetails.propertyId]);

    useEffect(() => {
        const getIssueDetails = async () => {
            if (issueId && show) {
                const issueRef = doc(db, "MaintenanceRequests", issueId);
                const issueSnap = await getDoc(issueRef);
                if (issueSnap.exists()) {
                    const issueData = issueSnap.data();
                    setIssueDetails(issueData);
                    if (issueData.propertyId) {
                        const propertyRef = doc(db, "Property", issueData.propertyId);
                        const propertySnap = await getDoc(propertyRef);
                        if (propertySnap.exists()) {
                            setSearchQuery(propertySnap.data().Address); // Set address to searchQuery
                        }
                    }
                }
            } else {
                setIssueDetails(initialState);
                setSearchQuery(''); // Clear the search query for the new issue form
                setSelectedTenant(null); // Reset any selected tenant for the new issue form
            }
        };

        getIssueDetails();
    }, [issueId, show, initialState]);

    const handlePropertySelect = async (property) => {
        setIssueDetails({ ...issueDetails, propertyId: property.id, propertyAddress: property.Address, KeyNumber: property.KeyNumber });
        setSearchQuery(property.Address);
        setShowSuggestions(false);  // Hide the suggestions dropdown

        //fetch the corresponding tenant based on the selected property
        const tenantQuery = query(collection(db, "Tenants"), where("propertyId", "==", property.id));
        const querySnapshot = await getDocs(tenantQuery);

        if (!querySnapshot.empty) {
            const tenant = querySnapshot.docs[0].data();
            const tenantId = querySnapshot.docs[0].id;


            // Update both the selected tenant state and the issueDetails state with the new tenant information
            setSelectedTenant(tenant);
            setIssueDetails(prev => ({ ...prev, tenantId: tenantId }));
        } else {
            console.log("No tenants found for property ID: ", property.id);  //when no tenants are found
            setSelectedTenant(null);
            setIssueDetails(prev => ({ ...prev, tenantId: '' }));  //Clear tenantId if no tenant is found
        }
    };

    const handleSubmit = async () => {
        // If price should be stored as a number, convert it from string
        const updatedDetails = {
            ...issueDetails,
            updatedAt: new Date(),
            price: issueDetails.price ? parseFloat(issueDetails.price) : 0
        };

        if (!updatedDetails.createdAt) {
            updatedDetails.createdAt = new Date();
        }

        // Save the updated details back to Firestore
        if (issueId) {
            await updateDoc(doc(db, "MaintenanceRequests", issueId), updatedDetails);
        } else {
            const docRef = await addDoc(collection(db, "MaintenanceRequests"), updatedDetails);
        }
        refreshIssues();
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{issueId ? 'Edit Issue' : 'Add Issue'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3 position-relative" controlId="formPropertySearch">
                        <Form.Label>Property Address</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Search properties by address"
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            autoComplete="off"
                        />
                        {showSuggestions && searchQuery && (
                            <div className="autocomplete-dropdown-container position-absolute bg-dark shadow p-3 mb-5 rounded">
                                {properties.filter(property => property.Address.toLowerCase().includes(searchQuery.toLowerCase())).map(property => (
                                    <OverlayTrigger
                                        key={property.id}
                                        placement="right"
                                        overlay={<Tooltip>Click to add</Tooltip>}
                                    >
                                        <div
                                            className="suggestion-item my-1 p-2 border-bottom"
                                            onClick={() => handlePropertySelect(property)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {property.Address}
                                        </div>
                                    </OverlayTrigger>
                                ))}
                            </div>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-3 " controlId="formDescription">
                        <Form.Label>Issue Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={issueDetails.description}
                            onChange={e => setIssueDetails({ ...issueDetails, [e.target.name]: e.target.value })}
                            maxLength="100"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formPrice">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter price"
                            name="price"
                            value={issueDetails.price}
                            onChange={e => setIssueDetails({ ...issueDetails, [e.target.name]: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formStatus">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                            aria-label="Select issue status"
                            name="status"
                            value={issueDetails.status}
                            onChange={e => setIssueDetails({ ...issueDetails, [e.target.name]: e.target.value })}>
                            <option value="">Choose...</option>
                            <option value="Outstanding">Outstanding</option>
                            <option value="Completed">Completed</option>
                            <option value="Failed/Deferred">Failed/Deferred</option>
                        </Form.Select>
                    </Form.Group>
                    {/* Display tenant details */}
                    {selectedTenant && (
                        <div>
                            <h5>Tenant Details</h5>
                            <p><strong>Name:</strong> {selectedTenant.firstName} {selectedTenant.lastName}</p>
                            <p><strong>Email:</strong> {selectedTenant.email}</p>
                            <p><strong>Contact:</strong> {selectedTenant.contactNumber}</p>
                        </div>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="warning" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default MaintenanceModal;
