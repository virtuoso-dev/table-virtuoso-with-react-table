import { useMemo } from 'react'
import { Row, flexRender } from "@tanstack/react-table"
import { TableCell } from "./ui/table"
import { cn } from "@/lib/utils"

function TableTd({ cell }: { cell: any }) {
  // const [isPending, startTransition] = useTransition()
  const renderCell = useMemo(() => {
    return flexRender(cell.column.columnDef.cell, cell.getContext())
  }, [cell])
  const transitionsGetSize = useMemo(() => {
    return cell.column.getSize()
  }, [cell])

  return (
    <TableCell
      key={cell.id}
      style={{ width: transitionsGetSize }}
      className={cn(
        "p-2 [&:has([role=checkbox])]:pr-0",
        cell.row.getIsSelected() && "bg-primary text-white"
      )}
    >
      {renderCell}
    </TableCell>
  )
}

export function DataTableRow({ row }: { row: Row<any> }) {
  const renderRow = useMemo(() => {
    if (!row) return null
    return row.getVisibleCells().map((cell) => <TableTd key={cell.id} cell={cell} />)
  }, [row])
  return renderRow
}