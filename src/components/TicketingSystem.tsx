import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./TicketingSystem.css";

// Define the Ticket type
interface Ticket {
  id: number;
  projectName: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Closed";
  assignedTo: string;
  dueDate: string;
}

export default function TicketingSystem() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const savedTickets = localStorage.getItem("tickets");
    return savedTickets ? JSON.parse(savedTickets) : [];
  });
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>(() => {
    const savedArchived = localStorage.getItem("archivedTickets");
    return savedArchived ? JSON.parse(savedArchived) : [];
  });

  useEffect(() => {
    localStorage.setItem("tickets", JSON.stringify(tickets));
    localStorage.setItem("archivedTickets", JSON.stringify(archivedTickets));
  }, [tickets, archivedTickets]);

  const addTicket = (newTicket: Ticket) => {
    if (tickets.some(ticket => ticket.projectName === newTicket.projectName)) {
      alert("A ticket with this project name already exists.");
      return;
    }
    setTickets([...tickets, { ...newTicket, id: Date.now() }]);
  };

  const archiveTicket = (id: number) => {
    const ticketToArchive = tickets.find(ticket => ticket.id === id);
    if (!ticketToArchive) return;
    setArchivedTickets([...archivedTickets, ticketToArchive]);
    setTickets(tickets.filter(ticket => ticket.id !== id));
  };

  return (
    <Router>
      <div className="container">
        <nav>
          <Link to="/create">Create Ticket</Link>
          <Link to="/tickets">Tickets</Link>
          <Link to="/archive">Archive</Link>
        </nav>
        <Routes>
          <Route path="/create" element={<CreateTicket addTicket={addTicket} />} />
          <Route path="/tickets" element={<Tickets tickets={tickets} archiveTicket={archiveTicket} />} />
          <Route path="/archive" element={<Archive archivedTickets={archivedTickets} />} />
        </Routes>
      </div>
    </Router>
  );
}

function CreateTicket({ addTicket }: { addTicket: (ticket: Ticket) => void }) {
  const [newTicket, setNewTicket] = useState<Ticket>({
    id: 0,
    projectName: "",
    description: "",
    priority: "Medium",
    status: "Open",
    assignedTo: "",
    dueDate: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTicket(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card">
      <h2>Create New Ticket</h2>
      <input placeholder="Project Name" name="projectName" value={newTicket.projectName} onChange={handleInputChange} />
      <textarea placeholder="Description" name="description" value={newTicket.description} onChange={handleInputChange} />
      <button onClick={() => addTicket(newTicket)}>Add Ticket</button>
    </div>
  );
}

function Tickets({ tickets, archiveTicket }: { tickets: Ticket[], archiveTicket: (id: number) => void }) {
  return (
    <div>
      <h2>Tickets</h2>
      {tickets.map(ticket => (
        <div key={ticket.id} className="card">
          <p><strong>Project:</strong> {ticket.projectName}</p>
          <p><strong>Status:</strong> {ticket.status}</p>
          <button onClick={() => archiveTicket(ticket.id)}>Archive</button>
        </div>
      ))}
    </div>
  );
}

function Archive({ archivedTickets }: { archivedTickets: Ticket[] }) {
  return (
    <div>
      <h2>Archived Tickets</h2>
      {archivedTickets.map(ticket => (
        <div key={ticket.id} className="card">
          <p><strong>Project:</strong> {ticket.projectName}</p>
          <p><strong>Status:</strong> {ticket.status}</p>
        </div>
      ))}
    </div>
  );
}
