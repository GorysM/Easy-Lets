import React, { useState, useEffect, useCallback  } from 'react';
import { Button, Table, Spinner, Container, Row, Col, OverlayTrigger, Tooltip, Modal, Form, InputGroup } from 'react-bootstrap';
import { db } from './firebase-config';
import { collection, getDocs, deleteDoc, doc, getDoc, query, where } from 'firebase/firestore';
import TenantModal from './components/TenantDetails';
import 'bootstrap/dist/css/bootstrap.min.css';
import ScrollToTop from './components/ScrollToTop';
import DashboardSidebar from './components/DashboardSidebar';

function Tenants() {
    const [tenants, setTenants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [selectedTenantId, setSelectedTenantId] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTenantDetails, setSelectedTenantDetails] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTenantsWithProperties = useCallback(async () => {
        setIsLoading(true);
        const newTenants = [];
        const querySnapshot = await getDocs(collection(db, "Tenants"));
        for (const doc of querySnapshot.docs) {
            const tenantData = { ...doc.data(), id: doc.id };
            tenantData.propertyAddress = await fetchPropertyDetails(tenantData.propertyId);
            tenantData.leaseInfo = await fetchActiveLeaseDetails(tenantData.id); // Fetch only active lease details
            newTenants.push(tenantData);
        }
        setTenants(newTenants);
        setIsLoading(false);
    }, []); 
    

    const fetchPropertyDetails = async (propertyId) => {
        if (!propertyId) return "-";
        try {
            const docRef = doc(db, "Property", propertyId);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data().Address : "-";
        } catch (error) {
            console.error("Error fetching property details:", error);
            return "-";
        }
    };

    const fetchActiveLeaseDetails = async (tenantId) => {
        try {
            const leasesRef = collection(db, "Leases");
            const allLeasesQuery = query(leasesRef, where("PropertyUserId", "==", tenantId));
            const querySnapshot = await getDocs(allLeasesQuery);
            let activeLease = null;
    
            querySnapshot.forEach((doc) => {
                const leaseData = doc.data();
                // Convert Firestore Timestamps to JavaScript Date objects
                const leaseStartDate = leaseData.startDate ? leaseData.startDate.toDate() : null; // Convert startDate
                const leaseEndDate = leaseData.endDate ? leaseData.endDate.toDate() : null; // Convert endDate
    
                const now = new Date(); // Current date for comparison
    
                // Check if the lease is currently active
                if (leaseStartDate <= now && leaseEndDate >= now) {
                    activeLease = { 
                        ...leaseData, 
                        id: doc.id, 
                        startDate: leaseStartDate.toISOString().slice(0, 10), // Convert to string for display
                        endDate: leaseEndDate.toISOString().slice(0, 10) // Convert to string for display
                    };
                }
            });
    
            return activeLease;
        } catch (error) {
            console.error("Error fetching active lease details:", error);
            return null;
        }
    };
    

    useEffect(() => {
        fetchTenantsWithProperties();
    }, [fetchTenantsWithProperties]);
    

    const handleShowModal = (tenantId = null) => {
        setSelectedTenantId(tenantId);
        setModalShow(true);
    };

    const handleCloseModal = () => {
        setModalShow(false);
        setSelectedTenantId(null);
    };

    const handleShowDetailsModal = async (tenant) => {
        setIsLoading(true); // Show loading indicator while fetching
        const leaseDetails = await fetchActiveLeaseDetails(tenant.id); // Fetch and add active lease details
        setIsLoading(false); // Hide loading indicator once fetching is done
    
        setSelectedTenantDetails({
            ...tenant, // Spread existing tenant details
            leaseDetails // Add the fetched lease details
        });
        setShowDetailsModal(true);
    };
    

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedTenantDetails(null);
    };

    const refreshTenants = () => {
        fetchTenantsWithProperties();
    };

    const handleEditClick = (event, tenantId) => {
        event.stopPropagation(); // Prevent propagation to parent <tr>
        handleShowModal(tenantId);
    };

    const handleDeleteClick = async (event, tenantId) => {
        event.stopPropagation(); // Prevent propagation to parent <tr>
        setIsLoading(true);
        await deleteDoc(doc(db, "Tenants", tenantId));
        refreshTenants();
    };

    const matchesSearchQuery = (tenant, query) => {
        return Object.values(tenant).some(value => String(value).toLowerCase().includes(query.toLowerCase()));
    };
    const filteredTenants = tenants.filter(tenant => matchesSearchQuery(tenant, searchQuery));

    return (
        <Container fluid className="px-0">
            <Row>
                <Col sm={2}>
                    <DashboardSidebar />
                </Col>
                <Col sm={9}>
                    <h2 className="text-center mt-3">Tenant Management</h2>
                    <Col sm={5}>
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Search by tenant name or email"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button variant="outline-secondary" onClick={() => setSearchQuery('')}>Clear</Button>
                        </InputGroup>
                        <Button variant="warning" className="mb-3" style={{ width: '150px' }} onClick={() => handleShowModal(null)}>Add Tenant</Button>
                    </Col>
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Col sm={11}>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTenants.map((tenant, index) => (
                                        <OverlayTrigger
                                            key={tenant.id}
                                            placement="top"
                                            overlay={<Tooltip>Click to view details</Tooltip>}
                                        >
                                            <tr key={tenant.id} onClick={() => handleShowDetailsModal(tenant)} style={{ cursor: 'pointer' }}>
                                                <td>{index + 1}</td>
                                                <td>{tenant.firstName}</td>
                                                <td>{tenant.lastName}</td>
                                                <td>{tenant.email}</td>
                                                <td>
                                                    <Button variant="warning" onClick={(e) => handleEditClick(e, tenant.id)}>Edit</Button>{' '}
                                                    <Button variant="danger" onClick={(e) => handleDeleteClick(e, tenant.id)}>Delete</Button>
                                                </td>
                                            </tr>
                                        </OverlayTrigger>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    )}
                    <TenantModal
                        show={modalShow}
                        handleClose={handleCloseModal}
                        db={db}
                        tenantId={selectedTenantId}
                        refreshTenants={refreshTenants}
                    />
                    {selectedTenantDetails && (
                    <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} centered>
                    <Modal.Header closeButton>
                    <Modal.Title><u>Tenant Details</u></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
            {/* Tenant Details */}
                                <p><strong>First Name:</strong> {selectedTenantDetails ? selectedTenantDetails.firstName : '-'}</p>
                                <p><strong>Last Name:</strong> {selectedTenantDetails ? selectedTenantDetails.lastName : '-'}</p>
                                <p><strong>Email:</strong> {selectedTenantDetails ? selectedTenantDetails.email : '-'}</p>
                                <p><strong>Contact Number:</strong> {selectedTenantDetails ? selectedTenantDetails.contactNumber : '-'}</p>
                                <p><strong>Property Address:</strong> {selectedTenantDetails ? selectedTenantDetails.propertyAddress : '-'}</p>
            {/* Active Lease Details */}
            {isLoading ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : selectedTenantDetails.leaseDetails ? (
                <>
                    <h5 className='pt-3 pb-3'><u>Active Lease Details:</u></h5>
                    <p><strong>Start Date:</strong> {selectedTenantDetails.leaseDetails.startDate || '-'}</p>
                    <p><strong>End Date:</strong> {selectedTenantDetails.leaseDetails.endDate || '-'}</p>
                    <p><strong>Rent:</strong> {selectedTenantDetails.leaseDetails && selectedTenantDetails.leaseDetails.rent ? `£${selectedTenantDetails.leaseDetails.rent}` : '-'}</p>
                    <p><strong>Deposit:</strong> £{selectedTenantDetails.leaseDetails.deposit || '-'}</p>
                    <p><strong>Terms:</strong> {selectedTenantDetails.leaseDetails.terms || '-'}</p>
                </>
            ) : (
                <p>No active lease found.</p>
            )}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetailsModal}>Close</Button>
        </Modal.Footer>
    </Modal>
)}


                </Col>
            </Row>
            <ScrollToTop />
        </Container>
    );
}

export default Tenants;
