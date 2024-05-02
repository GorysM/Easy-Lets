import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, InputGroup, Spinner, Modal, OverlayTrigger, Tooltip, Accordion, Alert } from 'react-bootstrap';
import { db } from './firebase-config';
import { collection, getDocs, doc, writeBatch, Timestamp } from 'firebase/firestore';
import DashboardSidebar from './components/DashboardSidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { format } from 'date-fns';
import ScrollToTop from './components/ScrollToTop'

function Financials() {
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [noIssuesMessage, setNoIssuesMessage] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

    const fetchFinancialData = async () => {
        setIsLoading(true);
        const propertySnapshot = await getDocs(collection(db, "Property"));
        const propertiesMap = {};
        const maintenanceMap = {};

        const maintenanceSnapshot = await getDocs(collection(db, "MaintenanceRequests"));
        maintenanceSnapshot.forEach(doc => {
            const request = doc.data();
            if (request.status === 'Completed') {
                if (!maintenanceMap[request.propertyId]) {
                    maintenanceMap[request.propertyId] = [];
                }
                maintenanceMap[request.propertyId].push({
                    ...request,
                    id: doc.id,
                });
            }
        });

        propertySnapshot.forEach(doc => {
            const propertyData = doc.data();
            propertiesMap[doc.id] = {
                id: doc.id,
                ...propertyData,
                totalExpenses: 0,
                maintenanceIssues: maintenanceMap[doc.id] || [],
                netIncome: 0,
                propertyId: doc.id,
                remainingUnpaidExpenses: 0,
                totalPaidExpenses: 0,
                lastUpdated: propertyData.lastUpdated ? propertyData.lastUpdated.toDate() : null,
            };

            propertiesMap[doc.id].maintenanceIssues.forEach(issue => {
                propertiesMap[doc.id].totalExpenses += issue.price || 0;
            });

            propertiesMap[doc.id].totalIncome = Number(propertyData.Price) || 0;
            propertiesMap[doc.id].netIncome = propertiesMap[doc.id].totalIncome - propertiesMap[doc.id].totalExpenses;
        });

        setProperties(Object.values(propertiesMap));
        setIsLoading(false);
    };

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const handleShowMaintenanceDetails = (maintenanceIssues, property) => {
        // Reset the selectedMaintenance and noIssuesMessage before setting new ones
        setSelectedMaintenance(maintenanceIssues);
        setNoIssuesMessage('');
        setSelectedProperty(property);
        if (maintenanceIssues && maintenanceIssues.length > 0) {
            const groupedIssues = {};
            maintenanceIssues.forEach(mIssue => {
                const updatedAt = mIssue.updatedAt && typeof mIssue.updatedAt.toDate === 'function'
                    ? mIssue.updatedAt.toDate() // Convert Firestore Timestamp to JavaScript Date
                    : new Date(); // Fallback to current date if unavailable or invalid
                const monthYear = format(updatedAt, 'MMMM yyyy');
                groupedIssues[monthYear] = groupedIssues[monthYear] || [];
                groupedIssues[monthYear].push(mIssue);
            });

            if (Object.keys(groupedIssues).length > 0) {
                setSelectedMaintenance(groupedIssues);
                setShowMaintenanceModal(true);
            } else {
                // If no completed issues are grouped, set message and show the modal
                setNoIssuesMessage("No completed maintenance issues found for this property.");
                setShowMaintenanceModal(true);
            }
        } else {
            // If there are no issues at all, set a different message and show the modal
            setNoIssuesMessage("No maintenance issues found for this property.");
            setShowMaintenanceModal(true);
        }
    };


    const handleSaveChanges = async () => {
        setIsUpdatingPayment(true);
        const batch = writeBatch(db);

        for (const property of properties) {
            let updated = false;
            let totalPaidExpenses = 0;
            let totalUnpaidExpenses = 0;

            for (const issue of property.maintenanceIssues) {
                if (issue.status === 'Completed') {
                    if (issue.paid) {
                        totalPaidExpenses += issue.price;
                    } else {
                        totalUnpaidExpenses += issue.price;
                    }

                    if (issue.changed) {
                        updated = true;
                        const issueRef = doc(db, "MaintenanceRequests", issue.id);
                        batch.update(issueRef, { paid: issue.paid });
                    }
                }
            }

            if (updated) {
                const financialRef = doc(db, "Financials", property.id);
                batch.update(financialRef, {
                    totalPaidExpenses,
                    remainingUnpaidExpenses: totalUnpaidExpenses,
                    lastUpdated: Timestamp.now(),
                });
            }
        }

        await batch.commit().catch(error => {
            console.error("Error saving changes:", error);
        });

        setIsUpdatingPayment(false);
        fetchFinancialData();
    };





    const togglePaymentStatus = (issue, paidStatus) => {
        if (selectedMaintenance && typeof selectedMaintenance === 'object') {
            const newSelectedMaintenance = {};

            Object.keys(selectedMaintenance).forEach(month => {
                newSelectedMaintenance[month] = selectedMaintenance[month].map(i =>
                    i.id === issue.id ? { ...i, paid: paidStatus, changed: true } : i
                );
            });

            setSelectedMaintenance(newSelectedMaintenance);
        }

        const updatedProperties = properties.map(p => {
            if (p.id === selectedProperty.id) {
                return {
                    ...p,
                    maintenanceIssues: p.maintenanceIssues.map(i =>
                        i.id === issue.id ? { ...i, paid: paidStatus, changed: true } : i
                    )
                };
            }
            return p;
        });

        setProperties(updatedProperties);
    };






    const filteredProperties = properties.filter(property =>
        property.Address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container fluid className="px-0">
            <Row>
                <Col md={2}>
                    <DashboardSidebar />
                </Col>
                <Col md={9}>
                    <h2 className="text-center mt-3">Financial Management</h2>
                    <Row>
                        <Col sm={5}>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    size="md"
                                    type="text"
                                    placeholder="Search by property address"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button variant="outline-secondary" size="md" onClick={() => setSearchQuery('')}>Clear</Button>
                            </InputGroup>
                        </Col>
                    </Row>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Property Address</th>
                                <th>Total Income (£)</th>
                                <th>Remaining Unpaid Expenses (£)</th>
                                <th>Total Paid Expenses (£)</th>
                                <th>Net Income (£)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProperties.map((property, index) => (
                                <OverlayTrigger
                                    key={index}
                                    placement="top"
                                    overlay={<Tooltip>Click for details</Tooltip>}
                                >
                                    <tr onClick={() => handleShowMaintenanceDetails(property.maintenanceIssues, property)} style={{ cursor: 'pointer' }}>

                                        <td>{property.Address}</td>
                                        <td>£{Number(parseFloat(property.totalIncome || 0)).toFixed(2)}</td>
                                        <td>£{(property.maintenanceIssues.reduce((acc, issue) => acc + (issue.status === 'Completed' ? Number(issue.price || 0) : 0), 0) - property.maintenanceIssues.reduce((acc, issue) => acc + (issue.status === 'Completed' && issue.paid ? Number(issue.price || 0) : 0), 0)).toFixed(2)}</td>
                                        <td>£{property.maintenanceIssues.reduce((acc, issue) => acc + (issue.status === 'Completed' && issue.paid ? Number(issue.price || 0) : 0), 0).toFixed(2)}</td>
                                        <td>£{(Number(property.totalIncome) - property.maintenanceIssues.reduce((acc, issue) => acc + (issue.status === 'Completed' && issue.paid ? Number(issue.price || 0) : 0), 0)).toFixed(2)}</td>
                                    </tr>
                                </OverlayTrigger>
                            ))}
                        </tbody>
                    </Table>

                    {isLoading && (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    )}
                    {showPaymentSuccess && (
                        <Alert variant="success" onClose={() => setShowPaymentSuccess(false)} dismissible>
                            Payment status updated successfully!
                        </Alert>
                    )}
                    {showMaintenanceModal && (
                        <Modal show={showMaintenanceModal} onHide={() => { setShowMaintenanceModal(false); setSelectedMaintenance(null); setNoIssuesMessage(''); }} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Maintenance Issue Details</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {selectedMaintenance && Object.keys(selectedMaintenance).length > 0 && selectedProperty ? (
                                    <Accordion defaultActiveKey="0">
                                        {Object.entries(selectedMaintenance).map(([month, issues], index) => (
                                            <Accordion.Item eventKey={index.toString()} key={index}>
                                                <Accordion.Header>{month}</Accordion.Header>
                                                <Accordion.Body>
                                                    {issues.map((issue, idx) => (
                                                        <div key={idx} className="mb-3">
                                                            <p><strong>Description:</strong></p>
                                                            <div style={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'auto', wordWrap: 'break-word', border: '1px solid #ddd', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                                                                {issue.description}
                                                            </div>
                                                            <p><strong>Cost:</strong> £{(issue.price || 0).toFixed(2)}</p>
                                                            <p><strong>Status:</strong> {issue.paid ? 'Paid' : 'Not Paid'}</p>
                                                            <Button
                                                                variant="primary"
                                                                disabled={issue.paid}
                                                                onClick={() => togglePaymentStatus(issue, true)}>
                                                                Mark as Paid
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                disabled={!issue.paid}
                                                                onClick={() => togglePaymentStatus(issue, false)}>
                                                                Mark as Unpaid
                                                            </Button>


                                                        </div>
                                                    ))}
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <div>{noIssuesMessage}</div>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="success"
                                    onClick={handleSaveChanges} // Implement this function to update the database
                                    disabled={isUpdatingPayment}
                                >
                                    Save Changes
                                </Button>
                                <Button variant="secondary" onClick={() => setShowMaintenanceModal(false)}>Close</Button>
                            </Modal.Footer>
                        </Modal>
                    )}

                </Col>
            </Row>
            <ScrollToTop />
        </Container>
    );
}

export default Financials;
