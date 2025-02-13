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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type WordsTableProps = {
  words: WordResponse[];
  isLoading: boolean;
} & (
  | { variant: 'dictionary' }
  | {
      variant: 'recommend';
      onWordAdd: (wordId: string) => Promise<void>;
      addingWordIds?: string[];
    }
);

const columnHelper = createColumnHelper<WordResponse>();

const baseCellStyles = 'p-[22px] font-primary text-base';
const tableBorderStyles = 'border-b border-table-border';

const columnWidths = {
  dictionary: {
    word: 'w-[25%] min-w-[180px]',
    translation: 'w-[25%] min-w-[180px]',
    category: 'w-[20%] min-w-[140px]',
    progress: 'w-[15%] min-w-[120px]',
    actions: 'w-[15%] min-w-[100px]',
  },
  recommend: {
    word: 'w-[30%] min-w-[200px]',
    translation: 'w-[30%] min-w-[200px]',
    category: 'w-[20%] min-w-[140px]',
    actions: 'w-[20%] min-w-[160px]',
  },
} as const;

export function WordsTable(props: WordsTableProps) {
  const { variant, words, isLoading } = props;

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
      cell: (info) => (
        <div className="truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
      size: 25,
    }),
    columnHelper.accessor('ua', {
      header: () => (
        <div className="flex items-center justify-between">
          <span>Translation</span>
          <Icon id="#flag-ukraine" className="h-8 w-8" aria-hidden="true" />
        </div>
      ),
      cell: (info) => (
        <div className="truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
      size: 25,
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: (info) => (
        <div className="truncate capitalize" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
      size: 20,
    }),
    ...(variant === 'dictionary'
      ? [
          columnHelper.accessor('progress', {
            header: 'Progress',
            cell: ({ getValue }) => {
              const value = getValue();
              return (
                <div className="flex items-center justify-end">
                  <div className="w-[48px] text-right">
                    <span>{value}%</span>
                  </div>
                  <div className="ml-4">
                    <ProgressCircle value={value} />
                  </div>
                </div>
              );
            },
            size: 15,
          }),
        ]
      : []),
    columnHelper.accessor('_id', {
      header: '',
      cell: ({ getValue }) => {
        const id = getValue();
        if (variant === 'dictionary') {
          return (
            <div className="flex justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="font-secondary text-[22px] font-semibold px-1 h-10 w-10"
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
                      className="flex justify-start items-center p-1 w-full"
                    >
                      <Icon
                        id="#edit"
                        className="mr-2 h-5 w-5 stroke-brand-primary fill-none"
                      />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex justify-start items-center p-1 w-full"
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
          );
        }

        const isAdding =
          variant === 'recommend' && props.addingWordIds?.includes(id);

        return (
          <Button
            variant="ghost"
            className="flex items-center gap-2 font-primary text-base font-medium text-text-primary transition-colors duration-200 hover:text-brand-primary h-10"
            onClick={() => variant === 'recommend' && props.onWordAdd(id)}
            disabled={isAdding}
          >
            <span className="truncate">Add to dictionary</span>
            {isAdding ? (
              <Loader2 className="h-5 w-5 animate-spin shrink-0" />
            ) : (
              <Icon
                id="#arrow-right"
                className="h-5 w-5 stroke-brand-primary fill-none shrink-0"
                aria-hidden="true"
              />
            )}
          </Button>
        );
      },
      size: 15,
    }),
  ];

  const table = useReactTable({
    data: words,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const TableWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-[15px] bg-background-white p-[18px] min-h-[400px]">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[800px] border-separate border-spacing-0">
          {children}
        </table>
      </div>
    </div>
  );

  if (isLoading || (!words.length && !table.getRowModel().rows.length)) {
    return (
      <TableWrapper>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <th
                  key={header.id}
                  className={cn(
                    baseCellStyles,
                    tableBorderStyles,
                    'bg-table-row text-left font-primary text-xl font-medium',
                    columnWidths[variant][
                      header.id as keyof (typeof columnWidths)[typeof variant]
                    ],
                    index === 0 && 'rounded-tl-lg',
                    index === headerGroup.headers.length - 1 && 'rounded-tr-lg',
                    index !== 0 && 'border-l border-table-border'
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
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <tr key={rowIndex} className="h-[74px]">
              {Array.from({ length: columns.length }).map((_, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(
                    baseCellStyles,
                    tableBorderStyles,
                    'bg-table-cell',
                    columnWidths[variant][
                      Object.keys(columnWidths[variant])[
                        colIndex
                      ] as keyof (typeof columnWidths)[typeof variant]
                    ],
                    colIndex !== 0 && 'border-l border-table-border',
                    colIndex === 0 && rowIndex === 2 && 'rounded-bl-lg',
                    colIndex === columns.length - 1 &&
                      rowIndex === 2 &&
                      'rounded-br-lg'
                  )}
                >
                  <div className="h-6 bg-gray-100 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    );
  }

  if (!isLoading && words.length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px] rounded-[15px] bg-background-white">
        <p className="font-primary text-lg text-text-secondary">
          No words found
        </p>
      </div>
    );
  }

  return (
    <TableWrapper>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, index) => (
              <th
                key={header.id}
                className={cn(
                  baseCellStyles,
                  tableBorderStyles,
                  'bg-table-row text-left font-primary text-xl font-medium',
                  columnWidths[header.id as keyof typeof columnWidths],
                  index === 0 && 'rounded-tl-lg',
                  index === headerGroup.headers.length - 1 && 'rounded-tr-lg',
                  index !== 0 && 'border-l border-table-border'
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
          <tr key={row.id} className="h-[74px]">
            {row.getVisibleCells().map((cell, index) => (
              <td
                key={cell.id}
                className={cn(
                  baseCellStyles,
                  tableBorderStyles,
                  'bg-table-cell',
                  columnWidths[variant][
                    Object.keys(columnWidths[variant])[
                      index
                    ] as keyof (typeof columnWidths)[typeof variant]
                  ],
                  index !== 0 && 'border-l border-table-border',
                  index === 0 &&
                    row.index === table.getRowModel().rows.length - 1 &&
                    'rounded-bl-lg',
                  index === row.getVisibleCells().length - 1 &&
                    row.index === table.getRowModel().rows.length - 1 &&
                    'rounded-br-lg'
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
}
