import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ticketing System</h1>
      
      <Card className="p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Create New Ticket</h2>
        <Input placeholder="Project Name" name="projectName" value={newTicket.projectName} onChange={handleInputChange} className="mb-2" />
        <Textarea placeholder="Description" name="description" value={newTicket.description} onChange={handleInputChange} className="mb-2" />
        <Select name="priority" value={newTicket.priority} onChange={handleInputChange} className="mb-2">
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </Select>
        <Select name="status" value={newTicket.status} onChange={handleInputChange} className="mb-2">
          <SelectItem value="Open">Open</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
        </Select>
        <Input placeholder="Assigned To" name="assignedTo" value={newTicket.assignedTo} onChange={handleInputChange} className="mb-2" />
        <Input type="date" name="dueDate" value={newTicket.dueDate} onChange={handleInputChange} className="mb-2" />
        <Button onClick={addTicket}>Add Ticket</Button>
      </Card>

      <h2 className="text-xl font-semibold mb-2">Filter & Search Tickets</h2>
      <Input placeholder="Search by project or description" onChange={handleSearchChange} className="mb-2" />
      <Select name="status" value={filter.status} onChange={handleFilterChange} className="mb-2">
        <SelectItem value="">All Statuses</SelectItem>
        <SelectItem value="Open">Open</SelectItem>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Closed">Closed</SelectItem>
      </Select>
      <Select name="priority" value={filter.priority} onChange={handleFilterChange} className="mb-2">
        <SelectItem value="">All Priorities</SelectItem>
        <SelectItem value="Low">Low</SelectItem>
        <SelectItem value="Medium">Medium</SelectItem>
        <SelectItem value="High">High</SelectItem>
      </Select>
      <Select name="sortBy" value={sortBy} onChange={handleSortChange} className="mb-4">
        <SelectItem value="dueDate">Sort by Due Date</SelectItem>
        <SelectItem value="priority">Sort by Priority</SelectItem>
        <SelectItem value="status">Sort by Status</SelectItem>
      </Select>
      
      <h2 className="text-xl font-semibold mb-2">Tickets</h2>
      {filteredTickets.map((ticket) => (
        <Card key={ticket.id} className="mb-2 p-4">
          <CardContent>
            <p><strong>Project:</strong> {ticket.projectName}</p>
            <p><strong>Description:</strong> {ticket.description}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Assigned To:</strong> {ticket.assignedTo}</p>
            <p><strong>Due Date:</strong> {ticket.dueDate}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}