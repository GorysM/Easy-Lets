import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import ScrollToTop from './components/ScrollToTop';
import { collection, getDocs, query, where, orderBy, limit, getDoc, doc  } from 'firebase/firestore';
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import DashboardSidebar from './components/DashboardSidebar';
import { Container, Row, Col, Card, Spinner, Alert, ListGroup } from 'react-bootstrap';
import 'admin-lte/dist/css/adminlte.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import TaskManager from './components/Tasks';
function Dashboard() {
    // Initialize states
    const [tenantsCount, setTenantsCount] = useState(0);
    const [leaseExpirations, setLeaseExpirations] = useState([]);
    const [propertiesCount, setPropertiesCount] = useState(0);
    const [maintenanceStats, setMaintenanceStats] = useState([]);
    const [financials, setFinancials] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); 
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const propertiesSnapshot = await getDocs(collection(db, "Property"));
                setPropertiesCount(propertiesSnapshot.docs.length);
                const propertyAddressMap = {};
                propertiesSnapshot.forEach(doc => {
                    propertyAddressMap[doc.id] = doc.data().Address; // Adjust "Address" if the field is named differently
                });

                const tenantsSnapshot = await getDocs(collection(db, "Tenants"));
                setTenantsCount(tenantsSnapshot.docs.length);

                const maintenanceSnapshot = await getDocs(collection(db, "MaintenanceRequests"));
                const statusCounts = { Outstanding: 0, Completed: 0, 'Failed/Deferred': 0 };
                maintenanceSnapshot.docs.forEach((maintenanceDoc) => {
                    statusCounts[maintenanceDoc.data().status] += 1;
                });
                setMaintenanceStats(Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] })));

                const financialSnapshot = await getDocs(collection(db, "Financials"));
                const formattedFinancials = financialSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        propertyAddress: propertyAddressMap[doc.id] || 'Unknown',
                        totalIncome: data.totalIncome || 0, // Replace with your actual field names
                        remainingUnpaidExpenses: data.remainingUnpaidExpenses || 0,
                        totalPaidExpenses: data.totalPaidExpenses || 0,
                        netIncome: (data.totalIncome || 0) - (data.totalPaidExpenses || 0)
                    };
                });
                setFinancials(formattedFinancials);





                const recentActivitiesQuery = query(collection(db, "Tasks"), orderBy("timestamp", "desc"), limit(5));
                const activitiesSnapshot = await getDocs(recentActivitiesQuery);
                setRecentActivities(activitiesSnapshot.docs.map(activityDoc => ({ id: activityDoc.id, ...activityDoc.data() })));

                const today = new Date();
                const leaseExpirationsSnapshot = await getDocs(query(collection(db, "Leases"), where("endDate", ">=", today)));
                const leaseExpirationsData = await Promise.all(leaseExpirationsSnapshot.docs.map(async (leaseDoc) => {
                    const leaseData = leaseDoc.data();
                    let propertyAddress = 'Unknown';
                    if (leaseData.propertyId) {
                        const propertySnapshot = await getDoc(doc(db, "Property", leaseData.propertyId));
                        if (propertySnapshot.exists()) {
                            propertyAddress = propertySnapshot.data().Address;
                        }
                    }
                    const endDate = leaseData.endDate ? leaseData.endDate.toDate().toISOString().slice(0, 10) : 'Unknown';
                    return { propertyAddress, endDate };
                }));
                setLeaseExpirations(leaseExpirationsData);

            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const validMaintenanceStats = maintenanceStats.filter(stat => !isNaN(stat.value));
   

    return (
        <div className="wrapper">
            <DashboardSidebar />
            <div className="content-wrapper">
                <Container fluid>
                    <Row className="justify-content-center p-3">
                        {/* Properties Overview */}
                        <Col md={6} lg={4}>
                            <Card className="mb-3">
                                <Card.Header><h3>Properties Overview</h3></Card.Header>
                                <Card.Body>
                                    <Card.Text>Total Properties: {propertiesCount}</Card.Text>
                                    {/* Additional details */}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Tenant Overview */}
                        <Col md={6} lg={4}>
                            <Card className="mb-3">
                                <Card.Header><h3>Tenant Overview</h3></Card.Header>
                                <Card.Body>
                                    <Card.Text>Total Tenants: {tenantsCount}</Card.Text>
                                    {/* Additional tenant stats */}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Lease Expirations */}
                        <Col md={6} lg={4}>
    <Card className="mb-3">
        <Card.Header><h3>Lease Expirations</h3></Card.Header>
        <Card.Body>
            <ListGroup variant="flush">
                {leaseExpirations.map((lease, index) => (
                    <ListGroup.Item key={index}>
                        {lease.propertyAddress} - Expires on 
                        <span className="badge bg-danger ms-2">{lease.endDate}</span>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Card.Body>
    </Card>
</Col>




                        {/* Maintenance Overview */}
                        <Col md={6} lg={4}>
                            <Card className="mb-3">
                                <Card.Header><h3>Maintenance Overview</h3></Card.Header>
                                <Card.Body>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                dataKey="value"
                                                data={validMaintenanceStats}
                                                fill="#8884d8"
                                                label={(entry) => `${entry.name}: ${entry.value}`}
                                            >
                                                {validMaintenanceStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Financial Overview */}
                        <Col md={12} lg={8}>
                            <Card className="mb-3">
                                <Card.Header><h3>Financial Overview</h3></Card.Header>
                                <Card.Body>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={financials}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="propertyAddress"/>
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="totalIncome" name="Total Income (£)" fill="#8884d8" />
                                            <Bar dataKey="remainingUnpaidExpenses" name="Remaining Unpaid Expenses (£)" fill="#82ca9d" />
                                            <Bar dataKey="totalPaidExpenses" name="Total Paid Expenses (£)" fill="#ffc658" />
                                            <Bar dataKey="netIncome" name="Net Income (£)" fill="#FF8042" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>      
                        {/* Recent Activities */}
                        <Col md={12} lg={8}>
                            <Card className="mb-3 text-center">
                                <Card.Header><h3>To-Do Task List</h3></Card.Header>
                                <Card.Body>
                                    <TaskManager/>
                               
</Card.Body>
</Card>
</Col>
                    </Row>
                    <ScrollToTop />
                </Container>
            </div>
        </div>
    );
    
}

export default Dashboard;