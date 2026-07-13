import React, {useState} from 'react';
import {DndContext} from '@dnd-kit/core';
import {SortableContext} from '@dnd-kit/sortable';

export function Sortable() {
  const [items] = useState([1, 2, 3]);

  return (
    <DndContext>
      <SortableContext items={items}>
        Hello
      </SortableContext>
    </DndContext>
  );
}