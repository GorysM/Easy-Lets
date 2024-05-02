import React, { useState } from 'react';
import { Container, Button, Row, Col, Card, Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavigationBar } from './components/NavBar';
import { MyCarousel } from './components/MyCarousel';
import ChatButton from './components/ChatButton';
import ScrollToTop from './components/ScrollToTop';

function Home() {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleLearnMoreClick = () => {
    setShowFullDescription(!showFullDescription);
  };

  return (
    <>
      <NavigationBar className="navbar" bg="light" expand="lg"  />
<Container className="d-flex justify-content-center align-items-center main-content text-center">
    <Row>
    <Col md={4} className="md-2 pt-5">
    <div style={{ marginTop: '80px' }}>
        <div className="card ms-5" style={{ width: '18rem' }}>
            <a href="#cardSection1">
            <img src="cloud software.png" className="card-img-top clickable-image rounded-circle transition" alt="Cloud software interface"/>
            </a>
            <div className="card-body">
                <h5 className="card-title text-center ps-5 pb-3" style={{ textDecoration: 'underline' }}>Online Software</h5>
                <p className="card-text text-center">Estate Agency Software: Seamlessly manage sales, lettings, property management, and office accounting with our cloud-based solution. Access your business from anywhere, ensuring efficient diary management, valuations, marketing, and sales. Enjoy mobile accessibility and full office accounting integration</p>
            </div>
        </div>
    </div>
</Col>
<Col md={4} className="md-2 pt-5">
    <div style={{ marginTop: '80px' }}>
        <div className="card ms-5 " style={{ width: '18rem' }}>
            <a href="#cardSection2">
                <img src="portal icon.png" className="card-img-top clickable-image rounded-circle transition" alt="portal icon" />
            </a>
            <div className="card-body">
                <h5 className="card-title text-center ps-5 pb-3" style={{ textDecoration: 'underline' }}>Tenant Portal</h5>
                <p className="card-text text-center ">Introducing our Tenant Portal – the convenient, 24/7 online service designed for ease and accessibility. Report maintenance issues, manage payments, and communicate with property management effortlessly. Our portal is engineered to streamline your rental experience, ensuring peace of mind at your fingertips.</p>
            </div>
        </div>
    </div>
</Col>
<Col md={4} className="md-2 pt-5">
    <div style={{ marginTop: '80px' }}>
        <div className="card ms-5" style={{ width: '18rem' }}>
            <a href="#cardSection3">
            <img src="our team.png" className="card-img-top clickable-image rounded-circle transition" alt="Our team"/>
            </a>
            <div className="card-body">
                <h5 className="card-title text-center ps-5 pb-3" style={{ textDecoration: 'underline' }}>Meet our Team</h5>
                <p className="card-text text-center">Our team at Easy Lets is our greatest asset. A vibrant group of dedicated professionals, each bringing their unique expertise and creativity to the table. We are driven by a shared commitment to innovation and excellence that resonates through every project we undertake. Without a success team there is not progress.</p>
            </div>
        </div>
    </div>
</Col>

    </Row>
</Container>


      <Container className="home-block mt-5 d-flex align-items-center justify-content-center">
        <div className="home-info text-center ">
          <h1 className="home-title">Welcome to Easy Lets</h1>
          <div className="home-description">
  {showFullDescription ? (
    <>
      <p>Your Trusted Property Management Partner
        <br />
        At Easy Lets, we redefine the property management experience with a commitment to simplicity, efficiency, and excellence. Our mission is to make property ownership hassle-free, whether you're a homeowner or an investor.
        <br />
        Why Choose Easy Lets?</p>
      <ol>
        <li>Seamless Property Management: Leave the complexities of property management to us. From tenant screening and rent collection to property maintenance, we handle it all, ensuring your property is in excellent condition and your investment is optimized.</li>
        <li>Tenant Satisfaction: Happy tenants make successful tenancies. We prioritize tenant satisfaction by providing prompt and attentive service, addressing concerns promptly, and maintaining open lines of communication.</li>
        <li>Expert Guidance for Landlords: As property owners ourselves, we understand the challenges you face. Benefit from our expertise with personalized advice on market trends, pricing strategies, and property enhancements to maximize your returns.</li>
        <li>Cutting-Edge Technology: Stay connected and informed with our user-friendly online portal. Access real-time financial reports, property updates, and communication logs effortlessly, giving you complete control over your investment.</li>
        <li>Transparent and Competitive Pricing: We believe in fair and transparent pricing. Our competitive rates ensure that you receive top-notch property management services without breaking the bank.</li>
      </ol>
      <p>Whether you're a homeowner seeking stress-free property management or an investor looking to expand your portfolio, Easy Lets is your dedicated partner in real estate success. Discover the ease of property management with us – where managing your property becomes as easy as it gets.
        Contact Easy Lets today and let's embark on a journey of seamless property management together. Your property, our priority.</p>
    </>
  ) : (
    <p>Your Trusted Property Management Partner
      <br />
      At Easy Lets, we redefine the property management experience with a commitment to simplicity, efficiency, and excellence. Our mission is to make property ownership hassle-free, whether you're a homeowner or an investor.
      <br />
      Why Choose Easy Lets?</p>
  )}
</div>

          <Button variant="primary" onClick={handleLearnMoreClick}className="mb-3" >
            {showFullDescription ? 'Show Less' : 'Learn More'}
          </Button>
        </div>
      </Container>

      <MyCarousel className="carousel" />

      <Container className="my-5 pt-5">
        <Row className="service-cards text-center">
          <Col md={6} className="mb-4">
            <div id="cardSection1">
              <Card>
                <Card.Body>
                  <Card.Title>Your Trusted Property Management Partner</Card.Title>
                  <Card.Text>
                    At Easy Lets, we redefine the property management experience with a commitment to simplicity, efficiency, and excellence. Our mission is to make property ownership hassle-free, whether you're a homeowner or an investor.
                    <br />
                    Why Choose Easy Lets?
                    <ol>
                      <li>Seamless Property Management: Leave the complexities of property management to us. From tenant screening and rent collection to property maintenance, we handle it all, ensuring your property is in excellent condition and your investment is optimized.</li>
                      <li>Tenant Satisfaction: Happy tenants make successful tenancies. We prioritize tenant satisfaction by providing prompt and attentive service, addressing concerns promptly, and maintaining open lines of communication.</li>
                      <li>Expert Guidance for Landlords: As property owners ourselves, we understand the challenges you face. Benefit from our expertise with personalized advice on market trends, pricing strategies, and property enhancements to maximize your returns.</li>
                      <li>Cutting-Edge Technology: Stay connected and informed with our user-friendly online portal. Access real-time financial reports, property updates, and communication logs effortlessly, giving you complete control over your investment.</li>
                      <li>Transparent and Competitive Pricing: We believe in fair and transparent pricing. Our competitive rates ensure that you receive top-notch property management services without breaking the bank.</li>
                    </ol>
                    Contact Easy Lets today and let's embark on a journey of seamless property management together. Your property, our priority.
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          </Col>
          <Col md={6} className="mb-4 pt-5">
            <div className="d-flex justify-content-center align-items-center">
              <img
                src="cloud software.png" className="card-img-top rounded-circle" alt="software image" style={{ width: '70%' }}
              />
            </div>
          </Col>
          <Col md={6} className="mb-4 pt-5">
            <div className="d-flex justify-content-center align-items-center">
              <img src="portal icon.png" className="card-img-top rounded-circle" alt="software image" style={{ width: '70%' }}/>
            </div>
          </Col>
          <Col md={6} className="mb-4 pt-5">
            <div id="cardSection2">
              <Card>
                <Card.Body>
                  <Card.Title>Your Trusted Property Management Partner</Card.Title>
                  <Card.Text>
                  Welcome to the comprehensive Tenant Portal of our Property Management Software, where convenience meets functionality. Our user-friendly platform empowers tenants with an array of tools and features that transform property management into a seamless experience.

                  Issue Reporting: Encountered a leaky faucet or a power outage? Report maintenance requests with just a few clicks. Our intuitive interface allows you to describe the issue, upload relevant photos, and submit tickets directly to property management. Track the status of your request and receive updates until resolution, ensuring transparency and efficient communication.

                  Emergency Services: For urgent issues that can't wait, our emergency feature provides immediate assistance. Use the portal to alert property management of critical problems, and we’ll expedite service to ensure your safety and comfort.

                  Payment Management: Say goodbye to paper checks and late payments. Our portal simplifies your rent payment process. Securely link your bank account or credit card, set up automatic payments, and view your payment history. Receive reminders for upcoming dues, so you're always on time.

                  Document Center: Access your lease agreements, property rules, and other important documents anytime. Our digital archive means that the information you need is always available, organized, and easily retrievable.

                  Community Interaction: Stay connected with what's happening in your community. Our portal provides updates on property news, scheduled maintenance, community events, and more.

                  Security and Privacy: We take your privacy seriously. Rest assured, your personal information is protected with top-tier security measures, ensuring your data is safe and confidential.

                  Our Tenant Portal is more than a tool – it's your partner in making rental living worry-free. Experience the ease of modern living with our all-encompassing property management solution.
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          </Col>
          
          <Col md={6} className="mb-5 pt-5">
            <div id="cardSection3">
            <Card>
                <Card.Body>
                  <Card.Title className='pb-5'>Meet our Team</Card.Title>
                  <Carousel interval={3000} indicators={false} controls={true} fade={true}>
                    <Carousel.Item>
                      <img className="d-block w-100" src="person default.png" alt="First team member"style={{ transform: 'scale(0.5)', transformOrigin: 'top' }}/>
                      <Carousel.Caption className='text-dark p-5'>
                        <h3>Chris Summers</h3>
                        <p>Head of Sales & Development UK</p>
                      </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                      <img
                        className="d-block w-100" src="person default1.png" alt="Second team member" style={{ transform: 'scale(0.5)', transformOrigin: 'top' }}/>
                      <Carousel.Caption className='text-dark p-5'>
                        <h3>Archie Love</h3>
                        <p>Director</p>
                      </Carousel.Caption>
                    </Carousel.Item>
                    {/* Add more Carousel.Item components for additional team members */}
                  </Carousel>
                </Card.Body>
              </Card>
            </div>
          </Col>
          <Col md={6} className="mb-4 pt-5">
            <div className="d-flex justify-content-center align-items-center">
              <img src="our team.png" className="card-img-top rounded-circle " alt="software image" style={{ width: '70%' }}/>
            </div>
          </Col>
        </Row>
      </Container>

      <ChatButton/>
      <ScrollToTop/>

      <footer className="footer mt-5 py-3 bg-light">
        <Container>
          <Row>
            <Col className="text-center">
              Contact us at info@easylets.com
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
}

export default Home;
