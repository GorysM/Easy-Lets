import React, { useState, useEffect } from 'react';
import { Button, Table, Spinner, Container, Row, Col, OverlayTrigger, Tooltip, Modal, InputGroup, Form } from 'react-bootstrap';
import { db } from './firebase-config';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import MaintenanceModal from './components/MaintenanceModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import ScrollToTop from './components/ScrollToTop';
import DashboardSidebar from './components/DashboardSidebar';

function Maintenance() {
    const [issues, setIssues] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedIssueDetails, setSelectedIssueDetails] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTenant, setSelectedTenant] = useState(null);

    const fetchIssues = async () => {
        setIsLoading(true);
        const querySnapshot = await getDocs(collection(db, "MaintenanceRequests"));
        const issuesData = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));
        setIssues(issuesData);
        setIsLoading(false);
    };

    const fetchTenantDetails = async (tenantId) => {
        if (tenantId) {
            const tenantRef = doc(db, "Tenants", tenantId);
            const tenantSnap = await getDoc(tenantRef);
            if (tenantSnap.exists()) {
                setSelectedTenant(tenantSnap.data());
            } else {
                setSelectedTenant(null);
            }
        } else {
            setSelectedTenant(null);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleShowModal = (issueId = null) => {
        setSelectedIssueId(issueId);
        setModalShow(true);
    };

    const handleCloseModal = () => {
        setModalShow(false);
        setSelectedIssueId(null);
    };

    const handleShowDetailsModal = (issueDetails) => {
        setSelectedIssueDetails({
            ...issueDetails,
            createdAt: issueDetails.createdAt?.toDate().toLocaleString(),
            updatedAt: issueDetails.updatedAt?.toDate().toLocaleString()
        });
        setShowDetailsModal(true);
        fetchTenantDetails(issueDetails.tenantId);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedIssueDetails(null);
    };

    const refreshIssues = () => {
        fetchIssues();
    };

    const matchesSearchQuery = (issue, query) => {
        for (const key in issue) {
            if (issue[key] && issue[key].toString().toLowerCase().includes(query.toLowerCase())) {
                return true;
            }
        }
        return false;
    };
    const truncateDescription = (description, maxLength = 30) => {
        if (description.length > maxLength) {
            return `${description.substring(0, maxLength)}...`;
        }
        return description; // Return original if its short enough
    };
    const filteredIssues = issues.filter(issue => matchesSearchQuery(issue, searchQuery));
    const outstandingIssues = filteredIssues.filter(issue => issue.status === 'Outstanding');
    const completedIssues = filteredIssues.filter(issue => issue.status === 'Completed');
    const failedOrDeferredIssues = filteredIssues.filter(issue => issue.status === 'Failed/Deferred');

    const renderIssueTable = (issues, status) => {
        // Define inline styles for table columns
        const columnStyles = {
            width: '20%',
            maxWidth: '20%',
            overflow: 'hidden', // Keeps content from overflowing
            textOverflow: 'ellipsis', // Adds an ellipsis to content that overflows
            whiteSpace: 'nowrap' // Ensures content does not wrap to a new line
        };

        return (
            <div>
                <h3>{status} Issues</h3>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th style={columnStyles}>#</th> 
                            <th style={columnStyles}>Property Address</th>
                            <th style={columnStyles}>Description</th>
                            <th style={columnStyles}>Status</th>
                            <th style={columnStyles}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {issues.map((issue, index) => (
                            <OverlayTrigger
                                key={issue.id}
                                placement="top"
                                overlay={<Tooltip>Click to view details</Tooltip>}
                            >
                                <tr onClick={() => handleShowDetailsModal(issue)} style={{ cursor: 'pointer' }}>
                                    <td style={columnStyles}>
                                        {index + 1}. {issue.paid ? 'Paid' : 'Unpaid'}
                                    </td>
                                    <td style={columnStyles}>{issue.propertyAddress || 'No address available'}</td>
                                    <td style={columnStyles}>{truncateDescription(issue.description)}</td>
                                    <td style={columnStyles}>{issue.status}</td>
                                    <td style={columnStyles}>
                                        <Button variant="warning" onClick={(e) => { e.stopPropagation(); handleShowModal(issue.id); }}>Edit</Button>{' '}
                                        <Button variant="danger" onClick={async (e) => { e.stopPropagation(); await deleteDoc(doc(db, "MaintenanceRequests", issue.id)); refreshIssues(); }}>Delete</Button>
                                    </td>
                                </tr>
                            </OverlayTrigger>
                        ))}
                    </tbody>

                </Table>
            </div>
        );
    };



    return (
        <Container fluid className="px-0">
            <Row>
                <Col sm={2}>
                    <DashboardSidebar />
                </Col>
                <Col sm={9}>
                    <h2 className="text-center mt-3">Maintenance Management</h2>
                    <Row>
                        <Col sm={5}>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Search by issue description or address"
                                    value={searchQuery || ''}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button variant="outline-secondary" onClick={() => setSearchQuery('')}>Clear</Button>
                            </InputGroup>
                            <Button variant="warning" className="mb-3" style={{ width: '150px' }} onClick={() => handleShowModal(null)}>Add Issue</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={11}>
                            <div className="accordion" id="accordionPanelsStayOpenExample">
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingOne">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                            Outstanding Issues
                                        </button>
                                    </h2>
                                    <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne">
                                        <div className="accordion-body">
                                            {isLoading ? <Spinner animation="border" role="status"><span className="visually-hidden ">Loading...</span></Spinner> : renderIssueTable(outstandingIssues, 'Outstanding')}
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingTwo">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                            Completed Issues
                                        </button>
                                    </h2>
                                    <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo">
                                        <div className="accordion-body">
                                            {renderIssueTable(completedIssues, 'Completed')}
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="headingThree">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                            Failed/Deferred Issues
                                        </button>
                                    </h2>
                                    <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree">
                                        <div className="accordion-body">
                                            {renderIssueTable(failedOrDeferredIssues, 'Failed/Deferred')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12}>
                            <MaintenanceModal
                                show={modalShow}
                                handleClose={handleCloseModal}
                                db={db}
                                issueId={selectedIssueId}
                                refreshIssues={refreshIssues}
                            />
                            {selectedIssueDetails && (
                                <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} centered>
                                    <Modal.Header closeButton>
                                        <Modal.Title><u>Maintenance Issue Details</u></Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <p className='pt-3 text-break'><strong>Property Address:</strong> {selectedIssueDetails.propertyAddress}</p>
                                        <p><strong>Key number: </strong>{selectedIssueDetails.KeyNumber}</p>

                                        <p><strong>Description:</strong></p> {/* Title outside of the scrollable box */}
                                        <div style={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden', border: '1px solid #ddd', padding: '10px', borderRadius: '5px', wordWrap: 'break-word' }}>
                                            {selectedIssueDetails.description} {/* Content inside the scrollable box */}
                                        </div>

                                        <p><strong>Status:</strong> {selectedIssueDetails.status}</p>
                                        <p><strong>Price: £</strong> {selectedIssueDetails.price}</p>
                                        <p><strong>Payment Status:</strong> {selectedIssueDetails.paid ? 'Paid' : 'Not Paid'}</p> {/* Displaying payment status based on boolean value */}
                                        <p><strong>Created At:</strong> {selectedIssueDetails.createdAt || 'Not available'}</p>
                                        <p><strong>Updated At:</strong> {selectedIssueDetails.updatedAt || 'Not available'}</p>
                                        {selectedTenant && (
                                            <div>
                                                <h5 className='pt-3'><u>Tenant Details</u></h5>
                                                <p className='pt-3'><strong>Name:</strong> {selectedTenant.firstName} {selectedTenant.lastName}</p>
                                                <p><strong>Email:</strong> {selectedTenant.email}</p>
                                                <p><strong>Contact Number:</strong> {selectedTenant.contactNumber}</p>
                                            </div>
                                        )}
                                    </Modal.Body>

                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleCloseDetailsModal}>Close</Button>
                                    </Modal.Footer>
                                </Modal>
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
            <ScrollToTop />
        </Container>
    );


}

export default Maintenance;
