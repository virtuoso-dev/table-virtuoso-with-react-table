import * as React from 'react'
import { Column } from "@tanstack/react-table"
import { DebouncedInput } from './debounced-input'

export function DataTableFilter({
  column,
  firstValue,
}: {
  column: Column<any, unknown>
  firstValue: unknown
}) {

  const columnFilterValue = column.getFilterValue()

  const sortedUniqueValues = React.useMemo(
    () =>
      typeof firstValue === 'number'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column, firstValue]
  )

  const renderComponent = React.useMemo(
    () =>
      typeof firstValue === 'number'
        ? (
          <div className="flex flex-col space-y-2">
            <DebouncedInput
              type="number"
              min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
              max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
              value={(columnFilterValue as [number, number])?.[0] ?? ''}
              onChange={value =>
                column.setFilterValue((old: [number, number]) => [value, old?.[1]])
              }
              placeholder={`Min ${
                column.getFacetedMinMaxValues()?.[0]
                  ? `(${column.getFacetedMinMaxValues()?.[0]})`
                  : ''
              }`}
            />
            <DebouncedInput
              type="number"
              min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
              max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
              value={(columnFilterValue as [number, number])?.[1] ?? ''}
              onChange={value =>
                column.setFilterValue((old: [number, number]) => [old?.[0], value])
              }
              placeholder={`Max ${
                column.getFacetedMinMaxValues()?.[1]
                  ? `(${column.getFacetedMinMaxValues()?.[1]})`
                  : ''
              }`}
            />
          </div>
        ) : (
          <>
            <datalist id={column.id + 'list'}>
              {sortedUniqueValues.slice(0, 5000).map((value: any) => (
                <option value={value} key={value} />
              ))}
            </datalist>
            <DebouncedInput
              type="text"
              value={(columnFilterValue ?? '') as string}
              onChange={value => column.setFilterValue(value)}
              placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
              list={column.id + 'list'}
              className="placeholder:text-gray-300"
            />
          </>
        )
    , [column, columnFilterValue, firstValue, sortedUniqueValues])


  return renderComponent
}