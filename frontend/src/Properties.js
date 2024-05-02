import React, { useState, useEffect } from 'react';
import { Button, Table, Spinner, Container, Row, Col, OverlayTrigger, Tooltip, Modal, Form, InputGroup } from 'react-bootstrap';
import { db } from './firebase-config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import PropertyDetails from './components/PropertyDetails';
import 'bootstrap/dist/css/bootstrap.min.css';
import ScrollToTop from './components/ScrollToTop';
import DashboardSidebar from './components/DashboardSidebar';

function PropertyManagement() {
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPropertyDetails, setSelectedPropertyDetails] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);

    const fetchProperties = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "Property"));
            const propertiesData = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
                updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : null
            }));
            setProperties(propertiesData);
            setError(null); // Clear error if successful
        } catch (error) {
            console.error("Error fetching properties:", error);
            setError("Error fetching properties. Please try again later.");
        } finally {

            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleShowModal = (propertyId = null) => {
        setSelectedPropertyId(propertyId);
        // Check if a new property is being added (i.e., propertyId is null)
        if (!propertyId) {
            // Reset selectedPropertyDetails to null or an empty state
            setSelectedPropertyDetails(null);
        }
        setModalShow(true);
    };


    const handleCloseModal = () => {
        setModalShow(false);
        setSelectedPropertyId(null);
    };

    const handleShowDetailsModal = (propertyDetails) => {
        setSelectedPropertyDetails(propertyDetails);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedPropertyDetails(null);
    };

    const refreshProperties = () => {
        fetchProperties();
    };

    const handleEditClick = (event, propertyId) => {
        event.stopPropagation(); // Prevent propagation to parent <tr>
        handleShowModal(propertyId);
    };

    const handleDeleteClick = async (event, propertyId) => {
        event.stopPropagation(); // Prevent propagation to parent <tr>
        setIsLoading(true);
        await deleteDoc(doc(db, "Property", propertyId));
        refreshProperties();
    };

    const matchesSearchQuery = (property, query) => {
        for (const key in property) {
            if (property[key] && property[key].toString().toLowerCase().includes(query.toLowerCase())) {
                return true;
            }
        }
        return false;
    };

    // Filter properties based on search query
    const filteredProperties = properties.filter(property => matchesSearchQuery(property, searchQuery));

    return (
        <Container fluid className="px-0">
            <Row>
                <Col sm={2}>
                    <DashboardSidebar />
                </Col>
                <Col sm={9}>
                    <h2 className="text-center mt-3">Property Management</h2>
                    <Col sm={5}>
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Search by property name"
                                value={searchQuery || ''}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button variant="outline-secondary" onClick={() => setSearchQuery('')}>Clear</Button>
                        </InputGroup>
                        <Button variant="warning" className="mb-3" style={{ width: '150px' }} onClick={() => handleShowModal(null)}>Add Property</Button>
                    </Col>

                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>

                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Col sm={11}>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Key Number</th>
                                        <th>Property Address</th>
                                        <th>Description</th>
                                        <th>Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProperties.map((property) => (
                                        <OverlayTrigger
                                            key={property.id}
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-${property.id}`}>Click to view property details</Tooltip>}
                                        >
                                            <tr onClick={() => handleShowDetailsModal(property)} style={{ cursor: 'pointer' }}>
                                                <td>{property.KeyNumber || ''}</td>
                                                <td>{property.Address}</td>
                                                <td className='text-break'>{property.Description}</td>
                                                <td>{property.Price}</td>
                                                <td>
                                                    <Button variant="warning" onClick={(e) => { e.stopPropagation(); handleEditClick(e, property.id); }}>Edit</Button>{' '}
                                                    <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleDeleteClick(e, property.id); }}>Delete</Button>
                                                </td>
                                            </tr>
                                        </OverlayTrigger>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    )}
                    <PropertyDetails
                        show={modalShow}
                        handleClose={handleCloseModal}
                        db={db}
                        propertyId={selectedPropertyId}
                        refreshProperties={refreshProperties}
                    />
                    {selectedPropertyDetails && (
                        <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title><u>Property Details</u></Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p><strong>Property Name:</strong> {selectedPropertyDetails.PropertyName}</p>
                                <p><strong>Address:</strong> {selectedPropertyDetails.Address}</p>
                                <p className='text-break'><strong>Description:</strong> {selectedPropertyDetails.Description}</p>
                                <p><strong>Location:</strong> {selectedPropertyDetails.Location}</p>
                                <p><strong>Owner Name:</strong> {selectedPropertyDetails.OwnerName}</p>
                                <p><strong>Owner Phone Number:</strong> {selectedPropertyDetails.OwnerPhoneNumber}</p>
                                <p><strong>Owner Email:</strong> {selectedPropertyDetails.OwnerEmail}</p>
                                <p><strong>Postcode:</strong> {selectedPropertyDetails.Postcode}</p>
                                <p><strong>Price:</strong> {selectedPropertyDetails.Price}</p>
                                <p><strong>Property Code:</strong> {selectedPropertyDetails.PropertyCode}</p>
                                <p><strong>Size:</strong> {selectedPropertyDetails.Size} sq. feet</p>
                                <p><strong>Bathrooms:</strong> {selectedPropertyDetails.Bathrooms}</p>
                                <p><strong>Bedrooms:</strong> {selectedPropertyDetails.Bedrooms}</p>
                                {selectedPropertyDetails && Array.isArray(selectedPropertyDetails.Type) ? (
                                    <p><strong>Type:</strong> {selectedPropertyDetails.Type.join(', ')}</p>
                                ) : (
                                    <p><strong>Type:</strong> {selectedPropertyDetails.Type}</p>
                                )
                                }
                                <p><strong>Created At:</strong> {selectedPropertyDetails.createdAt instanceof Date ? selectedPropertyDetails.createdAt.toLocaleString() : ""}</p>
                                <p><strong>Updated At:</strong> {selectedPropertyDetails.updatedAt instanceof Date ? selectedPropertyDetails.updatedAt.toLocaleString() : "Not updated yet"}</p>
                            </Modal.Body>
                        </Modal>
                    )}
                </Col>
            </Row>
            <ScrollToTop />
        </Container>
    );
}

export default PropertyManagement;
