import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, InputGroup, Row, Col, Badge } from 'react-bootstrap';
import { doc, getDoc,deleteDoc, updateDoc, addDoc, collection, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';

const TenantModal = ({ show, handleClose, db, tenantId = null, refreshTenants }) => {
    const initialState = useMemo(() => ({
        firstName: '',
        lastName: '',
        email: '',
        areaCode: '',
        contactNumber: '',
        propertyId: '',
        createdAt: null,
        role: 'Tenant',
    }), []);

    const [tenantDetails, setTenantDetails] = useState(initialState);
    const [properties, setProperties] = useState([]);
    const [leases, setLeases] = useState([]);

    useEffect(() => {
        if (!show) return;

        // Set initial state to blank fields
        setTenantDetails({
            firstName: '',
            lastName: '',
            email: '',
            areaCode: '',
            contactNumber: '',
            propertyId: '',
            createdAt: null,
            role: 'Tenant',
        });

        const fetchProperties = async () => {
            const querySnapshot = await getDocs(collection(db, "Property"));
            const propertyList = querySnapshot.docs.map(docSnapshot => ({
                id: docSnapshot.id,
                ...docSnapshot.data()
            }));
            setProperties(propertyList);
        };
        fetchProperties();
    }, [show, db]);


    useEffect(() => {
        if (!show || !tenantId) return;
        const getTenantDetails = async () => {
            const docRef = doc(db, "Tenants", tenantId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setTenantDetails(docSnap.data());
            } else {
                setTenantDetails(initialState);
            }
        };
        getTenantDetails();
    }, [tenantId, show, db, initialState]);

    useEffect(() => {
        if (!show || !tenantId) return;

        const fetchLeases = async () => {
            const leasesQuery = query(collection(db, "Leases"), where("PropertyUserId", "==", tenantId));
            const querySnapshot = await getDocs(leasesQuery);
            const leasesList = querySnapshot.docs.map(async docSnapshot => {
                const leaseData = docSnapshot.data();
                leaseData.id = docSnapshot.id;
                // Check if startDate and endDate are Firestore timestamps and convert it; otherwise, leave as it is
                leaseData.startDate = leaseData.startDate?.toDate ? leaseData.startDate.toDate().toISOString().split('T')[0] : leaseData.startDate;
                leaseData.endDate = leaseData.endDate?.toDate ? leaseData.endDate.toDate().toISOString().split('T')[0] : leaseData.endDate;

                // Calculate if the lease is expired
                const isExpired = leaseData.endDate ? new Date(leaseData.endDate) < new Date() : false;
                leaseData.isExpired = isExpired;

                // Fetch property details to populate rent
                const propertyDoc = await getDoc(doc(db, "Property", leaseData.propertyId));
                const propertyData = propertyDoc.data();
                if (propertyData) {
                    leaseData.rent = propertyData.Price;
                }

                return leaseData;
            });
            const populatedLeasesList = await Promise.all(leasesList);
            setLeases(populatedLeasesList);
        };

        fetchLeases();
    }, [show, tenantId, db]);

    useEffect(() => {
        // This effect runs only when the modal is opened for a new tenant (example- when the tenantId is null)
        if (show && !tenantId) {
            setTenantDetails(initialState);  // Reset tenant details to initial state
    
            const fetchProperties = async () => {
                const querySnapshot = await getDocs(collection(db, "Property"));
                const propertyList = querySnapshot.docs.map(docSnapshot => ({
                    id: docSnapshot.id,
                    ...docSnapshot.data()
                }));
                setProperties(propertyList);
            };
            fetchProperties();
    
            // Initialize with one empty lease to allow users to input lease details immediately
            setLeases([{
                startDate: '',
                endDate: '',
                terms: '',
                rent: '',
                deposit: '',
                propertyId: '',
                PropertyUserId: 'new',
            }]);
        }
    }, [show, tenantId, db, initialState]);  // Dependencies array
    


    const handleAddNewLease = () => {
        // Adding default lease structure, only add if it's a new tenant or explicitly adding a new lease
        const newLease = {
            startDate: '',
            endDate: '',
            terms: '',
            rent: '',
            deposit: '',
            propertyId: tenantDetails.propertyId, 
            PropertyUserId: tenantId || 'new', 
        };
    
        //adding an empty structure for a new lease
        setLeases(prevLeases => [...prevLeases, newLease]);
    };
    
    

    const handleLeaseChange = (index, field, value) => {
        const updatedLeases = [...leases];
        updatedLeases[index] = { ...updatedLeases[index], [field]: value };
        setLeases(updatedLeases);
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;
        if (name === 'rent') {
            // Update rent in tenantDetails
            setTenantDetails({ ...tenantDetails, [name]: value || '' }); // Ensure value is never undefined
            // Fetch property details to update rent in Property collection
            const propertyRef = doc(db, "Property", tenantDetails.propertyId);
            const propertyDoc = await getDoc(propertyRef);
            if (propertyDoc.exists()) {
                const propertyData = propertyDoc.data();
                // Update rent in Property collection
                await updateDoc(propertyRef, { ...propertyData, Price: value || '' }); // Ensure value is never undefined
            }

            // Update rent in leases
            const updatedLeases = leases.map(lease => {
                if (lease.propertyId === tenantDetails.propertyId) {
                    return { ...lease, rent: value || '' }; // Ensure value is never undefined
                }
                return lease;
            });
            setLeases(updatedLeases);
        } else {
            // Otherwise, update other fields as usual
            setTenantDetails({ ...tenantDetails, [name]: value });
        }
    };



    const handleDeleteLease = async (index) => {
        const leaseToDelete = leases[index];
        if (leaseToDelete && leaseToDelete.id) {
            // Delete the lease from Firestore if it has an id
            try {
                await deleteDoc(doc(db, "Leases", leaseToDelete.id));
            } catch (error) {
                return; // Stop the function if there's an error
            }
        }
        
        // Remove the lease entry from the local state
        const updatedLeases = [...leases];
        updatedLeases.splice(index, 1);
        setLeases(updatedLeases);
    };

    const handleSubmit = async () => {
        try {
            // Tenant creation or update
            let effectiveTenantId = tenantId;
            if (!effectiveTenantId) {
                // If creating a new tenant, include createdAt timestamp
                const docRef = await addDoc(collection(db, "Tenants"), {
                    ...tenantDetails,
                    createdAt: serverTimestamp()
                });
                effectiveTenantId = docRef.id;
    
                // Immediately add lease data if present for a new tenant
                for (const lease of leases) {
                    // Assuming leases were added before saving the tenant
                    const { startDate, endDate, ...otherLeaseData } = lease;
                    const leaseData = {
                        ...otherLeaseData,
                        PropertyUserId: effectiveTenantId, // Linking new tenant to the lease
                        propertyId: tenantDetails.propertyId,
                        startDate: startDate ? Timestamp.fromDate(new Date(startDate)) : null,
                        endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
                    };
                    // Creating new lease for the new tenant
                    await addDoc(collection(db, "Leases"), {
                        ...leaseData,
                        createdAt: serverTimestamp()
                    });
                }
            } else {
                // Update existing tenant details
                await updateDoc(doc(db, "Tenants", effectiveTenantId), {
                    ...tenantDetails,
                    updatedAt: serverTimestamp()
                });
    
                // Handle updates or creation of leases for existing tenants
                for (const lease of leases) {
                    const { id, startDate, endDate, ...otherLeaseData } = lease;
                    const leaseData = {
                        ...otherLeaseData,
                        PropertyUserId: effectiveTenantId,
                        propertyId: tenantDetails.propertyId,
                        startDate: startDate ? Timestamp.fromDate(new Date(startDate)) : null,
                        endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
                    };
    
                    if (id) {
                        // Update existing lease
                        await updateDoc(doc(db, "Leases", id), leaseData);
                    } else {
                        // Create new lease for existing tenant
                        await addDoc(collection(db, "Leases"), {
                            ...leaseData,
                            createdAt: serverTimestamp()
                        });
                    }
                }
            }
    
            refreshTenants(); // Refresh tenant list to reflect changes
            handleClose(); // Close the modal
            setLeases([]); // Clear the leases array to avoid data retention
        } catch (error) {
            console.error("Error saving tenant details:", error);
        }
    };
    
    


    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{tenantId ? 'Edit Tenant' : 'Add Tenant'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formFirstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter first name"
                            name="firstName"
                            value={tenantDetails.firstName || ''}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formLastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter last name"
                            name="lastName"
                            value={tenantDetails.lastName || ''}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            name="email"
                            value={tenantDetails.email || ''}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formAreaCode">
                        <Form.Label>Area Code</Form.Label>
                        <InputGroup>
                            <InputGroup.Text id="inputGroupPrepend">+</InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Enter area code"
                                name="areaCode"
                                value={tenantDetails.areaCode || ''}
                                onChange={handleChange}
                                maxLength={4}
                            />
                            <Form.Control
                                type="tel"
                                placeholder="Enter contact number"
                                name="contactNumber"
                                value={tenantDetails.contactNumber || ''}
                                onChange={handleChange}
                                pattern="[0-9]{5,22}"
                                required
                            />
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formProperty">
                        <Form.Label>Property</Form.Label>
                        <Form.Select
                            aria-label="Select property"
                            name="propertyId"
                            value={tenantDetails.propertyId || ''}
                            onChange={handleChange}>
                            <option value="">Choose...</option>
                            {properties.map(property => (
                                <option key={property.id} value={property.id}>
                                    {property.Address}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Leases Display */}
                    {leases.map((lease, index) => (
                        <div key={index} style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
                            {/* Lease details fields */}
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={4}>Last Updated:</Form.Label>
                                <Col sm={8}>
                                    <Form.Control
                                        type="text"
                                        disabled // Make this field read-only
                                        value={lease.updatedAt ? new Date(lease.updatedAt.seconds * 1000).toLocaleDateString() : 'Not Updated'}
                                    />
                                </Col>

                            </Form.Group>

                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={4}>Start Date:</Form.Label>
                                <Col sm={8}>
                                    <Form.Control
                                        type="date"
                                        value={lease.startDate ? lease.startDate : ''}
                                        onChange={(e) => handleLeaseChange(index, 'startDate', e.target.value)}
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={4}>End Date:</Form.Label>
                                <Col sm={8}>
                                    <Form.Control
                                        type="date"
                                        value={lease.endDate ? lease.endDate : ''}
                                        onChange={(e) => handleLeaseChange(index, 'endDate', e.target.value)}
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={4}>Terms:</Form.Label>
                                <Col sm={8}>
                                    <Form.Control
                                        type="text"
                                        value={lease.terms || ''}
                                        onChange={(e) => handleLeaseChange(index, 'terms', e.target.value)}
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={4}>Rent:</Form.Label>
                                <Col sm={8}>
                                    <Form.Control
                                        type="number"
                                        value={tenantDetails.rent || ''}
                                        onChange={handleChange}
                                        name="rent" // Ensure to handle changes in the rent field
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={4}>Deposit:</Form.Label>
                                <Col sm={8}>
                                    <Form.Control
                                        type="text"
                                        value={lease.deposit || ''}
                                        onChange={(e) => handleLeaseChange(index, 'deposit', e.target.value)}
                                    />
                                </Col>
                            </Form.Group>
                            {/* Display lease expiration status */}
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={4}>Expiration Status:</Form.Label>
                                <Col sm={8}>
                                    <Badge bg={lease.isExpired ? 'danger' : 'success'} style={{ fontSize: 'medium', padding: '8px' }}>
                                        {lease.isExpired ? 'Expired' : 'Active'}
                                    </Badge>
                                </Col>
                            </Form.Group>


                            <Button variant="danger" size="sm" className="mb-3" onClick={() => handleDeleteLease(index)}>Delete Lease</Button>
                        </div>
                    ))}

                    <Button variant="warning" onClick={handleAddNewLease}>Add New Lease</Button>
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

};

export default TenantModal;

