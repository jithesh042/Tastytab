import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Message from '../../components/Message';
import './employeeManagement.css'; // Adjust path if necessary


const EmployeeManagement = ({ restaurantId }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({ _id: '', name: '', age: '', salary: '', bonus: '', email: '', role: 'waiter', password: '', image: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        if (restaurantId) {
            fetchEmployees();
        }
    }, [restaurantId]);

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/employees/${restaurantId}`);
            setEmployees(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm({ ...form, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        try {
            if (isEditing) {
                await api.put(`/employees/${restaurantId}/${form._id}`, form);
                setMessage('Employee updated successfully!');
                setMessageType('success');
            } else {
                await api.post(`/employees/${restaurantId}/add`, form);
                setMessage('Employee added successfully!');
                setMessageType('success');
            }
            setForm({ _id: '', name: '', age: '', salary: '', bonus: '', email: '', role: 'waiter', password: '', image: '' });
            setIsEditing(false);
            fetchEmployees(); // Refresh list
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.message || err.message}`);
            setMessageType('error');
        }
    };

    const handleEdit = (employee) => {
        setForm({ ...employee, password: '' }); // Don't pre-fill password for security
        setIsEditing(true);
    };

    const handleDelete = async (employeeId) => {
        setMessage('');
        setMessageType('');
        if (window.confirm('Are you sure you want to delete this employee? This will also downgrade their user account to customer role.')) {
            try {
                await api.delete(`/employees/${restaurantId}/${employeeId}`);
                setMessage('Employee deleted successfully!');
                setMessageType('success');
                fetchEmployees(); // Refresh list
            } catch (err) {
                setMessage(`Error: ${err.response?.data?.message || err.message}`);
                setMessageType('error');
            }
        }
    };

    if (loading) return <div className="text-center p-8">Loading employees...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    return (
        // Only JSX changes shown below
        <div className="employee-container">
            <h2 className="form-title">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
            <form onSubmit={handleSubmit} className="employee-form">
                <div className="form-grid">
                    <div>
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div>
                        <label htmlFor="password">Password {isEditing ? '(leave blank to keep current)' : '*'}</label>
                        <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required={!isEditing} />
                    </div>
                    <div>
                        <label htmlFor="role">Role:</label>
                        <select id="role" name="role" value={form.role} onChange={handleChange}>
                            <option value="waiter">Waiter</option>
                            <option value="chef">Chef</option>
                            {/* <option value="cashier">Cashier</option> */}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="age">Age:</label>
                        <input type="number" id="age" name="age" value={form.age} onChange={handleChange} />
                    </div>
                    <div>
                        <label htmlFor="salary">Salary:</label>
                        <input type="number" id="salary" name="salary" value={form.salary} onChange={handleChange} step="0.01" />
                    </div>
                    <div>
                        <label htmlFor="bonus">Bonus:</label>
                        <input type="number" id="bonus" name="bonus" value={form.bonus} onChange={handleChange} step="0.01" />
                    </div>
                    <div className="full-width">
                        <label htmlFor="image">Image:</label>
                        <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
                        {form.image && <img src={form.image} alt="Preview" className="preview-image" />}
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn green">{isEditing ? 'Update Employee' : 'Add Employee'}</button>
                    {isEditing && (
                        <button type="button" onClick={() => { setIsEditing(false); setForm({ _id: '', name: '', age: '', salary: '', bonus: '', email: '', role: 'waiter', password: '', image: '' }); }} className="btn gray">
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>

            <Message type={messageType} message={message} />

            <h3 className="list-title">Current Employees</h3>
            {employees.length === 0 ? (
                <p className="no-employees">No employees added yet.</p>
            ) : (
                <div className="table-container">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Salary</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp._id}>
                                    <td><img src={emp.image || 'https://placehold.co/50x50'} alt={emp.name} className="table-img" /></td>
                                    <td>{emp.name}</td>
                                    <td>{emp.user?.email || emp.email}</td>
                                    <td>{emp.role}</td>
                                    <td>${emp.salary?.toFixed(2) || '0.00'}</td>
                                    <td>
                                        <button onClick={() => handleEdit(emp)} className="btn yellow small">Edit</button>
                                        <button onClick={() => handleDelete(emp._id)} className="btn red small">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

    );
};

export default EmployeeManagement;