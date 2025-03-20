import { useState, useEffect } from "react";
import "./TicketingSystem.css";

export default function TicketingSystem() {
  const [tickets, setTickets] = useState(() => {
    const savedTickets = localStorage.getItem("tickets");
    return savedTickets ? JSON.parse(savedTickets) : [];
  });
  const [newTicket, setNewTicket] = useState({
    projectName: "",
    description: "",
    priority: "Medium",
    status: "Open",
    assignedTo: "",
    dueDate: "",
  });
  const [filter, setFilter] = useState({ status: "", priority: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");

  useEffect(() => {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }, [tickets]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicket((prev) => ({ ...prev, [name]: value }));
  };

  const addTicket = () => {
    setTickets([...tickets, { ...newTicket, id: Date.now() }]);
    setNewTicket({ projectName: "", description: "", priority: "Medium", status: "Open", assignedTo: "", dueDate: "" });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredTickets = tickets.filter(ticket =>
    (filter.status ? ticket.status === filter.status : true) &&
    (filter.priority ? ticket.priority === filter.priority : true) &&
    (searchTerm ? ticket.projectName.toLowerCase().includes(searchTerm) || ticket.description.toLowerCase().includes(searchTerm) : true)
  ).sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1);

  return (
    <div className="container">
      <h1>Ticketing System</h1>
      
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
        <button onClick={addTicket}>Add Ticket</button>
      </div>

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
      <select name="sortBy" value={sortBy} onChange={handleSortChange}>
        <option value="dueDate">Sort by Due Date</option>
        <option value="priority">Sort by Priority</option>
        <option value="status">Sort by Status</option>
      </select>
      
      <h2>Tickets</h2>
      {filteredTickets.map((ticket) => (
        <div key={ticket.id} className="card">
          <p><strong>Project:</strong> {ticket.projectName}</p>
          <p><strong>Description:</strong> {ticket.description}</p>
          <p><strong>Priority:</strong> {ticket.priority}</p>
          <p><strong>Status:</strong> {ticket.status}</p>
          <p><strong>Assigned To:</strong> {ticket.assignedTo}</p>
          <p><strong>Due Date:</strong> {ticket.dueDate}</p>
        </div>
      ))}
    </div>
  );
}
