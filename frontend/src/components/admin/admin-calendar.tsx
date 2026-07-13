'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useRouter } from 'next/navigation';

export function AdminCalendar() {

  const router = useRouter()

  return (
    <div className='bg-black'>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={[{ title: 'R1 Placements Finalised', date: '2025-06-01' }]}
        height={600}
        eventColor="#43A047"
        customButtons={{
          createDeadline: {
            text: 'New Deadline',
            click: () => { router.push('/admin-dashboard/new-deadline') },
          },
        }}
        headerToolbar={{
          start: "createDeadline",
          center: "title",
          end: "today prev,next",
        }}
      />
    </div>
  );
}
