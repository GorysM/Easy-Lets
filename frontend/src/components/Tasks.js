import React, { useState, useEffect } from 'react';
import { Modal, Button, Toast, ToastContainer, Accordion } from 'react-bootstrap';
import {
    collection, addDoc, onSnapshot, orderBy, query,
    serverTimestamp, doc, updateDoc, deleteDoc
} from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import { db } from '../firebase-config';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalDescription, setModalDescription] = useState('');
    const [modalStatus, setModalStatus] = useState('Waiting');
    const [modalPriority, setModalPriority] = useState('Low');
    const [selectedTask, setSelectedTask] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'Tasks'), orderBy('createdAt'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isArchived: doc.data().isArchived || false,
                createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000) : new Date(),
                updatedAt: doc.data().updatedAt ? new Date(doc.data().updatedAt.seconds * 1000) : null,
            }));
            setTasks(tasksData);
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch tasks:", error);
            setError(error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [db]);

    if (loading) return <div>Loading tasks...</div>;
    if (error) return <div>Error loading tasks: {error.message}</div>;

    const toggleArchive = async (task, archive) => {
        const taskDoc = doc(db, 'Tasks', task.id);
        await updateDoc(taskDoc, {
            isArchived: archive
        });
        setToastMessage(archive ? 'Task archived successfully!' : 'Task unarchived successfully!');
        setToastVariant(archive ? 'warning' : 'info');
        setShowToast(true);
    };

    const handleAddTaskClick = () => {
        setSelectedTask(null);
        setModalTitle('');
        setModalDescription('');
        setModalStatus('Waiting');
        setModalPriority('Low');
        setShowModal(true);
    };

    const saveTask = async () => {
        if (selectedTask) {
            const taskDoc = doc(db, 'Tasks', selectedTask.id);
            await updateDoc(taskDoc, {
                title: modalTitle,
                description: modalDescription,
                status: modalStatus,
                priority: modalPriority,
                updatedAt: serverTimestamp(),
            });
            setToastMessage('Task updated successfully!');
            setToastVariant('success');
        } else {
            await addDoc(collection(db, 'Tasks'), {
                title: modalTitle,
                description: modalDescription,
                status: modalStatus,
                priority: modalPriority,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            setToastMessage('Task added successfully!');
            setToastVariant('success');
        }
        setShowModal(false);
        setShowToast(true);
    };

    const deleteTask = async () => {
        if (selectedTask) {
            const taskDoc = doc(db, 'Tasks', selectedTask.id);
            await deleteDoc(taskDoc);
            setToastMessage('Task deleted successfully!');
            setToastVariant('danger');
            setShowModal(false);
            setShowToast(true);
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setModalTitle(task.title);
        setModalDescription(task.description || '');
        setModalStatus(task.status);
        setModalPriority(task.priority || 'Low');
        setShowModal(true);
    };
    const getBadgeColor = (priority) => {
        switch (priority) {
            case 'High':
                return 'bg-danger';
            case 'Medium':
                return 'bg-warning';
            case 'Low':
                return 'bg-success';
            default:
                return 'bg-secondary';
        }
    };

    const statusCategories = ['Waiting', 'In Progress', 'Completed', 'Failed'];
    const filteredTasks = tasks.filter(task => task.isArchived === showArchived);

    return (
        <div className="container mt-5">
            <div className="row mb-3">
                <div className="col text-left">
                    <Button variant={showArchived ? "info" : "secondary"} onClick={() => setShowArchived(!showArchived)}>
                        {showArchived ? 'Show Active Tasks' : 'Show Archived Tasks'}
                    </Button>
                </div>
                <div className="col text-right">
                    <Button variant="primary" onClick={handleAddTaskClick}>Add Task</Button>
                </div>
            </div>
            {statusCategories.map(status => (
                <Accordion defaultActiveKey="0" key={status}>
                    <Accordion.Item eventKey={status}>
                        <Accordion.Header>{status}</Accordion.Header>
                        <Accordion.Body>
                            <Accordion>
                                {Object.entries(filteredTasks.filter(task => task.status === status).reduce((acc, task) => {
                                    const month = task.createdAt.toLocaleDateString('default', { year: 'numeric', month: 'long' });
                                    acc[month] = acc[month] || [];
                                    acc[month].push(task);
                                    return acc;
                                }, {})).map(([month, monthTasks], index) => (
                                    <Accordion.Item eventKey={`${status}-${month}`} key={month}>
                                        <Accordion.Header>{month}</Accordion.Header>
                                        <Accordion.Body>
                                            {monthTasks.map(task => (
                                                <div key={task.id} className="card mb-3" onClick={() => handleTaskClick(task)}>
                                                    <div className="card-body d-flex flex-column">
                                                        <h5 className="card-title">
                                                            {task.title}
                                                            <span className={`badge ${getBadgeColor(task.priority)} ml-2`}>{task.priority}</span>
                                                        </h5>
                                                        <div className="mt-auto d-flex justify-content-between align-items-center">
                                                            <p className="mb-0 mr-3 pt-5">Last updated: {task.updatedAt ? task.updatedAt.toLocaleDateString('en-GB') : 'Not updated yet'}</p>
                                                            <div>
                                                                <Button variant="warning" size="sm" onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleArchive(task, !task.isArchived);
                                                                }}>
                                                                    {task.isArchived ? 'Unarchive' : 'Archive'}
                                                                </Button>
                                                                <Button variant="danger" size="sm" style={{ marginLeft: '5px' }} onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteTask(task);
                                                                }}>Delete</Button>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            ))}

                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            ))}

            <ToastContainer position="top-end">
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
            {showModal && (
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedTask ? 'Edit Task' : 'Add Task'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Title</label>
                            <input type="text" className="form-control" id="title" value={modalTitle} onChange={(e) => setModalTitle(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea className="form-control" id="description" rows="3" value={modalDescription} onChange={(e) => setModalDescription(e.target.value)}></textarea>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="status" className="form-label">Status</label>
                            <select className="form-select" id="status" value={modalStatus} onChange={(e) => setModalStatus(e.target.value)}>
                                <option value="Waiting">Waiting</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="priority" className="form-label">Priority</label>
                            <select className="form-select" id="priority" value={modalPriority} onChange={(e) => setModalPriority(e.target.value)}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                            {/* Display the priority as a badge */}
                            <div className="mt-2">
                                <h5>Current Priority: <span className={`badge ${getBadgeColor(modalPriority)}`}>{modalPriority}</span></h5>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        {selectedTask && <Button variant="danger" onClick={() => deleteTask(selectedTask)}>Delete</Button>}
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={saveTask}>Save Task</Button>
                    </Modal.Footer>
                </Modal>

            )}
        </div>
    );
};

export default TaskManager;
