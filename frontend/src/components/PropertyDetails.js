import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, InputGroup, Col } from 'react-bootstrap';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const PropertyModal = ({ show, handleClose, db, propertyId = null, refreshProperties }) => {
    const initialState = useMemo(() => ({
        PropertyName: '',
        Address: '',
        Description: '',
        OwnerName: '',
        OwnerPhoneNumber: '',
        OwnerEmail: '',
        Postcode: '',
        Price: '',
        Status: [],
        Type: [],
        createdAt: null,
        updatedAt: null,
        Bathrooms: '',
        Bedrooms: '',
        Size: '',
        KeyNumber: '',
    }), []);

    const [propertyDetails, setPropertyDetails] = useState(initialState);

    const allStatuses = ["Vacant", "Occupied", "Under Maintenance"];
    const allTypes = ["Studio", "Flat", "House", "Penthouse"];

    useEffect(() => {
        const getPropertyDetails = async () => {
            if (propertyId) {
                const docRef = doc(db, "Property", propertyId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPropertyDetails(docSnap.data());
                }
            } else {
                // Reset to initialState if theres no propertyId (adding new property)
                setPropertyDetails(initialState);
            }
        };

        if (show) {
            getPropertyDetails();
        }
    }, [propertyId, db, initialState, show]); // Adding show  to ensure reset when modal opens

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'Price' || name === 'Bathrooms' || name === 'Bedrooms' || name === 'Size') {
            const numericValue = parseInt(value.replace(/\D/g, ''), 10); // Remove non-numeric characters and parse to integer
            setPropertyDetails({ ...propertyDetails, [name]: numericValue });
        } else {
            setPropertyDetails({ ...propertyDetails, [name]: value });
        }
    };
    
    const handleSubmit = async () => {
        const updatedDetails = { ...propertyDetails };
        if (!updatedDetails.createdAt) {
            updatedDetails.createdAt = serverTimestamp();
        }
        updatedDetails.updatedAt = serverTimestamp();

        if (propertyId) {
            await updateDoc(doc(db, "Property", propertyId), updatedDetails);
        } else {
            const docRef = await addDoc(collection(db, "Property"), updatedDetails);
        }
        refreshProperties();
        handleClose();
    };


    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{propertyId ? 'Edit Property' : 'Add Property'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formPropertyName">
                        <Form.Label>Property Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter property name"
                            name="PropertyName"
                            value={propertyDetails.PropertyName || ''}
                            onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formAddress">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter address"
                            name="Address"
                            value={propertyDetails.Address || ''}
                            onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Property description"
                            name="Description"
                            value={propertyDetails.Description || ''}
                            onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="form Owner Name">
                        <Form.Label>Owner Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter owner's name"
                            name="OwnerName"
                            value={propertyDetails.OwnerName || ''}
                            onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formOwnerPhoneNumber">
                        <Form.Label>Owner Phone Number</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter owner's phone number"
                            name="OwnerPhoneNumber"
                            value={propertyDetails.OwnerPhoneNumber || ''}
                            onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formOwnerEmail">
                        <Form.Label>Owner Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter owner's email address"
                            name="OwnerEmail"
                            value={propertyDetails.OwnerEmail || ''}
                            onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPostcode">
                        <Form.Label>Postcode</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter postcode"
                            name="Postcode"
                            value={propertyDetails.Postcode || ''}
                            onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPrice">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter price"
                            name="Price"
                            value={propertyDetails.Price || ''}
                            onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBathrooms">
                        <Form.Label>Bathrooms</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter number of bathrooms"
                            name="Bathrooms"
                            value={propertyDetails.Bathrooms || ''}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBedrooms">
                        <Form.Label>Bedrooms</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter number of bedrooms"
                            name="Bedrooms"
                            value={propertyDetails.Bedrooms || ''}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formSize">
                        <Form.Label>Size (sq. feet)</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="number"
                                placeholder="Enter property size"
                                name="Size"
                                value={propertyDetails.Size || ''}
                                onChange={handleChange}
                            />
                            <InputGroup.Text>sq. feet</InputGroup.Text>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridStatus">
                        <Form.Label>Status</Form.Label>
                        {allStatuses.map((status, index) => (
                            <Form.Check
                                type="checkbox"
                                label={status}
                                name="Status"
                                value={status || ''}
                                checked={propertyDetails.Status && propertyDetails.Status.includes(status)}
                                onChange={handleChange}
                                key={index}
                            />
                        ))}
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridType">
                        <Form.Label>Type</Form.Label>
                        {allTypes.map((type, index) => (
                            <Form.Check
                                type="checkbox"
                                label={type}
                                name="Type"
                                value={type || ''}
                                checked={propertyDetails.Type.includes(type)}
                                onChange={handleChange}
                                key={index}
                            />
                        ))}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formKeyNumber">
                        <Form.Label>Key Number</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter key number"
                            name="KeyNumber"
                            value={propertyDetails.KeyNumber || ''}
                            onChange={handleChange} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="warning" onClick={handleSubmit}>Save Changes</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PropertyModal;
