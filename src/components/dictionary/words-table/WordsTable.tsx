'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import Icon from '@/components/common/Icon';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { WordResponse } from '@/lib/types/dictionary';
import { useAppSelector } from '@/redux/hooks';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
// import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  // selectDictionaryStatus,
  selectWords,
} from '@/redux/features/dictionary/selectors';

const columnHelper = createColumnHelper<WordResponse>();

const columns = [
  columnHelper.accessor('en', {
    header: () => (
      <div className="flex items-center justify-between">
        <span>Word</span>
        <Icon
          id="#flag-united-kingdom"
          className="h-8 w-8"
          aria-hidden="true"
        />
      </div>
    ),
  }),
  columnHelper.accessor('ua', {
    header: () => (
      <div className="flex items-center justify-between">
        <span>Translation</span>
        <Icon id="#flag-ukraine" className="h-8 w-8" aria-hidden="true" />
      </div>
    ),
  }),
  columnHelper.accessor('category', {
    header: 'Category',
  }),
  columnHelper.accessor('progress', {
    header: 'Progress',
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <div className="flex items-center">
          <div className="w-[48px] text-right">
            <span>{value}%</span>
          </div>
          <div className="ml-4">
            <ProgressCircle value={value} />
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor('_id', {
    header: '',
    cell: () => (
      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="font-secondary text-[22px] font-semibold px-1"
            >
              ...
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto px-6 py-3 bg-background-white"
            align="end"
          >
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="flex justify-start items-center p-1"
              >
                <Icon
                  id="#edit"
                  className="mr-2 h-5 w-5 stroke-brand-primary fill-none"
                />
                Edit
              </Button>
              <Button
                variant="ghost"
                className="flex justify-start items-center p-1"
              >
                <Icon
                  id="#delete"
                  className="mr-2 h-5 w-5 stroke-brand-primary fill-none"
                />
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    ),
  }),
];

export function WordsTable() {
  // const status = useAppSelector(selectDictionaryStatus);
  const words = useAppSelector(selectWords);

  const table = useReactTable({
    data: words.results,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // if (status === 'loading') {
  //   return (
  //     <div className="flex justify-center items-center h-[400px] rounded-[15px] bg-background-white">
  //       <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
  //     </div>
  //   );
  // }

  if (words.results.length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px] rounded-[15px] bg-background-white">
        <p className="font-primary text-lg text-text-secondary">
          No words found
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[15px] bg-background-white p-[18px]">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <th
                  key={header.id}
                  className={cn(
                    'rounded-none border-b border-table-border bg-table-row p-[22px] text-left font-primary text-xl font-medium',
                    index === 0
                      ? 'rounded-tl-lg'
                      : 'border-l border-table-border',
                    index === headerGroup.headers.length - 1
                      ? 'rounded-tr-lg'
                      : 'border-r border-table-border'
                  )}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, index) => (
                <td
                  key={cell.id}
                  className={cn(
                    'border-b border-table-border p-[22px] font-primary text-base bg-table-cell',
                    index === 0 ? '' : 'border-l border-table-border',
                    index === row.getVisibleCells().length - 1
                      ? ''
                      : 'border-r border-table-border',
                    index === 0 &&
                      row.index === table.getRowModel().rows.length - 1
                      ? 'rounded-bl-lg'
                      : '',
                    index === row.getVisibleCells().length - 1 &&
                      row.index === table.getRowModel().rows.length - 1
                      ? 'rounded-br-lg'
                      : ''
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
