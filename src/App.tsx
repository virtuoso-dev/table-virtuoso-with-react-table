import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table'

import { makeData, Person } from '@/data'
import { DataTable } from '@/components/table'
import './index.css';

function App() {
  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 60,
      },
      {
        accessorKey: 'firstName',
        cell: info => info.getValue(),
      },
      {
        accessorFn: row => row.lastName,
        id: 'lastName',
        cell: info => info.getValue(),
        header: () => <span>Last Name</span>,
      },
      {
        accessorKey: 'age',
        header: () => 'Age',
        size: 50,
      },
      {
        accessorKey: 'visits',
        header: () => <span>Visits</span>,
        size: 50,
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        accessorKey: 'progress',
        header: 'Profile Progress',
        size: 80,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: info => info.getValue<Date>().toLocaleString(),
      },
    ],
    []
  )

  const [data, setData] = useState(() => makeData(50000))
  return (
    <div className="bg-gray-100 container max-w-lg">
      <DataTable columns={columns} data={data} />
    </div>
  );
}

export default App;
