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
  const [filter, setFilter] = useState<{ status: string; priority: string }>({ status: "", priority: "" });
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredTickets = tickets.filter(ticket =>
    (filter.status ? ticket.status === filter.status : true) &&
    (filter.priority ? ticket.priority === filter.priority : true) &&
    (searchTerm ? ticket.projectName.toLowerCase().includes(searchTerm) || ticket.description.toLowerCase().includes(searchTerm) : true)
  );

  return (
    <div>
      <h2>Filter & Search Tickets</h2>
      <input placeholder="Search by project or description" onChange={handleSearchChange} />
      <select name="status" value={filter.status} onChange={handleFilterChange}>
        <option value="">All Statuses</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Closed">Closed</option>
      </select>
      <select name="priority" value={filter.priority} onChange={handleFilterChange}>
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <h2>Tickets</h2>
      {filteredTickets.map(ticket => (
        <div key={ticket.id} className="card">
          <p><strong>Project:</strong> {ticket.projectName}</p>
          <p><strong>Status:</strong> {ticket.status}</p>
          <button onClick={() => archiveTicket(ticket.id)}>Archive</button>
        </div>
      ))}
    </div>
  );
}
