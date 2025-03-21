import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./TicketingSystem.css";
import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

// Define the Ticket type
interface Ticket {
  id: string;
  projectName: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Closed";
  assignedTo: string;
  dueDate: string;
}

export default function TicketingSystem() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tickets"), (snapshot) => {
      const ticketsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Ticket[];
      setTickets(ticketsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "archivedTickets"), (snapshot) => {
      const archivedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Ticket[];
      setArchivedTickets(archivedData);
    });
    return () => unsubscribe();
  }, []);

  const addTicket = async (newTicket: Ticket) => {
    if (newTicket.projectName && tickets.some(t => t.projectName === newTicket.projectName)) {
      alert("A ticket with this project name already exists.");
      return;
    }
    const { id, ...data } = newTicket;
    await addDoc(collection(db, "tickets"), data);
  };

  const archiveTicket = async (id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    await addDoc(collection(db, "archivedTickets"), ticket);
    await deleteDoc(doc(db, "tickets", id));
  };

  const deleteArchivedTicket = async (id: string) => {
    await deleteDoc(doc(db, "archivedTickets", id));
  };

  const updateTicketStatus = async (id: string, newStatus: Ticket["status"]) => {
    await updateDoc(doc(db, "tickets", id), { status: newStatus });
  };

  return (
    <Router>
      <div className="container">
        <header className="header">
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>&#9776;</button>
          <h1 className="title">BBCo Workday Ticketing System</h1>
        </header>
        {menuOpen && (
          <nav className="menu">
            <Link to="/create" onClick={() => setMenuOpen(false)}>Create Ticket</Link>
            <Link to="/tickets" onClick={() => setMenuOpen(false)}>Tickets</Link>
            <Link to="/archive" onClick={() => setMenuOpen(false)}>Archive</Link>
          </nav>
        )}
        <div className="content">
          <Routes>
            <Route path="/create" element={<CreateTicket addTicket={addTicket} />} />
            <Route path="/tickets" element={
              <Tickets
                tickets={tickets}
                archiveTicket={archiveTicket}
                updateTicketStatus={updateTicketStatus}
              />
            } />
            <Route path="/archive" element={
              <ArchivedTickets
                archivedTickets={archivedTickets}
                deleteArchivedTicket={deleteArchivedTicket}
              />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function CreateTicket({ addTicket }: { addTicket: (ticket: Ticket) => void }) {
  const initialTicketState: Ticket = {
    id: "",
    projectName: "",
    description: "",
    priority: "Medium",
    status: "Open",
    assignedTo: "",
    dueDate: "",
  };

  const [newTicket, setNewTicket] = useState<Ticket>(initialTicketState);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTicket((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTicket = () => {
    addTicket(newTicket);
    setNewTicket(initialTicketState);
  };

  return (
    <div className="card">
      <h2>Create New Ticket</h2>
      <input placeholder="Project Name" name="projectName" value={newTicket.projectName} onChange={handleInputChange} />
      <textarea placeholder="Description" name="description" value={newTicket.description} onChange={handleInputChange} />
      <select name="priority" value={newTicket.priority} onChange={handleInputChange}>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <select name="status" value={newTicket.status} onChange={handleInputChange}>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Closed">Closed</option>
      </select>
      <input placeholder="Assigned To" name="assignedTo" value={newTicket.assignedTo} onChange={handleInputChange} />
      <input type="date" name="dueDate" value={newTicket.dueDate} onChange={handleInputChange} />
      <button onClick={handleAddTicket}>Add Ticket</button>
    </div>
  );
}

function Tickets({
  tickets,
  archiveTicket,
  updateTicketStatus,
}: {
  tickets: Ticket[];
  archiveTicket: (id: string) => void;
  updateTicketStatus: (id: string, newStatus: "Open" | "In Progress" | "Closed") => void;
}) {
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({ status: "", priority: "" });

  const filteredTickets = tickets.filter((ticket) =>
    ticket.projectName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filter.status ? ticket.status === filter.status : true) &&
    (filter.priority ? ticket.priority === filter.priority : true)
  );

  return (
    <div>
      <h2>Tickets</h2>
      <input
        type="text"
        placeholder="Search by Project Name"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
        <option value="">All Statuses</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Closed">Closed</option>
      </select>
      <select onChange={(e) => setFilter({ ...filter, priority: e.target.value })}>
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      {filteredTickets.map((ticket) => (
        <div key={ticket.id} className="card">
          <p>
            <strong>Project:</strong> {ticket.projectName}
          </p>
          <button onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}>
            {expandedTicket === ticket.id ? "Collapse" : "Expand"}
          </button>
          {expandedTicket === ticket.id && (
            <div>
              <p><strong>Description:</strong> {ticket.description}</p>
              <p><strong>Priority:</strong> {ticket.priority}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
              <select
                value={ticket.status}
                onChange={(e) =>
                  updateTicketStatus(ticket.id, e.target.value as "Open" | "In Progress" | "Closed")
                }
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
              <p><strong>Assigned To:</strong> {ticket.assignedTo}</p>
              <p><strong>Due Date:</strong> {ticket.dueDate}</p>
              <button onClick={() => archiveTicket(ticket.id)}>Archive</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ArchivedTickets({
  archivedTickets,
  deleteArchivedTicket,
}: {
  archivedTickets: Ticket[];
  deleteArchivedTicket: (id: string) => void;
}) {
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({ status: "", priority: "" });

  const filteredArchived = archivedTickets.filter((ticket) =>
    ticket.projectName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filter.status ? ticket.status === filter.status : true) &&
    (filter.priority ? ticket.priority === filter.priority : true)
  );

  return (
    <div>
      <h2>Archived Tickets</h2>
      <input
        type="text"
        placeholder="Search by Project Name"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
        <option value="">All Statuses</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Closed">Closed</option>
      </select>
      <select onChange={(e) => setFilter({ ...filter, priority: e.target.value })}>
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      {filteredArchived.map((ticket) => (
        <div key={ticket.id} className="card">
          <p>
            <strong>Project:</strong> {ticket.projectName}
          </p>
          <button onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}>
            {expandedTicket === ticket.id ? "Collapse" : "Expand"}
          </button>
          <button onClick={() => deleteArchivedTicket(ticket.id)}>Delete</button>
          {expandedTicket === ticket.id && (
            <div>
              <p><strong>Description:</strong> {ticket.description}</p>
              <p><strong>Priority:</strong> {ticket.priority}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
              <p><strong>Assigned To:</strong> {ticket.assignedTo}</p>
              <p><strong>Due Date:</strong> {ticket.dueDate}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
