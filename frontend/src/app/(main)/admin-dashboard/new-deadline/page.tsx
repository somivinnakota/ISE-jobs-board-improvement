'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDeadlinePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Admin');
   const [notification, setNotification] = useState('None');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/deadlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, type, name, description }),
    });

    if (res.ok) {
      router.push('/admin-dashboard');
    } else {
      alert('Failed to create deadline');
    }
  };

  return (
    <main className="pt-24 px-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Deadline</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            className="w-full p-2 border"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input
            type="date"
            className="w-full p-2 border"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select
            className="w-full p-2 border"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="Admin">Admin</option>
            <option value="Residency Partner">Residency Partner</option>
            <option value="Student">Student</option>
          </select>
        </div>

        {/* Notification */}
        <div>
          <label className="block mb-1 font-medium">Notification</label>
          <select
            className="w-full p-2 border rounded"
            value={notification}
            onChange={(e) => setNotification(e.target.value)}
            required
          >
            <option value="None">None</option>
            <option value="Jobs Board">Jobs Board</option>
            <option value="Email">Email</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full p-2 border min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 mr-4">
          Submit Deadline
        </button>
        <button 
            onClick={ () => { router.push("/admin-dashboard") } }
            className="bg-green-600 text-white px-4 py-2 hover:bg-green-700">
          Cancel
        </button>
      </form>
    </main>
  );
}
