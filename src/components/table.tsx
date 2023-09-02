import { ErrorBoundary } from 'react-error-boundary'
import { SetStateAction, useCallback, useMemo, useState, useTransition, useDeferredValue } from 'react'
import { TableVirtuoso } from 'react-virtuoso'
import { ChevronUpSquare, ChevronDownSquare, Search, XIcon } from 'lucide-react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnResizeMode,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  // TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from './ui/button'
import { DebouncedInput } from './debounced-input'
import { fuzzyFilter } from './fn/fuzzy-filter'
import { DataTableRow } from './data-table-row'
import { Input } from './ui/input'
import { fallbackRender } from './fallback-render'
import { cn } from '@/lib/utils'
import { DataTableFilter } from './data-table-filter'
import React from 'react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('')
  const deferredGlobalFilter = useDeferredValue(globalFilter)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )

  const [isPending, startTransition] = useTransition()
  const transitionSetGlobalFilter = (value: string) => {
    startTransition(() => {
      setGlobalFilter(value)
    })
  }
  const transitionSetSorting = (value: SetStateAction<SortingState>) => {
    startTransition(() => {
      setSorting(value)
    })
  }
  const transitionSetColumnFilters = (col: SetStateAction<ColumnFiltersState>) => {
    startTransition(() => {
      setColumnFilters(col)
    })
  }
  const memoizedColumns = useMemo(() => columns, [columns])
  const memoizedData = useMemo(() => data, [data])

  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    columnResizeMode: 'onEnd',
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      sorting,
      globalFilter: deferredGlobalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 100,
        pageIndex: 0,
      },
    },
    onColumnFiltersChange: transitionSetColumnFilters,
    onSortingChange: transitionSetSorting,
    onGlobalFilterChange: transitionSetGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableGlobalFilter: true,
    enableRowSelection: true,
    debugTable: true,
    // debugHeaders: true,
    // debugColumns: true,
  })

  const fixedHeaderContent = () => {
    return table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => {
          return (
            <TableHead
              key={header.id}
              className="relative"
              style={{ width: header.getSize() }}
            >
              {header.isPlaceholder
                ? null
                : (
                  <>
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none inline-flex'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                          asc: <ChevronUpSquare size={16} className="ml-2" />,
                          desc: <ChevronDownSquare size={16} className="ml-2" />,
                        }[header.column.getIsSorted() as string] ?? null}
                    </div>
                    {header.column.getCanFilter() && (
                      <div>
                        <DataTableFilter
                          column={header.column}
                          firstValue={table.getPreFilteredRowModel().flatRows[0]?.getValue(header.column.id)}
                        />
                      </div>
                    )}
                  </>
                )}
                {header.column.getCanResize() ? (
                  <div
                    {...{
                      onMouseDown: header.getResizeHandler(),
                      onTouchStart: header.getResizeHandler(),
                      className: `absolute top-0 right-0 h-full w-3 hover:bg-accent cursor-col-resize select-none touch-none z-10 ${
                        header.column.getIsResizing() ? 'isResizing' : ''
                      }`,
                      style: {
                        transform: header.column.getIsResizing()
                            ? `translateX(${
                                table.getState().columnSizingInfo.deltaOffset
                              }px)`
                            : '',
                      },
                    }}
                  />
                ) : null}
            </TableHead>
          )
        })}
      </TableRow>
    ))
  }

  return (
    <ErrorBoundary
      fallbackRender={fallbackRender}
      onReset={(details) => {
        // Reset the state of your app so the error doesn't happen again
        console.log('details', details)
      }}
    >
      <div className="bg-white rounded-t-md flex items-center justify-between gap-2 p-4 dark:2xl:px-0">
        <div className="flex-none w-1/4 relative">
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            className="h-9 text-xs border border-block"
            placeholder="Search data..."
            disabled={globalFilter !== deferredGlobalFilter}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-5 w-5 text-primary/50" aria-hidden="true" />
          </div>
        </div>
        <div className="flex flex-1 w-full justify-end items-center space-x-2">
          <span className="flex-1 space-x-2 text-xs">
            <Button
              variant={'outline'}
              size="sm"
              type='button'
              onClick={() => startTransition(() => table.toggleAllRowsSelected(true))}
              className="hover:text-white"
              disabled={globalFilter !== deferredGlobalFilter}
            >
              Select all
            </Button>
            {table.getSelectedRowModel().rows.length ? (
              <>
                <span>{table.getSelectedRowModel().rows.length} rows selected</span>
                <Button
                  variant={'outline'}
                  size="sm"
                  onClick={() => startTransition(() => table.toggleAllRowsSelected(false))}
                  className="hover:text-white"
                >
                  <XIcon size={10} />
                </Button>
              </>
            ) : null}
          </span>
        </div>
      </div>
      <div className={cn(
        "bg-white rounded-md border space-y-3 h-[calc(100vh-2.5rem-56px-0.75rem-180px)]",
        globalFilter !== deferredGlobalFilter ? 'opacity-50' : 'opacity-100'
      )}>
        <TableVirtuoso
          totalCount={table.getRowModel().rows.length}
          components={{
            Table: Table,
            TableBody: TableBody,
            TableRow: TableRow,
            TableHead: TableHeader,
          }}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={(index: number) => { const row = table.getRowModel().rows[index]; return <DataTableRow row={row} />}}
        />
      </div>
      <div className="flex items-center justify-between gap-2 p-4">
        <div className='space-x-2'>
          <Button
            variant={'outline'}
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </Button>
          <Button
            variant={'outline'}
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </Button>
          <Button
            variant={'outline'}
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </Button>
          <Button
            variant={'outline'}
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </Button>
          <span className='text-slate-400'>{table.getPrePaginationRowModel().rows.length} record(s)</span>
        </div>
        <span className="flex items-center gap-1 -translate-x-3">
          <div>Page</div>
          <Input
            type="number"
            value={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="border p-1 rounded w-16 inline-block"
          /> of{' '}
          <strong>
            {table.getPageCount()}
          </strong>
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[100, 200, 300, 500, 1000].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </ErrorBoundary>
  )
}
