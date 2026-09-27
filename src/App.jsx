import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBus, setSelectedBus] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    fetchBuses();
  }, []);

  async function fetchBuses() {
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .order('id');

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setBuses(data || []);
    setLoading(false);
  }

  function openBooking(bus) {
    setSelectedBus(bus);
    setPassengerName('');
    setPassengerEmail('');
    setSeatNumber('');
    setBookingMessage('');

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }

  function closeBooking() {
    setSelectedBus(null);
    setBookingMessage('');
  }

  async function confirmBooking() {
    setBookingMessage('');

    if (!passengerName.trim()) {
      setBookingMessage('Please enter passenger name.');
      return;
    }

    if (!passengerEmail.trim()) {
      setBookingMessage('Please enter passenger email.');
      return;
    }

    if (!seatNumber) {
      setBookingMessage('Please enter seat number.');
      return;
    }

    const seat = Number(seatNumber);

    if (seat < 1 || seat > selectedBus.total_seats) {
      setBookingMessage(
        `Seat number must be between 1 and ${selectedBus.total_seats}.`
      );
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          passenger_name: passengerName.trim(),
          passenger_email: passengerEmail.trim(),
          bus_id: selectedBus.id,
          seat_number: seat,
          status: 'confirmed'
        }
      ]);

    if (error) {
      console.error('Booking error:', error);
      setBookingMessage(`Booking failed: ${error.message}`);
      return;
    }

    setBookingMessage('Booking confirmed successfully! 🎉');

    setPassengerName('');
    setPassengerEmail('');
    setSeatNumber('');
  }

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            🚌 <span>Bus<span className="logo-highlight">Go</span></span>
          </div>

          <nav>
            <a href="#home">Home</a>
            <a href="#buses">Buses</a>
            <a href="#booking">Book Ticket</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">
              ✨ Easy & Fast Booking
            </span>

            <h1>
              Travel anywhere,
              <br />
              <span>book your seat.</span>
            </h1>

            <p>
              Find comfortable buses, choose your preferred seat,
              and book your journey in just a few clicks.
            </p>

            <a href="#buses" className="hero-button">
              Explore Buses →
            </a>
          </div>

          <div className="hero-bus">
            🚌
          </div>
        </div>
      </section>

      {/* Bus Section */}
      <section className="bus-section" id="buses">
        <div className="section-heading">
          <span>OUR BUSES</span>
          <h2>Choose your journey</h2>
          <p>Comfortable rides at affordable prices.</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Finding available buses...</p>
          </div>
        ) : (
          <div className="bus-grid">
            {buses.map((bus) => (
              <div className="bus-card" key={bus.id}>

                <div className="bus-card-top">
                  <div className="bus-icon">
                    🚌
                  </div>

                  <div>
                    <h3>{bus.bus_name}</h3>
                    <p className="bus-number">
                      {bus.bus_number}
                    </p>
                  </div>
                </div>

                <div className="route">
                  <div>
                    <strong>{bus.source}</strong>
                    <small>{bus.departure_time}</small>
                  </div>

                  <div className="route-line">
                    <span>●</span>
                    <i></i>
                    <span>●</span>
                  </div>

                  <div className="destination">
                    <strong>{bus.destination}</strong>
                    <small>{bus.arrival_time}</small>
                  </div>
                </div>

                <div className="bus-info">
                  <div>
                    <span>PRICE</span>
                    <strong>₹{bus.price}</strong>
                  </div>

                  <div>
                    <span>SEATS</span>
                    <strong>{bus.total_seats}</strong>
                  </div>
                </div>

                <button
                  className="book-button"
                  onClick={() => openBooking(bus)}
                >
                  Book Ticket
                  <span>→</span>
                </button>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* Booking Section */}
      {selectedBus && (
        <section className="booking-section" id="booking">
          <div className="booking-container">

            <div className="booking-info">
              <span className="booking-label">
                YOUR JOURNEY
              </span>

              <h2>Complete your booking</h2>

              <p>
                Enter your details below to reserve your
                seat on this bus.
              </p>

              <div className="selected-bus">
                <div className="selected-icon">🚌</div>

                <div>
                  <strong>{selectedBus.bus_name}</strong>
                  <span>
                    {selectedBus.source} → {selectedBus.destination}
                  </span>
                </div>
              </div>

              <div className="journey-details">
                <div>
                  <small>DEPARTURE</small>
                  <strong>{selectedBus.departure_time}</strong>
                </div>

                <div>
                  <small>ARRIVAL</small>
                  <strong>{selectedBus.arrival_time}</strong>
                </div>

                <div>
                  <small>PRICE</small>
                  <strong>₹{selectedBus.price}</strong>
                </div>
              </div>
            </div>

            <div className="booking-form">

              <div className="input-group">
                <label>Passenger Name</label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={passengerName}
                  onChange={(e) =>
                    setPassengerName(e.target.value)
                  }
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={passengerEmail}
                  onChange={(e) =>
                    setPassengerEmail(e.target.value)
                  }
                />
              </div>

              <div className="input-group">
                <label>Seat Number</label>

                <input
                  type="number"
                  min="1"
                  max={selectedBus.total_seats}
                  placeholder={`Choose 1 - ${selectedBus.total_seats}`}
                  value={seatNumber}
                  onChange={(e) =>
                    setSeatNumber(e.target.value)
                  }
                />
              </div>

              {bookingMessage && (
                <div
                  className={
                    bookingMessage.includes('confirmed')
                      ? 'message success'
                      : 'message error'
                  }
                >
                  {bookingMessage}
                </div>
              )}

              <button
                className="confirm-button"
                onClick={confirmBooking}
              >
                Confirm Booking
                <span>→</span>
              </button>

              <button
                className="cancel-button"
                onClick={closeBooking}
              >
                Cancel
              </button>

            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="logo">
            🚌 Bus<span className="logo-highlight">Go</span>
          </div>

          <p>
            © 2026 BusGo. Your journey starts here.
          </p>
        </div>
      </footer>

    </div>
  );
}

export default App;