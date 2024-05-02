import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';

const ChatButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Establish socket connection
    const newSocket = io('http://localhost:3000'); // server URL
    setSocket(newSocket);

    newSocket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => newSocket.disconnect();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoggedIn(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (socket && newMessage.trim() !== '') {
      const message = {
        text: newMessage,
        sender: userInfo.name,
        timestamp: new Date()
      };
      socket.emit('chat message', message);
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setMessages([]);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <>
      <Button variant="success" className="position-fixed bottom-0 end-0 m-3" onClick={() => setShowModal(true)}>
        Chat
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>{loggedIn ? 'Chat with Support' : 'Login or Register'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loggedIn ? (
            <>
              <ListGroup>
                {messages.map((message, index) => (
                  <ListGroup.Item key={index} className={message.sender === userInfo.name ? 'user-message' : 'support-message'}>
                    {message.text}
                    <small className="d-block text-muted">{formatTimestamp(message.timestamp)}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Form onSubmit={handleSendMessage} className="mt-3">
                <Form.Control 
                  type="text" 
                  placeholder="Type your message..." 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  required 
                />
                <Button variant="primary" type="submit" className="mt-3">
                  Send
                </Button>
              </Form>
              <Button variant="danger" className="mt-3" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Form onSubmit={handleLogin}>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter your name" 
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} 
                  required 
                />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Enter your email" 
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })} 
                  required 
                />
              </Form.Group>
              <Button variant="success" type="submit" className="mt-3">
                Continue
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ChatButton;
