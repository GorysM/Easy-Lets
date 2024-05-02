import React from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavigationBar } from './components/NavBar';
import ChatButton from './components/ChatButton'; 

const ContactUs = () => {
  return (
    <div className="vh-100 d-flex align-items-center justify-content-center home-container ">
      <NavigationBar />
      <Container>
        <Row className="justify-content-center ">
          <Col md={8}>
            <div className="col-md-auto">
              <div className="logo-container mb-2 mx-auto col-md-auto" style={{ width: "200px" }}>
              </div>
              <Card className="bg-dark text-light ">
                <Card.Body>
                  <h2 className="text-center mb-4 ">Contact Us</h2>
                  <Form>
                    <Form.Group className="mb-3" controlId="name">
                      <Form.Label>Your Name</Form.Label>
                      <Form.Control type="text" placeholder="Enter your name" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Your Email</Form.Label>
                      <Form.Control type="email" placeholder="Enter your email" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="message">
                      <Form.Label>Your Message</Form.Label>
                      <Form.Control as="textarea" rows={4} placeholder="Enter your message" />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100">
                      Submit
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
              <Card className="bg-dark text-light mt-4">
                <Card.Body>
                  <h5 className="mb-4">Customer Support</h5>
                  <p>
                    If you need assistance or have any questions, feel free to contact our customer support team:
                  </p>
                  <ul className="list-unstyled">
                    <li>Phone: 02000000 +44 7961234567 (UK)</li>
                    <li>Email: support@example.com</li>
                    <li>Address: 123 Street Name, City, Country</li>
                  </ul>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
      <ChatButton />
    </div>
  );
};

export default ContactUs;
