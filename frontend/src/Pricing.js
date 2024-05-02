import React from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavigationBar } from './components/NavBar';
import ChatButton from './components/ChatButton';

function PricingPage() {
  return (
    <>
    <NavigationBar className="navbar " bg="light" expand="lg" />
    <div className='home-container '>
    <Container>
      <Row className="justify-content-center py-5">
        <Col md={12} className="text-center mb-5 text-light pt-3">
          <h2>How much does it cost?</h2>
        </Col>
        
        {/* Pricing Card for Pro Tier */}
        <Col md={4} className="mb-4 ps-5 ms-4" >
          <Card className="h-100 bg-dark text-light">
            <Card.Header className="bg-primary text-white">Pro</Card.Header>
            <Card.Body>
              <Card.Title className="text-center">£45*</Card.Title>
              <Card.Subtitle className="mb-2 text-center text-light">per month</Card.Subtitle>
              <ListGroup variant="flush" >
                <ListGroup.Item className="bg-dark text-light">Free setup</ListGroup.Item>
                <ListGroup.Item className="bg-dark text-light">Free training</ListGroup.Item>
                <ListGroup.Item className="bg-dark text-light">No minimum contract</ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer>
              <Button variant="primary">Choose Pro</Button>
            </Card.Footer>
          </Card>
        </Col>
        
        {/* Pricing Card for Enterprise Tier */}
        <Col md={4} className="mb-4 ps-5">
          <Card className="h-100">
            <Card.Header className="bg-secondary text-light">Enterprise</Card.Header>
            <Card.Body className="bg-warning ">
              <Card.Title className="text-center">£90*</Card.Title>
              <Card.Subtitle className="mb-2 text-muted text-center">per month + £500 setup</Card.Subtitle>
              <ListGroup variant="flush">
                <ListGroup.Item className="bg-warning " >Free training</ListGroup.Item>
                <ListGroup.Item className="bg-warning ">No minimum contract</ListGroup.Item>
                <ListGroup.Item className="bg-warning ">Unlimited</ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer className="bg-warning text-white">
              <Button variant="secondary" >Choose Enterprise</Button>
            </Card.Footer>
          </Card>
        </Col>
        
      </Row>
    <Container>
      {/* Footer with Call to Action */}
      <Row className="justify-content-center py-5 mb-4 ps-5 ms-4">
        <Col md={12} className="text-center text-light ">
          <p>All prices are subject to VAT</p>
          <Button variant="info" size="lg" className="bg-warning " href='/Register'>
            Start your 30 days free trial
          </Button>
          <p className="mt-3">
            Want to try Easy Lets? Just book a demo, and ask us for a free trial.
          </p>
        </Col>
      </Row>
      </Container>
    </Container>
    </div>
    <ChatButton/>
    </>
  );
}

export default PricingPage;
