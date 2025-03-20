import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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
  const [menuOpen, setMenuOpen] = useState(false);

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
            <Route path="/tickets" element={<Tickets tickets={tickets} archiveTicket={archiveTicket} />} />
            <Route path="/archive" element={<ArchivedTickets archivedTickets={archivedTickets} />} />
          </Routes>
        </div>
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
    setNewTicket((prev) => ({ ...prev, [name]: value }));
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
      <button onClick={() => addTicket(newTicket)}>Add Ticket</button>
    </div>
  );
}
function Tickets({ tickets, archiveTicket }: { tickets: Ticket[], archiveTicket: (id: number) => void }) {
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({ status: "", priority: "" });

  const filteredTickets = tickets.filter(ticket =>
    ticket.projectName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filter.status ? ticket.status === filter.status : true) &&
    (filter.priority ? ticket.priority === filter.priority : true)
  );

  return (
    <div>
      <h2>Tickets</h2>
      <input type="text" placeholder="Search by Project Name" onChange={(e) => setSearchTerm(e.target.value)} />
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
      {filteredTickets.map(ticket => (
        <div key={ticket.id} className="card">
          <p><strong>Project:</strong> {ticket.projectName}</p>
          <button onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}>
            {expandedTicket === ticket.id ? "Collapse" : "Expand"}
          </button>
          {expandedTicket === ticket.id && (
            <div>
              <p><strong>Description:</strong> {ticket.description}</p>
              <p><strong>Priority:</strong> {ticket.priority}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
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

function ArchivedTickets({ archivedTickets }: { archivedTickets: Ticket[] }) {
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({ status: "", priority: "" });

  const filteredArchived = archivedTickets.filter(ticket =>
    ticket.projectName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filter.status ? ticket.status === filter.status : true) &&
    (filter.priority ? ticket.priority === filter.priority : true)
  );

  return (
    <div>
      <h2>Archived Tickets</h2>
      <input type="text" placeholder="Search by Project Name" onChange={(e) => setSearchTerm(e.target.value)} />
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
      {filteredArchived.map(ticket => (
        <div key={ticket.id} className="card">
          <p><strong>Project:</strong> {ticket.projectName}</p>
          <button onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}>
            {expandedTicket === ticket.id ? "Collapse" : "Expand"}
          </button>
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
